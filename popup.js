work();

async function work() {

    let purchasingModal = new bootstrap.Modal(document.getElementById('purchasingModal'))
    purchasingModal.show();

    let result = await chrome.storage.sync.get(["pauseDuration", "pauseInterval"])

    let wrongSiteBadge = document.getElementById("wrongSiteBadge")
    let enableInterruptionButton = document.getElementById("enableInterruption");

    let rightAddress = await onRightAddress();
    console.log(rightAddress);

    if (rightAddress) {
        wrongSiteBadge.classList.add("invisible");
        enableInterruptionButton.disabled = false;
    } else {
        wrongSiteBadge.classList.remove("invisible");
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
        }else{
            interruptedTabs.push({
                tabId: currentTab.id,
                windowId : currentTab.windowId
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

}



