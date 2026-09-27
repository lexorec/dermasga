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

  /* "Abierto ahora" status from the opening hours, in Ecuador time (UTC-5, no daylight saving) */
  (function () {
    var slots = document.querySelectorAll('[data-open-status]');
    var dataEl = document.getElementById('opening-hours');
    if (!slots.length || !dataEl) return;
    var hours;
    try { hours = JSON.parse(dataEl.textContent); } catch (e) { return; }
    var en = document.documentElement.lang === 'en';
    var codes = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    var dayNames = en
      ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      : ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    function daysOf(spec) {
      var out = [];
      (spec || '').split(',').forEach(function (part) {
        var r = part.trim().split('-'), a = codes.indexOf(r[0]), b = codes.indexOf(r[1] || r[0]);
        if (a < 0 || b < 0) return;
        for (var d = a; ; d = (d + 1) % 7) { out.push(d); if (d === b) break; }
      });
      return out;
    }
    function mins(t) { var p = (t || '').split(':'); return p.length === 2 ? (+p[0]) * 60 + (+p[1]) : null; }
    function fmt(m) {
      var h = Math.floor(m / 60), mm = ('0' + (m % 60)).slice(-2), h12 = h % 12 || 12;
      return h12 + ':' + mm + '\u00a0' + (h >= 12 ? (en ? 'p.m.' : 'p.\u00a0m.') : (en ? 'a.m.' : 'a.\u00a0m.'));
    }
    var week = [[], [], [], [], [], [], []];
    hours.forEach(function (h) {
      var o = mins(h.opens), c = mins(h.closes);
      if (o === null || c === null) return;
      daysOf(h.days).forEach(function (d) { week[d].push([o, c]); });
    });

    function render() {
      var now = new Date(Date.now() - 5 * 3600 * 1000); /* Ecuador local time via UTC fields */
      var day = now.getUTCDay(), cur = now.getUTCHours() * 60 + now.getUTCMinutes();
      var text = '', open = false;
      week[day].forEach(function (r) { if (cur >= r[0] && cur < r[1]) { open = true; text = (en ? 'Open now · until ' : 'Abierto ahora · hasta las ') + fmt(r[1]); } });
      if (!open) {
        for (var i = 0; i < 8 && !text; i++) {
          var d = (day + i) % 7;
          week[d].slice().sort(function (x, y) { return x[0] - y[0]; }).some(function (r) {
            if (i === 0 && r[0] <= cur) return false;
            var when = i === 0 ? (en ? 'today' : 'hoy') : i === 1 ? (en ? 'tomorrow' : 'mañana') : (en ? 'on ' : 'el ') + dayNames[d];
            text = (en ? 'Closed · opens ' : 'Cerrado · abre ') + when + (en ? ' at ' : ' a las ') + fmt(r[0]);
            return true;
          });
        }
      }
      slots.forEach(function (el) {
        if (!text) { el.hidden = true; return; }
        el.textContent = text;
        el.classList.toggle('is-open', open);
        el.hidden = false;
      });
    }
    render();
    window.setInterval(render, 60000);
  })();

  /* Gentle WhatsApp nudge: once per visit, after 40 s or most of the page read, never over the hero */
  (function () {
    var nudge = document.querySelector('[data-wa-nudge]');
    if (!nudge || !waFloat) return;
    var KEY = 'waNudgeShown';
    try { if (window.sessionStorage.getItem(KEY)) return; } catch (e) { /* storage blocked: still show once */ }
    var shown = false;
    function show() {
      if (shown || !waFloat.classList.contains('is-visible')) return;
      shown = true;
      try { window.sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
      nudge.hidden = false;
      window.requestAnimationFrame(function () { nudge.classList.add('is-visible'); });
    }
    function hide() { nudge.classList.remove('is-visible'); window.setTimeout(function () { nudge.hidden = true; }, 300); }
    var timer = window.setTimeout(function tick() { if (!shown) { show(); if (!shown) timer = window.setTimeout(tick, 5000); } }, 40000);
    window.addEventListener('scroll', function () {
      var doc = document.documentElement;
      if ((window.scrollY + window.innerHeight) / doc.scrollHeight > 0.6) show();
    }, { passive: true });
    nudge.querySelector('.wa-nudge__close').addEventListener('click', hide);
    nudge.querySelector('.wa-nudge__text').addEventListener('click', hide);
    waFloat.addEventListener('click', hide);
  })();

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
