(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        show(0);
        play();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initSearch() {
        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
        var activeCategory = "all";

        if (!input && !filterButtons.length) {
            return;
        }

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var visibleCount = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var category = card.getAttribute("data-category") || "";
                var matchText = !keyword || text.indexOf(keyword) !== -1;
                var matchCategory = activeCategory === "all" || category === activeCategory;
                var visible = matchText && matchCategory;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    visibleCount += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeCategory = button.getAttribute("data-filter-category") || "all";
                filterButtons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });

        apply();
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
    });
})();
