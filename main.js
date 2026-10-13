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

  var motion = root.classList.contains('motion');

  // Wrap each word of an element's text in a .w span. Child elements are split too
  // when `deep`, otherwise they become a single unit (keeps the gradient <em> whole).
  function splitWords(el, wrap, deep, n) {
    n = n || 0;
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) {
        if (node.nodeType !== 1) return;
        if (deep) n = splitWords(node, wrap, deep, n);
        else { node.classList.add('w'); node.style.setProperty('--wi', n++); }
        return;
      }
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span');
        w.className = 'w';
        w.style.setProperty('--wi', n++);
        if (wrap) { var inner = document.createElement('span'); inner.textContent = part; w.appendChild(inner); }
        else w.textContent = part;
        frag.appendChild(w);
      });
      el.replaceChild(frag, node);
    });
    return n;
  }

  if (motion) {
    // Hero headline: words rise in one after another
    var h1 = document.querySelector('.hero h1');
    if (h1) { splitWords(h1, false, false); h1.classList.add('split'); }
    // Section titles: words slide up from behind a mask
    document.querySelectorAll('.section-title').forEach(function (el) { splitWords(el, true, false); });
    // Job content and scope stats reveal in sequence too
    document.querySelectorAll('.job-card > :not(.job-cases), .job-cases > .case, .stat').forEach(function (el) { el.classList.add('reveal'); });
  }

  // Count a figure up from zero
  function countUp(el) {
    var m = el.textContent.match(/^(\D*)(\d+)(.*)$/);
    if (!m) return;
    var target = +m[2], start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / 1600, 1);
      el.textContent = m[1] + Math.round(target * (1 - Math.pow(2, -10 * p))) + m[3];
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = m[1] + target + m[3];
    }
    requestAnimationFrame(step);
  }

  // Reveal on scroll; elements arriving together are staggered
  var targets = document.querySelectorAll('.reveal, .gantt, .bars, .big-number');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.setProperty('--i', Math.min(k++, 5));
        el.classList.add('in');
        if (motion && el.classList.contains('big-number') && !root.classList.contains('no-reveal')) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.18 });
    targets.forEach(function (el) { io.observe(el); });
  }
})();
