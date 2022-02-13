let enableInterruptionButton = document.getElementById("enableInterruption");

enableInterruptionButton.addEventListener("click", async () => {

    let result = await chrome.storage.local.get("interruptionEnabled") || false;

    await chrome.storage.local.set({"interruptionEnabled": !result.interruptionEnabled})

    let [activeTab] = await chrome.tabs.query({currentWindow: true, active: true});
    let message = {enabled: !result.interruptionEnabled};
    chrome.tabs.sendMessage(activeTab.id, message);
});