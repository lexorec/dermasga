(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var waFloat = document.querySelector('.wa-float');
  var hero = document.getElementById('inicio');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header border once the page scrolls */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
  }

  /* Move focus to the section reached by an in-page link (smooth scroll is CSS) */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    window.setTimeout(function () { target.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
  });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    if (waFloat) waFloat.classList.add('is-visible');
    return;
  }

  /* Scroll reveal, staggered among siblings */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  revealEls.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains('reveal');
    });
    var i = siblings.indexOf(el);
    el.style.setProperty('--reveal-delay', Math.min(i, 6) * 80 + 'ms');
  });

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('is-visible');
      revealObserver.unobserve(el);
      /* Hand the element back to its own hover transitions once revealed */
      el.addEventListener('transitionend', function done(ev) {
        if (ev.target !== el || ev.propertyName !== 'transform') return;
        el.classList.remove('reveal', 'reveal-media');
        el.style.removeProperty('--reveal-delay');
        el.removeEventListener('transitionend', done);
      });
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* Highlight the nav link for the section in view */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sections = links.map(function (l) { return document.getElementById(l.getAttribute('href').slice(1)); }).filter(Boolean);
  var navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (l) {
        var active = l.getAttribute('href') === '#' + entry.target.id;
        l.classList.toggle('is-active', active);
        if (active) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (s) { navObserver.observe(s); });

  /* Floating WhatsApp button once the hero is out of view */
  if (waFloat && hero) {
    new IntersectionObserver(function (entries) {
      waFloat.classList.toggle('is-visible', !entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(hero);
  }
})();
