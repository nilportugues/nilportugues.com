(function () {
  var root = document.documentElement;

  // Year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Theme toggle
  try {
    var saved = localStorage.getItem('theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}
  var toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Remember an explicit language choice so the browser-language redirect respects it
  document.querySelectorAll('[data-lang]').forEach(function (link) {
    link.addEventListener('click', function () {
      try { localStorage.setItem('lang', link.getAttribute('data-lang')); } catch (e) {}
    });
  });

  // Close the language menu when clicking elsewhere
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.lang-menu[open]').forEach(function (m) {
      if (!m.contains(e.target)) m.removeAttribute('open');
    });
  });

  // Jumping to a section shouldn't make content pop in after landing
  function revealAll() { root.classList.add('no-reveal'); }
  if (location.hash) revealAll();
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (link) revealAll();
  });

  // Reveal on scroll
  var targets = document.querySelectorAll('.reveal, .gantt, .bars');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.18 });
    targets.forEach(function (el) { io.observe(el); });
  }
})();
