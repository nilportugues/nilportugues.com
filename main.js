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

  // Rotating words in the headline
  var rot = document.querySelector('.rotator');
  if (rot && !reduced) {
    var words = rot.getAttribute('data-words').split('|');
    var i = 0;
    setInterval(function () {
      i = (i + 1) % words.length;
      rot.innerHTML = '<span class="word grad-text">' + words[i] + '</span>';
    }, 2400);
  }

  // Count-up numbers
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    if (reduced) { el.textContent = prefix + target + suffix; return; }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1400, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Typing chat answer
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

  // Reveal on scroll
  var targets = document.querySelectorAll('.reveal, .gantt, .evo, .bars, [data-count], .msg.bot');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        if (el.hasAttribute('data-count')) countUp(el);
        if (el.classList.contains('msg') && el.classList.contains('bot')) typeChat(el);
        io.unobserve(el);
      });
    }, { threshold: 0.18 });
    targets.forEach(function (el) { io.observe(el); });
  }
})();
