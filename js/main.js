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
