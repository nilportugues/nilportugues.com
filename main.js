(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // Reserve the final height of the typed answer up front
  document.querySelectorAll('.msg.bot .typed').forEach(function (el) {
    var wrap = document.createElement('span');
    wrap.className = 'typed-wrap';
    var ghost = document.createElement('span');
    ghost.className = 'ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.textContent = el.getAttribute('data-text');
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(ghost);
    wrap.appendChild(el);
  });

  function typeChat(msg) {
    var el = msg.querySelector('.typed');
    var text = el.getAttribute('data-text');
    if (reduced) { el.textContent = text; msg.classList.add('done'); return; }
    var n = 0;
    setTimeout(function tick() {
      n += 2;
      el.textContent = text.slice(0, n);
      if (n < text.length) setTimeout(tick, 22);
      else msg.classList.add('done');
    }, 700);
  }

  // Jumping to a section shouldn't make content pop in after landing
  function revealAll() { root.classList.add('no-reveal'); }
  if (location.hash) revealAll();
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (link) revealAll();
  });

  // Reveal on scroll
  var targets = document.querySelectorAll('.reveal, .gantt, .bars, .msg.bot');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        if (el.classList.contains('msg') && el.classList.contains('bot')) typeChat(el);
        io.unobserve(el);
      });
    }, { threshold: 0.18 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // Pause decorative animations when they are not visible
  if ('IntersectionObserver' in window) {
    var po = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('offscreen', !e.isIntersecting); });
    });
    document.querySelectorAll('.hero, .pipeline').forEach(function (el) { po.observe(el); });
  }
})();
