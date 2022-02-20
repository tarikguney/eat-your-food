let interruptTimer;
chrome.runtime.onMessage.addListener(async (message, sender) => {
    console.log(message);
    if (message.enabled) {
        console.log("Interruption enabled!")
        interruptTimer = await startInterruptingNetflix(message.pauseDuration * 1000,
            message.pauseInterval * 1000)
    }
    if (!message.enabled) {
        clearInterval(interruptTimer);
        console.log("Interruption disabled!")
    }
});

async function startInterruptingNetflix(pauseDurationInMilliseconds, pauseIntervalInMilliseconds) {
    let mediaPlayer = document.getElementsByTagName("video")[0];
    let maximumRetryBucket = 1000;
    while (mediaPlayer == null && maximumRetryBucket >= 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        mediaPlayer = document.getElementsByTagName("video")[0];
        maximumRetryBucket--;
    }

    if (mediaPlayer == null) {
        console.error("the netflix media player could not be found!");
    }

    console.info("the netflix media player is found");
    return setInterval(function () {
        if (mediaPlayer.readyState >= 2 && mediaPlayer.paused === false) {
            mediaPlayer.pause();
            console.info("the media player is paused");
            setTimeout(function () {
                var actualPlayPromise = mediaPlayer.play();
                actualPlayPromise.then(_ => {
                    console.info("the media player resumes");
                });

            }, pauseDurationInMilliseconds);
        }

    }, pauseIntervalInMilliseconds);
}