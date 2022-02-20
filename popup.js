chrome.storage.sync.get(["pauseDuration", "pauseInterval"]).then(result => {
    let pauseDurationInput = document.getElementById("pauseDurationInput");
    let pauseIntervalInput = document.getElementById("pauseIntervalInput");

    console.log(result)
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

        if (pauseDurationInput.value === "" || pauseIntervalInput.value === "") {
            return;
        }

        let interruptionConfig = await chrome.storage.local.get("interruptionEnabled") || {interruptionEnabled: false};
        await chrome.storage.local.set({"interruptionEnabled": !interruptionConfig.interruptionEnabled})

        if (!interruptionConfig.interruptionEnabled) {
            enableInterruptionButton.innerText = "Disable";
        } else {
            enableInterruptionButton.innerText = "Enable";
        }

        await chrome.storage.sync.set({
            pauseInterval: parseInt(pauseIntervalInput.value),
            pauseDuration: parseInt(pauseDurationInput.value)
        })

        let [activeTab] = await chrome.tabs.query({currentWindow: true, active: true});
        let message = {
            enabled: !interruptionConfig.interruptionEnabled,
            pauseInterval: parseInt(pauseIntervalInput.value),
            pauseDuration: parseInt(pauseDurationInput.value)
        };

        console.log(message)
        chrome.tabs.sendMessage(activeTab.id, message);
    });
})

