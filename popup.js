work();

async function work() {

    // License key 6CmD5IVpbh39wGkNMzAZ0di529yB4JsY
    // Checking if the trial is started or purchased!
    let purchased = await chrome.storage.sync.get(["purchaseInformation", "trialActivated"]);
    let trialValid = false;
    let trialExpired = false;

    if (purchased.trialActivated) {
        let trialActivatedDate = new Date(purchased.trialActivated);
        let trialExpirationDate = new Date();
        trialExpirationDate.setDate(trialActivatedDate.getDate() + 3);
        let todayDate = new Date();
        trialValid = todayDate <= trialExpirationDate;
        trialExpired = todayDate > trialExpirationDate;
        // todo: Delete the following lines. They are for testing.
                trialValid = false;
                trialExpired = true;

        if (trialValid) {
            let trialOptionsContainer = document.getElementById("trialOptionsContainer");
            let trialExpirationDateSpan = document.getElementById("trialExpirationDateSpan")
            trialOptionsContainer.style.removeProperty("display");
            trialExpirationDateSpan.innerText = trialExpirationDate.toLocaleString();
        }

        if (trialExpired) {
            let trialExpirationModalBadge = document.getElementById("trialExpirationModalBadge");
            let trialExpirationDateModalSpan = document.getElementById("trialExpirationDateModalSpan")
            trialExpirationModalBadge.style.removeProperty("display");
            trialExpirationDateModalSpan.innerText = trialExpirationDate.toLocaleString();
            let tryItButton = document.getElementById("tryItButton");
            tryItButton.style.display = "none";
            let tryMention = document.getElementById("tryMention");
            tryMention.style.display = "none";
        }
    }

    if (!trialValid && !purchased.purchaseInformation) {
        let purchasingModal = new bootstrap.Modal(document.getElementById('purchasingModal'));
        purchasingModal.show();
    }

    let result = await chrome.storage.sync.get(["pauseDuration", "pauseInterval"])

    let wrongSiteBadge = document.getElementById("wrongSiteBadge")
    let enableInterruptionButton = document.getElementById("enableInterruption");

    let rightAddress = await onRightAddress();
    console.log(rightAddress);

    if (rightAddress) {
        wrongSiteBadge.style.display = "none";
        enableInterruptionButton.disabled = false;
    } else {
        wrongSiteBadge.style.removeProperty("display")
        enableInterruptionButton.disabled = true;
    }

    let pauseDurationInput = document.getElementById("pauseDurationInput");
    let pauseIntervalInput = document.getElementById("pauseIntervalInput");

    pauseDurationInput.value = result.pauseDuration;
    pauseIntervalInput.value = result.pauseInterval;

    let pauseDurationMessage = document.getElementById("pauseDurationMessage");
    let pauseIntervalMessage = document.getElementById("pauseIntervalMessage");

    pauseDurationMessage.innerText = pauseDurationInput.value;
    pauseIntervalMessage.innerText = pauseIntervalInput.value;

    pauseDurationInput.addEventListener("change", () => {
        if (pauseDurationInput.value !== "") {
            pauseDurationMessage.innerText = pauseDurationInput.value;
        } else {
            pauseDurationMessage.innerText = "?";
        }
    });

    pauseIntervalInput.addEventListener("change", () => {
        if (pauseIntervalInput.value !== "") {
            pauseIntervalMessage.innerText = pauseIntervalInput.value;
        } else {
            pauseIntervalMessage.innerText = "?";
        }
    });

    // Updating the page cosmetics depending on the saved interruption enabled state.
    chrome.storage.sync.get("interruptedTabs").then(async (result) => {
        let currentTab = await getCurrentTab();

        let interruptedTabIndex = result.interruptedTabs
            .findIndex(a => a.tabId === currentTab.id && a.windowId === currentTab.windowId);

        let currentState = interruptedTabIndex > -1;

        updateEnableButtonCosmetics(currentState);
    });

    enableInterruptionButton.addEventListener("click", async () => {
        if (pauseDurationInput.value === "" || pauseIntervalInput.value === "") {
            return;
        }
        let interruptedTabs = (await chrome.storage.sync.get("interruptedTabs")).interruptedTabs;
        let currentTab = await getCurrentTab();

        console.log(interruptedTabs);

        let interruptedTabIndex = interruptedTabs
            .findIndex(a => a.tabId === currentTab.id && a.windowId === currentTab.windowId);

        let currentState = interruptedTabIndex > -1;

        if (currentState) {
            interruptedTabs.splice(interruptedTabIndex, 1);
        } else {
            interruptedTabs.push({
                tabId: currentTab.id,
                windowId: currentTab.windowId
            });
        }

        updateEnableButtonCosmetics(!currentState);

        await chrome.storage.sync.set({
            pauseInterval: parseInt(pauseIntervalInput.value),
            pauseDuration: parseInt(pauseDurationInput.value),
            interruptedTabs: interruptedTabs
        })

        let message = {
            enabled: !currentState,
            pauseInterval: parseInt(pauseIntervalInput.value),
            pauseDuration: parseInt(pauseDurationInput.value)
        };

        chrome.tabs.sendMessage(currentTab.id, message);
    });

    async function getCurrentTab() {
        let [currentTab] = await chrome.tabs.query({active: true, currentWindow: true});
        return currentTab;
    }

    function updateEnableButtonCosmetics(enableState) {
        if (enableState) {
            enableInterruptionButton.classList.remove("btn-primary");
            enableInterruptionButton.classList.add("btn-danger");
            enableInterruptionButton.innerText = "Disable";
        } else {
            enableInterruptionButton.classList.remove("btn-danger");
            enableInterruptionButton.classList.add("btn-primary");
            enableInterruptionButton.innerText = "Enable";
        }
    }

    async function onRightAddress() {
        let [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});
        return activeTab.url.startsWith("https://www.netflix.com/watch") ||
            activeTab.url.startsWith("https://www.youtube.com/watch");
    }

    let btnTryIt = document.getElementById("tryItButton");
    btnTryIt.addEventListener("click", async () => {
        let activationDate = new Date();
        await chrome.storage.sync.set({"trialActivated": activationDate.toLocaleString()})
    });

}



