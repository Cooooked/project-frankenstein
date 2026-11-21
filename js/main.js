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
