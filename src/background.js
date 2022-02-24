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
});

chrome.tabs.onRemoved.addListener(async function (tabId, removed) {

    let interruptedTabs = (await chrome.storage.sync.get("interruptedTabs")).interruptedTabs;
    let interruptedTabIndex = interruptedTabs
        .findIndex(a => a.tabId === tabId && a.windowId === removed.windowId);

    if (interruptedTabIndex > -1) {
        interruptedTabs.splice(interruptedTabIndex, 1);
        await chrome.storage.sync.set({"interruptedTabs": interruptedTabs});
    }
});

chrome.windows.onRemoved.addListener(async function (windowId) {
    let interruptedTabs = (await chrome.storage.sync.get("interruptedTabs")).interruptedTabs;
    let remaining = interruptedTabs.find(a => a.windowId !== windowId);
    await chrome.storage.sync.set({"interruptedTabs": remaining});
});