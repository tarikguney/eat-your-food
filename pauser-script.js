chrome.runtime.onMessage.addListener((message, sender) => {
    
})



let interruptionInterval = 40000; // 40 seconds
let pauseTime = 8000; // 8 seconds

async function startInterruptingNetflix() {
    var mediaPlayer = document.getElementsByTagName("video")[0];
    var maximumRetryBucket = 1000;
    while (mediaPlayer == null && maximumRetryBucket >= 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        mediaPlayer = document.getElementsByTagName("video")[0];
        maximumRetryBucket--;
    }

    if (mediaPlayer == null) {
        console.error("the netflix media player could not be found!");
    }

    console.info("the netflix media player is found");
    setInterval(function () {
        if (mediaPlayer.readyState >= 2 && mediaPlayer.paused === false) {
            mediaPlayer.pause();
            console.info("the media player is paused");
            setTimeout(function () {
                var actualPlayPromise = mediaPlayer.play();
                actualPlayPromise.then(_ => {
                    console.info("the media player resumes");
                });

            }, pauseTime);
        }

    }, interruptionInterval);
}