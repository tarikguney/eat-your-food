chrome.runtime.onInstalled.addListener(async details => {
    let pauseConfig = await chrome.storage.sync.get(["pauseInterval", "pauseDuration"]);

    if (!pauseConfig.pauseInterval) {
        await chrome.storage.sync.set({pauseInterval: 40})
    }

    if (!pauseConfig.pauseDuration) {
        await chrome.storage.sync.set({pauseDuration: 5})
    }

})