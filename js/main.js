// Project Frankenstein — interactions
(function () {
  'use strict';

  // Nav: scrolled state + mobile menu
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.classList.remove('open');
    }
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
})();

  // Config toggle: stock donor vs planned Frankenstein spec
  var cfgBtns = document.querySelectorAll('.cfg-btn');
  var cfgNote = document.getElementById('cfgNote');
  cfgBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      cfgBtns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      var cfg = btn.dataset.cfg;
      document.querySelectorAll('#specGrid .spec').forEach(function (el) {
        el.querySelector('.spec__v').textContent = el.dataset[cfg];
      });
      if (cfgNote) cfgNote.textContent = cfg === 'stock' ? 'as found' : 'planned — not yet built';
    });
  });

  // Timeline filters
  var tlChips = document.querySelectorAll('.tl-chip');
  var tlItems = document.querySelectorAll('.timeline__item');
  tlChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      tlChips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      var f = chip.dataset.f;
      tlItems.forEach(function (li) {
        li.hidden = f !== 'all' && li.dataset.status !== f;
      });
    });
  });

  // Cell arrangement map: 48 cells as series groups × parallel strings
  var cellGrid = document.getElementById('cellmapGrid');
  var cellRead = document.getElementById('cellmapRead');
  var ARR = {
    '12s4p': { s: 12, p: 4, v: '43.2 V nominal', tag: '12 series × 4 parallel' },
    '16s3p': { s: 16, p: 3, v: '57.6 V nominal', tag: '16 series × 3 parallel' }
  };
  function renderCells(key) {
    var c = ARR[key];
    cellGrid.innerHTML = '';
    cellGrid.style.setProperty('--cols', c.p);
    for (var i = 0; i < c.s; i++) {
      var row = document.createElement('div');
      row.className = 'cellrow';
      for (var j = 0; j < c.p; j++) {
        var cell = document.createElement('span');
        cell.className = 'cell';
        cell.style.setProperty('--hue', (i * 360 / c.s).toFixed(0));
        cell.title = 'Group ' + (i + 1);
        row.appendChild(cell);
      }
      cellGrid.appendChild(row);
    }
    cellRead.textContent = c.tag + ' — ' + c.v;
    cellGrid.setAttribute('aria-label', c.tag + ' cell arrangement, ' + c.v);
  }
  renderCells('12s4p');
  document.querySelectorAll('.cellmap .cfg-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.cellmap .cfg-btn').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      renderCells(btn.dataset.arr);
    });
  });

  // Hero stat count-up on first reveal
  var heroStats = document.querySelectorAll('.hero__stats strong');
  if (heroStats.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        statIO.unobserve(en.target);
        var el = en.target;
        var raw = el.textContent;
        var numMatch = raw.match(/[\d.]+/);
        if (!numMatch) return;
        var prefix = raw.slice(0, numMatch.index);
        var suffix = raw.slice(numMatch.index + numMatch[0].length);
        var end = parseFloat(numMatch[0]), dec = numMatch[0].includes('.') ? 1 : 0;
        var t0 = performance.now(), dur = 1100;
        function tick(now) {
          var p = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + (end * eased).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    heroStats.forEach(function (el) { statIO.observe(el); });
  }

  // Photo lightbox — click any content image to view it large
  var lightboxImgs = Array.prototype.slice.call(document.querySelectorAll('main img[loading="lazy"]'));
  if (lightboxImgs.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = '<button class="lb-close" aria-label="Close">×</button>' +
      '<button class="lb-nav lb-prev" aria-label="Previous image">‹</button>' +
      '<figure class="lb-figure"><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-nav lb-next" aria-label="Next image">›</button>' +
      '<div class="lb-count mono"></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), lbCount = lb.querySelector('.lb-count');
    var lbIdx = 0, lbOpen = false;

    function show(i) {
      lbIdx = (i + lightboxImgs.length) % lightboxImgs.length;
      var src = lightboxImgs[lbIdx];
      lbImg.src = src.src; lbImg.alt = src.alt;
      lbCap.textContent = src.alt;
      lbCount.textContent = (lbIdx + 1) + ' / ' + lightboxImgs.length;
    }
    function open(i) { show(i); lb.classList.add('open'); lbOpen = true; document.body.style.overflow = 'hidden'; }
    function close() { lb.classList.remove('open'); lbOpen = false; document.body.style.overflow = ''; }

    lightboxImgs.forEach(function (img, i) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () { open(i); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(lbIdx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(lbIdx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lbOpen) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(lbIdx - 1);
      if (e.key === 'ArrowRight') show(lbIdx + 1);
    });
  }

  // Battery sag chart — illustrative rest-vs-load cell group voltages
  (function () {
    var cv = document.getElementById('sagChart');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var groups = 12;
    // resting ~3.62-3.68V flat; loaded: group 7 dips hard, neighbours slightly
    var rest = [], load = [];
    for (var i = 0; i < groups; i++) {
      rest.push(3.62 + ((i * 37) % 10) / 100);
      var dip = i === 6 ? 0.31 : (i === 5 || i === 7 ? 0.08 : 0.015 + ((i * 13) % 7) / 100);
      load.push(rest[i] - dip);
    }
    var t = 0, raf = 0, drawn = false;
    function size() {
      var r = cv.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(180 * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', function () { size(); draw(performance.now()); });
    function draw(now) {
      var w = cv.getBoundingClientRect().width, h = 180;
      ctx.clearRect(0, 0, w, h);
      var padL = 34, padR = 10, padT = 14, padB = 22;
      var iw = w - padL - padR, ih = h - padT - padB;
      var vMin = 3.1, vMax = 3.75;
      function Y(v) { return padT + (1 - (v - vMin) / (vMax - vMin)) * ih; }
      function X(i) { return padL + (i + 0.5) * (iw / groups); }
      // gridlines + y labels
      ctx.font = '9px Consolas, monospace';
      ctx.fillStyle = '#6a6a72'; ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 1;
      [3.2, 3.4, 3.6].forEach(function (v) {
        ctx.beginPath(); ctx.moveTo(padL, Y(v)); ctx.lineTo(w - padR, Y(v)); ctx.stroke();
        ctx.fillText(v.toFixed(1) + 'V', 4, Y(v) + 3);
      });
      // x labels
      for (var i = 0; i < groups; i++) {
        ctx.fillText('G' + (i + 1), X(i) - 8, h - 6);
      }
      function series(vals, color, reveal) {
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
        vals.forEach(function (v, i) {
          var px = X(i), py = Y(v);
          // reveal: draw up to reveal fraction of groups
          if (i / groups <= reveal) { if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
        });
        ctx.stroke();
        vals.forEach(function (v, i) {
          if (i / groups <= reveal) {
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(X(i), Y(v), 2.4, 0, Math.PI * 2); ctx.fill();
          }
        });
      }
      var reveal = reduce ? 1 : Math.min(1, (now - t0) / 1400);
      series(rest, '#4a4a55', 1);
      series(load, '#e10600', reveal);
      // annotate the dip once revealed
      if (reveal > 0.9) {
        ctx.fillStyle = '#e10600'; ctx.font = '9.5px Consolas, monospace';
        ctx.fillText('sag', X(6) + 6, Y(load[6]) - 6);
      }
      if (!reduce && reveal < 1) raf = requestAnimationFrame(function (n) { draw(n); });
      else drawn = true;
    }
    var t0 = performance.now();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting && !drawn) { t0 = performance.now() - (reduce ? 1400 : 0); draw(performance.now()); }
        });
      }).observe(cv);
    } else { draw(performance.now()); }
  })();

  // Scroll-spy: highlight the nav link for the section in view
  var spySections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var spyLinks = {};
  document.querySelectorAll('.nav__links a').forEach(function (a) {
    var id = a.getAttribute('href').replace('#', '');
    if (document.getElementById(id)) spyLinks[id] = a;
  });
  if (spySections.length && 'IntersectionObserver' in window) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && spyLinks[en.target.id]) {
          Object.keys(spyLinks).forEach(function (k) { spyLinks[k].classList.remove('is-active'); });
          spyLinks[en.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    spySections.forEach(function (s) { spyIO.observe(s); });
  }
