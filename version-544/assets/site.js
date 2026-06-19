(function () {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var isOpen = panel.hasAttribute('hidden');
            if (isOpen) {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === current;
                slide.classList.toggle('active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var grid = panel.parentElement.querySelector('.filter-grid');
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.searchable-card'));
            var search = panel.querySelector('.filter-search');
            var year = panel.querySelector('.filter-year');
            var region = panel.querySelector('.filter-region');
            var type = panel.querySelector('.filter-type');
            if (panel.getAttribute('data-query-from-url') === 'true' && search) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    search.value = query;
                }
            }

            function apply() {
                var keyword = normalize(search && search.value);
                var selectedYear = normalize(year && year.value);
                var selectedRegion = normalize(region && region.value);
                var selectedType = normalize(type && type.value);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        ok = false;
                    }
                    if (selectedRegion && cardRegion !== selectedRegion) {
                        ok = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden', !ok);
                });
            }

            [search, year, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function attachSource(video, source) {
        if (video.getAttribute('data-ready') === 'true') {
            return;
        }
        video.setAttribute('data-ready', 'true');
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        }
    }

    window.setupMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !source) {
            return;
        }

        function play() {
            attachSource(video, source);
            button.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    };

    onReady(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
