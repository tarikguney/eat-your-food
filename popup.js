chrome.storage.sync.get(["pauseDuration", "pauseInterval"]).then(async result => {
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

    let enableInterruptionButton = document.getElementById("enableInterruption");

    //
    chrome.storage.local.get("interruptionEnabled").then(async (result) => {
        updateEnableButtonCosmetics(result.interruptionEnabled)
    });

    enableInterruptionButton.addEventListener("click", async () => {
        if (pauseDurationInput.value === "" || pauseIntervalInput.value === "") {
            return;
        }
        let interruptionConfig = await chrome.storage.local.get("interruptionEnabled");
        let newEnabledState = !interruptionConfig.interruptionEnabled;

        await chrome.storage.local.set({"interruptionEnabled": newEnabledState})

        updateEnableButtonCosmetics(newEnabledState);

        await chrome.storage.sync.set({
            pauseInterval: parseInt(pauseIntervalInput.value),
            pauseDuration: parseInt(pauseDurationInput.value)
        })

        let [activeTab] = await chrome.tabs.query({currentWindow: true, active: true});
        let message = {
            enabled: newEnabledState,
            pauseInterval: parseInt(pauseIntervalInput.value),
            pauseDuration: parseInt(pauseDurationInput.value)
        };

        console.log(message)
        chrome.tabs.sendMessage(activeTab.id, message);
    });

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
})

