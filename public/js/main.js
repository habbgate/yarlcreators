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
  function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; }
  function getJSON(url) {
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  var svg = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var ARROW = svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>');
  var BACK = svg('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>');
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
  if (menuBtn && mnav) {
    menuBtn.addEventListener('click', function () {
      var open = mnav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.classList.contains('open')) { mnav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); }
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

  // ---------- post card ----------
  function postCard(p) {
    return '<a class="work-card reveal" href="/insights/' + encodeURIComponent(p.slug) + '">' +
      (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy">' : '') +
      '<span class="go">' + ARROW + '</span>' +
      '<div class="over"><span class="tag">' + esc(p.category || 'Insight') + '</span><h3>' + esc(p.title) + '</h3>' +
      '<div class="meta">' + fmtDate(p.publishedAt) + ' · ' + (p.readingMinutes || 1) + ' min read</div></div></a>';
  }

  // Home: featured posts chosen in the admin dashboard
  var featured = $('#featured-posts');
  if (featured) {
    getJSON('/api/blogs?featured=1&limit=3').then(function (list) {
      return list.length ? list : getJSON('/api/blogs?limit=3');
    }).then(function (list) {
      if (!list.length) { featured.closest('section').hidden = true; return; }
      featured.innerHTML = list.map(postCard).join('');
      observeReveal(featured);
    }).catch(function () { featured.closest('section').hidden = true; });
  }

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

  // Insights list with category filter
  var grid = $('#post-grid');
  if (grid) {
    var filters = $('#post-filters');
    var all = [];
    var render = function (cat) {
      var list = cat ? all.filter(function (p) { return p.category === cat; }) : all;
      grid.innerHTML = list.length ? list.map(function (p) { return postCard(p); }).join('') : '<div class="empty">No posts in this category yet</div>';
      observeReveal(grid);
    };
    getJSON('/api/blogs?limit=60').then(function (list) {
      all = list;
      var cats = [];
      list.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
      if (filters && cats.length > 1) {
        filters.innerHTML = '<button class="chip-btn" aria-pressed="true" data-cat="">All posts</button>' +
          cats.map(function (c) { return '<button class="chip-btn" aria-pressed="false" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
        filters.addEventListener('click', function (e) {
          var b = e.target.closest('.chip-btn');
          if (!b) return;
          $$('.chip-btn', filters).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
          render(b.getAttribute('data-cat'));
        });
      }
      render('');
    }).catch(function () { grid.innerHTML = '<div class="empty">Posts could not be loaded. Please refresh the page.</div>'; });
  }

  // Single article
  var article = $('#article');
  if (article) {
    var slug = decodeURIComponent(location.pathname.replace(/^\/insights\//, '').replace(/\/$/, ''));
    getJSON('/api/blogs/' + encodeURIComponent(slug)).then(function (p) {
      document.title = p.title + ' | Yarl Creators';
      var md = $('meta[name="description"]');
      if (md && p.excerpt) md.setAttribute('content', p.excerpt);
      article.innerHTML =
        '<div class="wrap"><header class="article-head">' +
          '<a class="back" href="/insights">' + BACK + 'All insights</a>' +
          '<div class="meta"><span class="tag">' + esc(p.category || 'Insight') + '</span><span>' + fmtDate(p.publishedAt) + ' · ' + p.readingMinutes + ' min read</span></div>' +
          '<h1>' + esc(p.title) + '</h1>' + (p.excerpt ? '<p class="lede">' + esc(p.excerpt) + '</p>' : '') +
        '</header>' +
        (p.cover ? '<figure class="article-cover" style="margin:0"><img src="' + esc(p.cover) + '" alt=""></figure>' : '') +
        '<div class="prose">' + p.content + '</div></div>';
      var more = $('#more-posts');
      if (more && p.more && p.more.length) {
        more.hidden = false;
        $('#more-grid').innerHTML = p.more.map(function (x) { return postCard(x); }).join('');
        observeReveal(more);
      }
    }).catch(function () {
      article.innerHTML = '<div class="wrap"><header class="article-head"><h1>Post not found</h1><p class="lede">It may have been moved or unpublished.</p><p style="margin-top:32px"><a class="btn" href="/insights">See all insights ' + ARROW + '</a></p></header></div>';
    });
  }

  // Team
  var team = $('#team-grid');
  if (team) {
    getJSON('/api/team').then(function (list) {
      team.innerHTML = list.map(function (m) {
        return '<article class="member reveal"><div class="ph">' +
          (m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy">' : '<div class="skeleton" style="min-height:0;aspect-ratio:1"></div>') +
          '</div><div class="body"><h3>' + esc(m.name) + '</h3><span class="role">' + esc(m.role) + '</span>' +
          (m.bio ? '<p>' + esc(m.bio) + '</p>' : '') + '</div></article>';
      }).join('');
      observeReveal(team);
    }).catch(function () { team.innerHTML = ''; });
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
