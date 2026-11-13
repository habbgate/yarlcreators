// Yarl Creators — public site behaviour
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var svg = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var CHECK = svg('<path d="M20 6 9 17l-5-5"/>');

  // ---------- header ----------
  var header = $('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  var menuBtn = $('.menu-btn');
  var mnav = $('#mobile-nav');
  function setMenu(open) {
    mnav.classList.toggle('open', open);
    document.documentElement.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    var path = menuBtn.querySelector('path');
    if (path) path.setAttribute('d', open ? 'M6 6l12 12M18 6 6 18' : 'M4 8h16M4 16h16');
  }
  if (menuBtn && mnav) {
    menuBtn.addEventListener('click', function () {
      setMenu(!mnav.classList.contains('open'));
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
  }
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  // ---------- one entrance: fade and rise ----------
  function observeReveal(scope) {
    var els = $$('.reveal:not(.in)', scope);
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
  }
  observeReveal(document);

  // Testimonial slider
  var voices = $$('.voice');
  if (voices.length) {
    var vi = 0, timer = null;
    var dots = $$('[data-dot]');
    var show = function (n) {
      vi = (n + voices.length) % voices.length;
      voices.forEach(function (v, i) { v.classList.toggle('on', i === vi); v.setAttribute('aria-hidden', String(i !== vi)); });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === vi); });
    };
    var auto = function () {
      clearInterval(timer);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(function () { show(vi + 1); }, 7000);
    };
    $$('[data-voice]').forEach(function (b) { b.addEventListener('click', function () { show(vi + parseInt(b.getAttribute('data-voice'), 10)); auto(); }); });
    dots.forEach(function (d) { d.addEventListener('click', function () { show(parseInt(d.getAttribute('data-dot'), 10)); auto(); }); });
    auto();
  }

  // Insights: category filter over the cards rendered by PHP
  var filters = $('#post-filters');
  var grid = $('#post-grid');
  if (filters && grid) {
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('.chip-btn');
      if (!b) return;
      var cat = b.getAttribute('data-cat');
      $$('.chip-btn', filters).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      $$('.work-card', grid).forEach(function (card) {
        card.hidden = !!cat && card.getAttribute('data-cat') !== cat;
        if (!card.hidden) card.classList.add('in');
      });
    });
  }

  // ---------- contact form ----------
  var form = $('#contact-form');
  if (form) {
    var status = $('#form-status');
    var setErr = function (name, msg) {
      var f = form.querySelector('[name="' + name + '"]');
      if (!f) return;
      var wrap = f.closest('.field');
      wrap.classList.toggle('invalid', !!msg);
      var e = wrap.querySelector('.err');
      if (e) e.textContent = msg || '';
      f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };
    var pre = new URLSearchParams(location.search).get('service');
    if (pre && form.service) {
      var match = $$('option', form.service).filter(function (o) { return o.value.toLowerCase() === pre.toLowerCase(); })[0];
      if (match) form.service.value = match.value;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
      var errs = {};
      if (!data.name) errs.name = 'Enter your name';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) errs.email = 'Enter a valid email';
      if (!/^[+\d][\d\s()-]{6,}$/.test(data.phone || '')) errs.phone = 'Enter a valid phone number';
      ['name', 'email', 'phone'].forEach(function (k) { setErr(k, errs[k]); });
      if (Object.keys(errs).length) {
        status.className = 'form-status bad';
        status.textContent = 'Please check the highlighted fields';
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Sending';
      fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) {
            Object.keys(res.j.errors || {}).forEach(function (k) { setErr(k, res.j.errors[k]); });
            throw new Error(res.j.error || 'Something went wrong');
          }
          form.outerHTML = '<div class="success"><span class="ic">' + CHECK + '</span><h3>Thank you, ' + esc(data.name.split(' ')[0]) + '</h3><p>Your message is with our team. We will get back to you by email or phone.</p></div>';
        })
        .catch(function (err) {
          status.className = 'form-status bad';
          status.textContent = err.message === 'Failed to fetch' ? 'Network error. Please try again.' : err.message;
          btn.disabled = false;
        });
    });
  }
})();
