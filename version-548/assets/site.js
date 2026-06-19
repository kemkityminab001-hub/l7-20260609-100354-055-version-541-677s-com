(function() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function() {
        show(active + 1);
      }, 5200);
    }
  }

  const filterForm = document.querySelector('[data-local-filter]');
  const filterList = document.querySelector('[data-filter-list]');
  if (filterForm && filterList) {
    const input = filterForm.querySelector('[data-local-filter-input]');
    const year = filterForm.querySelector('[data-year-filter]');
    const category = filterForm.querySelector('[data-category-filter]');
    const cards = Array.from(filterList.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }
    function apply() {
      const term = input ? input.value.trim().toLowerCase() : '';
      const yearValue = year ? year.value : '';
      const categoryValue = category ? category.value : '';
      cards.forEach(function(card) {
        const matchText = !term || (card.getAttribute('data-search') || '').includes(term);
        const matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        const matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        card.classList.toggle('is-hidden', !(matchText && matchYear && matchCategory));
      });
    }
    [input, year, category].forEach(function(control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }
})();
