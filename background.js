chrome.runtime.onInstalled.addListener(async details => {
    let pauseConfig = await chrome.storage.sync.get(["pauseInterval", "pauseDuration", "interruptedTabs"]);

    if (!pauseConfig.pauseInterval) {
        await chrome.storage.sync.set({pauseInterval: 40})
    }

    if (!pauseConfig.pauseDuration) {
        await chrome.storage.sync.set({pauseDuration: 5})
    }

    if (!pauseConfig.interruptedTabs) {
        await chrome.storage.sync.set({interruptedTabs: []});
    }

    chrome.storage.sync.get(function(result){console.log(result)})
});

chrome.tabs.onRemoved.addListener(async function (tabId, removed) {

    let interruptionConfig = await chrome.storage.local.get("interruptedTabs");
    let interruptedTabIndex = interruptionConfig.interruptedTabs
        .findIndex(a => a.tabId === tabId && a.windowId === removed.windowId);

    let currentState = interruptedTabIndex > -1;

    if (currentState) {
        interruptionConfig.interruptedTabs.splice(interruptedTabIndex, 1);
        await chrome.storage.local.set({"interruptedTabs": interruptionConfig.interruptedTabs});
    }
});

chrome.windows.onRemoved.addListener(async function (windowId) {

    // todo: Check if any element exists before removing and re-saving.
    let interruptionConfig = await chrome.storage.local.get("interruptedTabs");
    _.remove(interruptionConfig.interruptedTabs, n => n.windowId === windowId);
    await chrome.storage.local.set({"interruptedTabs": interruptionConfig.interruptedTabs});
});