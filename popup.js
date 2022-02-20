let pauseDurationInput = document.getElementById("pauseDurationInput");
let pauseIntervalInput = document.getElementById("pauseIntervalInput");

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

let enableInterruptionButton = document.getElementById("enableInterruption");

chrome.storage.local.get("interruptionEnabled").then(async (result) => {
    let final = result || {interruptionEnabled: false};
    console.log(final)

    if (final.interruptionEnabled) {
        enableInterruptionButton.innerText = "Disable";
    } else {
        enableInterruptionButton.innerText = "Enable";
    }
});

enableInterruptionButton.addEventListener("click", async () => {

    let result = await chrome.storage.local.get("interruptionEnabled") || {interruptionEnabled: false};

    await chrome.storage.local.set({"interruptionEnabled": !result.interruptionEnabled})

    if (!result.interruptionEnabled) {
        enableInterruptionButton.innerText = "Disable";
    } else {
        enableInterruptionButton.innerText = "Enable";
    }

    let [activeTab] = await chrome.tabs.query({currentWindow: true, active: true});
    let message = {enabled: !result.interruptionEnabled};
    chrome.tabs.sendMessage(activeTab.id, message);
});