(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    bindMenu();
    bindSearch();
    bindHero();
    bindCatalogFilters();
    bindPlayers();
    bindImageFallback();
    bindJumpPlay();
  });

  function bindMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var isOpen = menu.hasAttribute("hidden");
      if (isOpen) {
        menu.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      } else {
        menu.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function bindSearch() {
    var forms = document.querySelectorAll(".site-search-form");
    var panel = document.getElementById("searchPanel");
    var resultList = panel ? panel.querySelector(".search-result-list") : null;
    var closeButton = panel ? panel.querySelector(".search-close") : null;
    if (!forms.length || !panel || !resultList) {
      return;
    }
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector(".site-search-input");
        var query = input ? input.value.trim().toLowerCase() : "";
        showSearchResults(query, panel, resultList);
      });
    });
    if (closeButton) {
      closeButton.addEventListener("click", function () {
        panel.setAttribute("hidden", "");
      });
    }
    panel.addEventListener("click", function (event) {
      if (event.target === panel) {
        panel.setAttribute("hidden", "");
      }
    });
  }

  function showSearchResults(query, panel, resultList) {
    var source = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];
    var matches = source.filter(function (item) {
      var haystack = [item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine].join(" ").toLowerCase();
      return query && haystack.indexOf(query) !== -1;
    }).slice(0, 16);
    if (!query) {
      resultList.innerHTML = '<p class="empty-text">请输入片名、地区、年份或类型。</p>';
    } else if (!matches.length) {
      resultList.innerHTML = '<p class="empty-text">没有匹配影片。</p>';
    } else {
      resultList.innerHTML = matches.map(function (item) {
        return '<a class="search-result-item" href="' + escapeHtml(item.url) + '">' +
          '<strong>' + escapeHtml(item.title) + '</strong>' +
          '<span>' + escapeHtml(item.year + " · " + item.region + " · " + item.genre + " · " + item.category) + '</span>' +
          '<span>' + escapeHtml(item.oneLine || "") + '</span>' +
          '</a>';
      }).join("");
    }
    panel.removeAttribute("hidden");
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    start();
  }

  function bindCatalogFilters() {
    var input = document.querySelector(".page-filter-input");
    var year = document.querySelector(".page-filter-year");
    var region = document.querySelector(".page-filter-region");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-grid .movie-card, .ranking-list .movie-card"));
    if (!cards.length || (!input && !year && !region)) {
      return;
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value : "";
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.genre, card.dataset.tags].join(" ").toLowerCase();
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passYear = !selectedYear || card.dataset.year === selectedYear;
        var passRegion = !selectedRegion || card.dataset.region === selectedRegion;
        card.classList.toggle("is-hidden-by-filter", !(passQuery && passYear && passRegion));
      });
    }
    [input, year, region].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
  }

  function bindPlayers() {
    var players = document.querySelectorAll(".movie-player");
    players.forEach(function (player) {
      var source = player.getAttribute("data-src");
      var video = player.querySelector("video");
      var overlay = player.querySelector(".play-overlay");
      var hlsInstance = null;
      if (!source || !video) {
        return;
      }
      function start() {
        if (player.classList.contains("is-playing")) {
          video.play().catch(function () {});
          return;
        }
        player.classList.add("is-playing");
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }
      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!player.classList.contains("is-playing")) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function bindJumpPlay() {
    var jump = document.querySelector(".jump-play");
    var player = document.querySelector(".movie-player");
    var overlay = player ? player.querySelector(".play-overlay") : null;
    if (!jump || !player || !overlay) {
      return;
    }
    jump.addEventListener("click", function () {
      player.scrollIntoView({ behavior: "smooth", block: "center" });
      overlay.click();
    });
  }

  function bindImageFallback() {
    var images = document.querySelectorAll("img");
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-empty");
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
