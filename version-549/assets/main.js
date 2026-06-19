(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var isOpen = !mobilePanel.hasAttribute('hidden');
            if (isOpen) {
                mobilePanel.setAttribute('hidden', '');
                menuButton.setAttribute('aria-expanded', 'false');
            } else {
                mobilePanel.removeAttribute('hidden');
                menuButton.setAttribute('aria-expanded', 'true');
            }
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.inline-filter, .search-page-input'));

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function filterCards(value) {
        var keyword = normalize(value);
        var grids = Array.prototype.slice.call(document.querySelectorAll('.filter-grid'));

        grids.forEach(function (grid) {
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var matched = 0;
            var empty = grid.querySelector('.empty-message');

            if (!empty) {
                empty = document.createElement('div');
                empty.className = 'empty-message';
                empty.textContent = '没有找到匹配的影片';
                grid.appendChild(empty);
            }

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' '));
                var visible = !keyword || text.indexOf(keyword) !== -1;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    matched += 1;
                }
            });

            empty.style.display = matched === 0 ? 'block' : 'none';
        });
    }

    if (filterInputs.length) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        filterInputs.forEach(function (input) {
            if (initialQuery && input.classList.contains('search-page-input')) {
                input.value = initialQuery;
            }
            input.addEventListener('input', function () {
                filterCards(input.value);
            });
        });

        if (initialQuery) {
            filterCards(initialQuery);
        }
    }

    var backToTop = document.querySelector('.back-to-top');

    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('visible', window.scrollY > 520);
        });
        backToTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
})();
