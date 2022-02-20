chrome.runtime.onInstalled.addListener(async details => {
    let pauseConfig = await chrome.storage.sync.get(["pauseInterval", "pauseDuration", "interruptionEnabled"]);

    if (!pauseConfig.pauseInterval) {
        await chrome.storage.sync.set({pauseInterval: 40})
    }

    if (!pauseConfig.pauseDuration) {
        await chrome.storage.sync.set({pauseDuration: 5})
    }

    if (!pauseConfig.interruptionEnabled) {
        await chrome.storage.sync.set({interruptionEnabled: false});
    }

})