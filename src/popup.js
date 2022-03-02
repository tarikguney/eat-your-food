// Cannot use await keyword in a root w/o async keyword. So, wrapped everything within a function, and calling the function.
initializeActionPopup().then(r => {
    // Ignoring the result. Just let it do its work asynchronously.
});

async function initializeActionPopup() {
    let purchased = await chrome.storage.sync.get(["purchaseInformation", "trialActivated"]);
    let trialValid = false;

    // Performing trial specific actions if the trial is activated but the purchase didn't happen.
    if (!purchased.purchaseInformation && purchased.trialActivated) {
        let trialActivatedDate = new Date(purchased.trialActivated);
        let trialExpirationDate = new Date();
        trialExpirationDate.setTime(trialActivatedDate.getTime());
        trialExpirationDate.setDate(trialActivatedDate.getDate() + 3);
        let todayDate = new Date();
        trialValid = todayDate <= trialExpirationDate;

        if (trialValid) {
            // Showing the footer options where the expiration date is shown alongside with purchase options.
            let trialOptionsFooter = document.getElementById("trialOptionsFooter");
            let trialExpirationDateFooterSpan = document.getElementById("trialExpirationDateFooterSpan");
            trialOptionsFooter.style.removeProperty("display");
            trialExpirationDateFooterSpan.innerText = trialExpirationDate.toLocaleString();
        } else {
            // Hiding trial options in the purchaseModal since the trial is already ended.
            // Instead, showing when the trial ended in the purchase modal and asking for a purchase.
            let trialExpirationModalBadge = document.getElementById("trialExpirationModalBadge");
            let trialExpirationDateModalSpan = document.getElementById("trialExpirationDateModalSpan");
            trialExpirationModalBadge.style.removeProperty("display");
            trialExpirationDateModalSpan.innerText = trialExpirationDate.toLocaleString();
            let tryItButton = document.getElementById("tryItButton");
            tryItButton.style.display = "none";
            let tryMention = document.getElementById("tryMention");
            tryMention.style.display = "none";
        }
    }

    // If the trial is not valid or ended and there is no purchase happened, then show the purchase modal.
    if (!trialValid && !purchased.purchaseInformation) {
        let purchasingModal = new bootstrap.Modal(document.getElementById('purchasingModal'));
        purchasingModal.show();
    }

    let pauseSettings = await chrome.storage.sync.get(["pauseDuration", "pauseInterval", "overlayEnabled"])

    let wrongSiteBadge = document.getElementById("wrongSiteBadge")
    let enableInterruptionButton = document.getElementById("enableInterruption");

    let rightAddress = await onRightAddress();
    console.log(rightAddress);

    // If the extension is opened on a site other than YouTube or Netflix, warn the user.
    if (rightAddress) {
        wrongSiteBadge.style.display = "none";
        enableInterruptionButton.disabled = false;
    } else {
        wrongSiteBadge.style.removeProperty("display")
        enableInterruptionButton.disabled = true;
    }

    // Fill out the duration, interval, and switch inputs from the saved settings during the action popup load.
    let pauseDurationInput = document.getElementById("pauseDurationInput");
    let pauseIntervalInput = document.getElementById("pauseIntervalInput");
    let pauseOverlaySwitch = document.getElementById("pauseOverlaySwitch");

    pauseDurationInput.value = pauseSettings.pauseDuration;
    pauseIntervalInput.value = pauseSettings.pauseInterval;
    pauseOverlaySwitch.checked = pauseSettings.overlayEnabled;

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
            overlayEnabled: pauseOverlaySwitch.checked,
            interruptedTabs: interruptedTabs
        })

        let message = {
            enabled: !currentState,
            pauseInterval: parseInt(pauseIntervalInput.value),
            pauseDuration: parseInt(pauseDurationInput.value),
            overlayEnabled: pauseOverlaySwitch.checked
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
            pauseDurationInput.disabled = true;
            pauseIntervalInput.disabled = true;
            pauseOverlaySwitch.disabled = true;
        } else {
            enableInterruptionButton.classList.remove("btn-danger");
            enableInterruptionButton.classList.add("btn-primary");
            enableInterruptionButton.innerText = "Enable";
            pauseDurationInput.disabled = false;
            pauseIntervalInput.disabled = false;
            pauseOverlaySwitch.disabled = false;
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
        await chrome.storage.sync.set({"trialActivated": activationDate.toLocaleString()});

        let trialExpirationDate = new Date();
        trialExpirationDate.setTime(activationDate.getTime());
        trialExpirationDate.setDate(activationDate.getDate() + 3);

        let trialOptionsContainer = document.getElementById("trialOptionsContainer");
        let trialExpirationDateFooterSpan = document.getElementById("trialExpirationDateFooterSpan")
        trialOptionsContainer.style.removeProperty("display");
        trialExpirationDateFooterSpan.innerText = trialExpirationDate.toLocaleString();
    });

    let btnSaveProductKey = document.getElementById("btnSaveProductKey");
    btnSaveProductKey.addEventListener("click", async () => {
        let productEmail = document.getElementById("productEmail");
        let productKey = document.getElementById("productKey");

        /*
         Yes, you can see the product key by inspecting the popup. If you made thus far, congratulations!
         Now, you have two options: Either copy this code and use the extension for free or support the developer by
         making a tiny amount of purchase.
         */
        if (productKey.value === "6CmD5IVpbh39wGkNMzAZ0di529yB4JsY") {
            await chrome.storage.sync.set({
                "purchaseInformation": {
                    productKey: productKey.value,
                    email: productEmail.value
                }
            });

            let thanksForPurchasingToastEl = document.getElementById('thanksForPurchasingToast')
            let thanksForPurchasingToast = new bootstrap.Toast(thanksForPurchasingToastEl);
            thanksForPurchasingToast.show();
        } else {
            let invalidProductKeyToastEl = document.getElementById('invalidProductKeyToast')
            let invalidProductKeyToast = new bootstrap.Toast(invalidProductKeyToastEl);
            invalidProductKeyToast.show();
        }
    });
}



