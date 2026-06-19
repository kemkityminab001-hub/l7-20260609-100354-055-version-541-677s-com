(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var panel = qs('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
    });
  }

  qsa('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-hidden');
    }, { once: true });
  });

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  qsa('[data-filter-toolbar]').forEach(function (toolbar) {
    var grid = qs('[data-card-grid]', toolbar.parentNode) || qs('[data-card-grid]');
    var cards = grid ? qsa('[data-movie-card]', grid) : [];
    var buttons = qsa('[data-filter-type]', toolbar);
    var select = qs('[data-sort-select]', toolbar);
    var activeType = 'all';

    function apply() {
      cards.forEach(function (card) {
        var match = activeType === 'all' || card.getAttribute('data-type') === activeType;
        card.style.display = match ? '' : 'none';
      });

      if (select && grid) {
        var sorted = cards.slice().sort(function (a, b) {
          var mode = select.value;
          if (mode === 'hot') {
            return Number(b.getAttribute('data-hot')) - Number(a.getAttribute('data-hot'));
          }
          if (mode === 'rating') {
            return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
          }
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-type');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });

    if (select) {
      select.addEventListener('change', apply);
    }
  });

  var searchSection = qs('[data-search-section]');
  if (searchSection && typeof SITE_SEARCH_DATA !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = qs('[data-search-input]');
    var title = qs('[data-search-title]');
    var results = qs('[data-search-results]');

    if (input) {
      input.value = query;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    function normalize(text) {
      return String(text || '').toLowerCase().replace(/\s+/g, '');
    }

    function card(item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-frame" href="' + item.url + '">',
        '    <img src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="poster-gradient"></span>',
        '    <span class="poster-year">' + escapeHtml(item.year) + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-topline"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.rating) + '</span></div>',
        '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
        '    <div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function render(value) {
      var key = normalize(value);
      if (!key) {
        if (title) {
          title.textContent = '热门推荐';
        }
        return;
      }
      var matched = SITE_SEARCH_DATA.filter(function (item) {
        return normalize(item.title + item.region + item.type + item.year + item.genre + item.oneLine + item.tags.join('')).indexOf(key) !== -1;
      }).slice(0, 80);
      if (title) {
        title.textContent = '搜索：' + value;
      }
      if (results) {
        results.innerHTML = matched.length ? matched.map(card).join('') : '<div class="ranking-card"><h2>未找到相关影片</h2><p>可以尝试更换片名、年份、地区或类型关键词。</p></div>';
        qsa('img', results).forEach(function (image) {
          image.addEventListener('error', function () {
            image.classList.add('is-hidden');
          }, { once: true });
        });
      }
    }

    render(query);
  }
})();
