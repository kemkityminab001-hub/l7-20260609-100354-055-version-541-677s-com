(function () {
    function bootPlayer(root) {
        var source = root.getAttribute("data-src");
        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var attached = false;
        var hls = null;

        if (!source || !video) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function start() {
            attachSource();
            root.classList.add("is-playing");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    root.classList.remove("is-playing");
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        video.addEventListener("play", function () {
            root.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
            if (!video.currentTime) {
                root.classList.remove("is-playing");
            }
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(bootPlayer);
    });
})();
