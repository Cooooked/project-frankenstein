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
