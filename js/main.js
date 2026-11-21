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
    function open(i) { show(i); lb.classList.add('open'); lbOpen = true; document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); }
    function close() { lb.classList.remove('open'); lbOpen = false; document.body.style.overflow = ''; }

    lightboxImgs.forEach(function (img, i) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () { open(i); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(lbIdx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(lbIdx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    // swipe left/right on touch devices
    var tx = 0, ty = 0;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) show(lbIdx + (dx < 0 ? 1 : -1));
    }, { passive: true });
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
          if (e.isIntersecting && !drawn) { size(); t0 = performance.now() - (reduce ? 1400 : 0); draw(performance.now()); }
        });
      }).observe(cv);
    } else { draw(performance.now()); }

    // hover tooltip — rest vs load voltage per cell group
    var wrap = document.getElementById('sagWrap');
    var tip = document.getElementById('sagTip');
    if (wrap && tip && wrap.addEventListener) {
      wrap.addEventListener('mousemove', function (e) {
        var r = cv.getBoundingClientRect();
        var w = r.width, h = 180;
        var padL = 34, padR = 10, iw = w - padL - padR;
        var fx = (e.clientX - r.left - padL) / iw; // 0..1 across groups
        var gi = Math.round(fx * groups - 0.5);
        if (gi < 0 || gi >= groups) { tip.hidden = true; return; }
        tip.hidden = false;
        tip.style.left = ((gi + 0.5) / groups * 100) + '%';
        tip.textContent = 'G' + (gi + 1) + '  rest ' + rest[gi].toFixed(2) + 'V  →  load ' + load[gi].toFixed(2) + 'V';
      });
      wrap.addEventListener('mouseleave', function () { tip.hidden = true; });
    }
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

  // Field-weakening explorer — conceptual trade-off curves (illustration only)
  (function () {
    var dial = document.getElementById('fwDial');
    var cv = document.getElementById('fwChart');
    if (!dial || !cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var speedEl = document.getElementById('fwSpeed');
    var effEl = document.getElementById('fwEff');
    var heatEl = document.getElementById('fwHeat');
    var t = 0, raf = 0, started = false;

    function size() {
      var r = cv.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(190 * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', function () { size(); draw(); });

    function draw() {
      var w = cv.getBoundingClientRect().width, h = 190;
      ctx.clearRect(0, 0, w, h);
      var padL = 40, padR = 14, padT = 12, padB = 24;
      var iw = w - padL - padR, ih = h - padT - padB;
      var fw = +dial.value / 100;
      // conceptual curves: speed rises then plateaus; efficiency falls; heat rises
      function speedAt(x) { return 0.45 + 0.5 * (1 - Math.exp(-2.6 * x)); }
      function effAt(x)   { return 1 - 0.55 * x * x; }
      function heatAt(x)  { return Math.pow(x, 1.6); }
      function X(x) { return padL + x * iw; }
      function Y(v) { return padT + (1 - v) * ih; }
      // grid
      ctx.strokeStyle = '#2a2a30'; ctx.fillStyle = '#6a6a72';
      ctx.font = '9px Consolas, monospace'; ctx.lineWidth = 1;
      [0, .25, .5, .75, 1].forEach(function (g) {
        ctx.beginPath(); ctx.moveTo(padL, Y(g)); ctx.lineTo(w - padR, Y(g)); ctx.stroke();
        ctx.fillText(Math.round(g * 100) + '%', 6, Y(g) + 3);
      });
      [0, .25, .5, .75, 1].forEach(function (g) {
        ctx.fillText(Math.round(g * 100) + '%', X(g) - 8, h - 8);
      });
      ctx.fillText('FIELD WEAKENING →', padL, h - 8);
      // curves
      function curve(fn, color, label) {
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
        for (var i = 0; i <= 60; i++) {
          var x = i / 60, px = X(x), py = Y(fn(x));
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.fillStyle = color; ctx.font = '600 10px Consolas, monospace';
        ctx.fillText(label, X(0.62), Y(fn(0.62)) - 8);
      }
      curve(speedAt, '#e10600', 'speed');
      curve(effAt, '#4a9e6b', 'efficiency');
      curve(heatAt, '#d98e32', 'heat');
      // marker at dial position
      var mx = X(fw);
      ctx.strokeStyle = 'rgba(232,232,232,.4)'; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(mx, padT); ctx.lineTo(mx, padT + ih); ctx.stroke();
      ctx.setLineDash([]);
      [[speedAt(fw), '#e10600'], [effAt(fw), '#4a9e6b'], [heatAt(fw), '#d98e32']].forEach(function (p) {
        ctx.fillStyle = p[1];
        ctx.beginPath(); ctx.arc(mx, Y(p[0]), 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#0a0a0c'; ctx.lineWidth = 1.5; ctx.stroke();
      });
      // readouts
      speedEl.textContent = fw < 0.02 ? 'baseline' : '+' + Math.round((speedAt(fw) / speedAt(0) - 1) * 100) + '%';
      effEl.textContent = Math.round(effAt(fw) * 100) + '%';
      heatEl.textContent = fw < 0.15 ? 'low' : fw < 0.5 ? 'moderate' : fw < 0.8 ? 'high' : 'severe';
      heatEl.style.color = fw < 0.5 ? '' : '#e10600';
    }
    dial.addEventListener('input', draw);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting && !started) { started = true; size(); draw(); }
        });
      }).observe(cv);
    } else draw();
  })();

  // Pre-ride checklist — persistent demo state on this device
  (function () {
    var box = document.getElementById('checklist');
    var count = document.getElementById('checkCount');
    var bar = document.getElementById('checkBar');
    var boxes = box ? box.querySelectorAll('input[data-chk]') : [];
    if (!box || !boxes.length) return;
    var KEY = 'pf-checklist-v1';
    var state = {};
    try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { state = {}; }
    function update() {
      var done = 0;
      boxes.forEach(function (b) {
        b.checked = !!state[b.dataset.chk];
        if (b.checked) done++;
      });
      count.textContent = done + ' / ' + boxes.length + ' cleared';
      bar.style.width = (done / boxes.length * 100) + '%';
      box.classList.toggle('done', done === boxes.length);
    }
    boxes.forEach(function (b) {
      b.addEventListener('change', function () {
        state[b.dataset.chk] = b.checked;
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
        update();
      });
    });
    update();
  })();

  // Copy spec sheet — dumps the current toggle state as plain text
  (function () {
    var btn = document.getElementById('specCopy');
    var grid = document.getElementById('specGrid');
    var cfg = document.getElementById('cfgNote');
    if (!btn || !grid) return;
    btn.addEventListener('click', function () {
      var side = (cfg && cfg.textContent.trim() === 'as found') ? 'stock' : 'frank';
      var lines = ['PROJECT FRANKENSTEIN — SPEC SHEET (' + side.toUpperCase() + ')', ''];
      grid.querySelectorAll('.spec').forEach(function (sp) {
        var k = sp.querySelector('.spec__k');
        var v = sp.querySelector('.spec__v');
        if (k && v) lines.push(k.textContent.trim() + ': ' + v.textContent.trim());
      });
      lines.push('', 'cooooked.github.io/project-frankenstein');
      var text = lines.join('\n');
      function done() {
        btn.classList.add('is-done'); btn.textContent = 'Copied';
        setTimeout(function () { btn.classList.remove('is-done'); btn.textContent = 'Copy spec sheet'; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(); });
      } else fallback();
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        ta.remove();
      }
    });
  })();

  // Pack calculator — series/parallel → volts & energy (educational approximation)
  (function () {
    var sEl = document.getElementById('pcSeries');
    var pEl = document.getElementById('pcPar');
    if (!sEl || !pEl) return;
    var nom = document.getElementById('pcNom'), peak = document.getElementById('pcPeak');
    var cells = document.getElementById('pcCells'), wh = document.getElementById('pcWh');
    var sOut = document.getElementById('pcS'), pOut = document.getElementById('pcP');
    var CELL_V_NOM = 3.6, CELL_V_PEAK = 4.2, CELL_AH = 50;
    function fmt(n) { return n.toLocaleString('en-US'); }
    function update() {
      var s = +sEl.value, p = +pEl.value;
      sOut.textContent = s + 'S'; pOut.textContent = p + 'P';
      nom.textContent = (s * CELL_V_NOM).toFixed(1) + ' V';
      peak.textContent = (s * CELL_V_PEAK).toFixed(1) + ' V';
      cells.textContent = fmt(s * p);
      wh.textContent = fmt(Math.round(s * CELL_V_NOM * p * CELL_AH)) + ' Wh';
    }
    sEl.addEventListener('input', update);
    pEl.addEventListener('input', update);
    update();
  })();

  // Inline jargon tooltips — dotted terms explain themselves on hover/focus
  (function () {
    var TERMS = [
      [/\b12S4P\b/g, '12S4P — 12 cell groups in series, 4 in parallel. Series sets voltage; parallel sets capacity.'],
      [/\b16S3P\b/g, '16S3P — the planned arrangement: 16 in series for +33% voltage, 3 in parallel.'],
      [/\bfield weakening\b/gi, 'Field weakening — a bounded, reversible controller technique that trades efficiency for top speed.'],
      [/\bVESC\b/g, 'VESC — open-source motor-controller platform; the D100S is built around it.'],
      [/\bD100S\b/g, 'D100S — a VESC-based controller sized for the factory mounting pattern.'],
      [/\bP50B\b/g, 'P50B — Molicel high-discharge cell chosen for the Stage 1 pack.'],
      [/\bBLE bridge\b/gi, 'BLE bridge — a small Bluetooth link meant to keep the Phaze remote working through the conversion.'],
      [/\bsag\b/gi, 'Sag — voltage drop under load. The reason this project exists.']
    ];
    var SKIP = { GUIDE: true, SCRIPT: true, STYLE: true, CANVAS: true, DETAILS: true, BUTTON: true, A: true, SUMMARY: true, CODE: true, PRE: true };
    var guide = document.getElementById('guide');
    var made = 0, MAX = 14;
    var walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        while (p && p !== document.body) {
          if (p === guide || SKIP[p.tagName]) return NodeFilter.FILTER_REJECT;
          p = p.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      if (made >= MAX) return;
      var text = node.nodeValue;
      TERMS.forEach(function (pair) {
        if (made >= MAX) return;
        pair[0].lastIndex = 0;
        var m = pair[0].exec(text);
        if (!m) return;
        var span = document.createElement('span');
        span.className = 'jterm';
        span.tabIndex = 0;
        span.title = pair[1];
        span.textContent = m[0];
        var rest = document.createTextNode(text.slice(m.index + m[0].length));
        node.parentNode.insertBefore(span, node);
        node.parentNode.insertBefore(rest, span.nextSibling ? span.nextSibling : null);
        // node keeps the prefix text
        node.nodeValue = text.slice(0, m.index);
        made++;
      });
    });
  })();
