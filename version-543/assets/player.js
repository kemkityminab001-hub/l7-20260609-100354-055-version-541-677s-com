(function () {
  function initPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var hlsInstance = null;
    var ready = false;

    function load() {
      var url = video.getAttribute('data-hls') || '';
      if (!url || ready) {
        return Promise.resolve();
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }
      video.src = url;
      return Promise.resolve();
    }

    function play() {
      load().then(function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player-box]')).forEach(initPlayer);
})();
