let interruptTimer;
chrome.runtime.onMessage.addListener(async (message, sender) => {
    console.log(message);
    if (message.enabled) {
        console.log("EYF: Video pause interruption is enabled!")
        interruptTimer = await startInterruptingNetflix(message.pauseDuration * 1000,
            message.pauseInterval * 1000)
    }
    if (!message.enabled) {
        clearInterval(interruptTimer);
        console.log("EYF: Video pause interruption is disabled!")
    }
});

async function startInterruptingNetflix(pauseDurationInMilliseconds, pauseIntervalInMilliseconds) {
    console.log(pauseIntervalInMilliseconds)
    console.log(pauseDurationInMilliseconds)

    let mediaPlayer = document.getElementsByTagName("video")[0];
    let maximumRetryBucket = 1000;
    while (mediaPlayer == null && maximumRetryBucket >= 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        mediaPlayer = document.getElementsByTagName("video")[0];
        maximumRetryBucket--;
    }

    if (mediaPlayer == null) {
        console.error("EYF: Video player could not be found!");
    }

    console.info("EYF: Video player is found!");
    return setInterval(function () {
        if (mediaPlayer.readyState >= 2 && mediaPlayer.paused === false) {
            mediaPlayer.pause();
            console.info("EYF: Video is paused for " + pauseDurationInMilliseconds + " milliseconds!");
            setTimeout(function () {
                let actualPlayPromise = mediaPlayer.play();
                actualPlayPromise.then(_ => {
                    console.info("EYF: Video resumes!");
                });

            }, pauseDurationInMilliseconds);
        }

    }, pauseIntervalInMilliseconds + pauseDurationInMilliseconds);
}