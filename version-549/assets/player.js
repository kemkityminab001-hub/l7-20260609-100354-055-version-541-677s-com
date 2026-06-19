(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));

    function attachPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-button');
        var source = player.getAttribute('data-src');
        var hlsInstance = null;
        var loaded = false;

        if (!video || !button || !source) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        }

        function playVideo() {
            loadSource();
            player.classList.add('is-playing');
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                player.classList.remove('is-playing');
            }
        });
        video.addEventListener('ended', function () {
            player.classList.remove('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    players.forEach(attachPlayer);
})();
