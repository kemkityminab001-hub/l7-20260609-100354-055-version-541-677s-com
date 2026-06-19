(function() {
  window.setupPlayer = function(videoUrl) {
    const box = document.querySelector('[data-player-box]');
    const video = document.querySelector('[data-player-video]');
    const cover = document.querySelector('[data-player-cover]');
    const button = document.querySelector('[data-player-button]');
    if (!box || !video || !videoUrl) {
      return;
    }
    let ready = false;
    let hls = null;
    function prepare() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
      video.setAttribute('controls', 'controls');
      ready = true;
    }
    function start() {
      prepare();
      box.classList.add('is-playing');
      const play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(function() {});
      }
    }
    if (cover) {
      cover.addEventListener('click', start);
    }
    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function() {
      if (!ready) {
        start();
      }
    });
    window.addEventListener('pagehide', function() {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
