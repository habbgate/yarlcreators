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
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function getJSON(url) {
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  var BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>';

  // ---------- header ----------
  var header = $('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- full-screen menu ----------
  var sheet = $('#menu-sheet');
  var openBtn = $('.head-cta .menu-btn');
  function setMenu(open) {
    if (!sheet) return;
    sheet.classList.toggle('open', open);
    sheet.setAttribute('aria-hidden', String(!open));
    if (openBtn) openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var c = $('.menu-close', sheet); c && c.focus(); } else if (openBtn) openBtn.focus();
  }
  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  if (sheet) {
    $('.menu-close', sheet).addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('open')) setMenu(false); });
  }
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  // ---------- one entrance: fade and rise ----------
  function observeReveal(scope) {
    var els = $$('.reveal:not(.in)', scope);
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
  }
  observeReveal(document);

  // ---------- services: image follows the cursor ----------
  var preview = $('.cursor-preview');
  var rows = $$('[data-preview]');
  if (preview && rows.length && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var img = $('img', preview);
    var x = 0, y = 0, cx = 0, cy = 0, raf = null;
    var loop = function () {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      preview.style.transform = 'translate3d(' + (cx - 140) + 'px,' + (cy - 105) + 'px,0) scale(' + (preview.classList.contains('on') ? 1 : 0.9) + ')';
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(loop) : null;
    };
    rows.forEach(function (r) {
      r.addEventListener('mouseenter', function (e) { img.src = r.getAttribute('data-preview'); cx = x = e.clientX; cy = y = e.clientY; preview.classList.add('on'); loop(); });
      r.addEventListener('mouseleave', function () { preview.classList.remove('on'); });
      r.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    });
  }

  // ---------- cards ----------
  function workCard(p, i) {
    return '<a class="work-card reveal" href="/insights/' + encodeURIComponent(p.slug) + '">' +
      '<div class="ph">' + (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy">' : '') + '</div>' +
      '<div class="txt"><div class="cap mono"><span>' + pad(i + 1) + ' — ' + esc(p.category || 'Insight') + '</span><span>' + fmtDate(p.publishedAt) + '</span></div>' +
      '<h3><span>' + esc(p.title) + '</span></h3>' +
      (i === 0 && p.excerpt ? '<p class="work-ex">' + esc(p.excerpt) + '</p>' : '') + '</div></a>';
  }
  function postCard(p, i, lead) {
    var cap = '<div class="cap mono"><span>' + pad(i + 1) + ' — ' + esc(p.category || 'Insight') + '</span><span>' + fmtDate(p.publishedAt) + '</span></div>';
    var media = '<div class="ph">' + (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy">' : '') + '</div>';
    var text = '<h3>' + esc(p.title) + '</h3>' + (p.excerpt ? '<p>' + esc(p.excerpt) + '</p>' : '');
    return '<a class="post-card reveal' + (lead ? ' lead' : '') + '" href="/insights/' + encodeURIComponent(p.slug) + '">' +
      (lead ? media + '<div>' + cap + text + '</div>' : media + cap + text) + '</a>';
  }

  // Home: featured posts chosen in the admin dashboard
  var featured = $('#featured-posts');
  if (featured) {
    getJSON('/api/blogs?featured=1&limit=3').then(function (list) {
      return list.length ? list : getJSON('/api/blogs?limit=3');
    }).then(function (list) {
      if (!list.length) { featured.closest('section').hidden = true; return; }
      featured.innerHTML = list.map(workCard).join('');
      observeReveal(featured);
    }).catch(function () { featured.closest('section').hidden = true; });
  }

  // Insights list with category filter
  var grid = $('#post-grid');
  if (grid) {
    var filters = $('#post-filters');
    var all = [];
    var render = function (cat) {
      var list = cat ? all.filter(function (p) { return p.category === cat; }) : all;
      grid.innerHTML = list.length ? list.map(function (p, i) { return postCard(p, i, i === 0 && !cat); }).join('') : '<div class="empty mono">No posts in this category yet</div>';
      observeReveal(grid);
    };
    getJSON('/api/blogs?limit=60').then(function (list) {
      all = list;
      var cats = [];
      list.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
      if (filters && cats.length > 1) {
        filters.innerHTML = '<button class="chip" aria-pressed="true" data-cat="">All</button>' +
          cats.map(function (c) { return '<button class="chip" aria-pressed="false" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
        filters.addEventListener('click', function (e) {
          var b = e.target.closest('.chip');
          if (!b) return;
          $$('.chip', filters).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
          render(b.getAttribute('data-cat'));
        });
      }
      render('');
    }).catch(function () { grid.innerHTML = '<div class="empty mono">Posts could not be loaded. Please refresh the page.</div>'; });
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
          '<div class="meta mono"><a class="tlink" href="/insights" style="margin-right:16px;color:var(--ink)">' + BACK + 'All insights</a>' +
            '<span>' + esc(p.category || 'Insight') + '</span><span>' + fmtDate(p.publishedAt) + '</span><span>' + p.readingMinutes + ' min read</span></div>' +
          '<div><h1>' + esc(p.title) + '</h1>' + (p.excerpt ? '<p class="lede">' + esc(p.excerpt) + '</p>' : '') + '</div>' +
        '</header></div>' +
        (p.cover ? '<figure class="article-cover" style="margin:0"><img src="' + esc(p.cover) + '" alt=""></figure>' : '') +
        '<div class="wrap"><div class="prose">' + p.content + '</div></div>';
      var more = $('#more-posts');
      if (more && p.more && p.more.length) {
        more.hidden = false;
        $('#more-grid').innerHTML = p.more.map(function (x, i) { return postCard(x, i, false); }).join('');
        observeReveal(more);
      }
    }).catch(function () {
      article.innerHTML = '<div class="wrap"><header class="article-head"><span class="idx">404</span><div><h1>Post not found</h1><p class="lede" style="margin-bottom:40px">It may have been moved or unpublished.</p><a class="btn" href="/insights">See all insights ' + ARROW + '</a></div></header></div>';
    });
  }

  // Team
  var team = $('#team-grid');
  if (team) {
    getJSON('/api/team').then(function (list) {
      team.innerHTML = list.map(function (m, i) {
        return '<article class="member reveal"><div class="ph">' +
          (m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy">' : '<div class="skeleton" style="aspect-ratio:4/5"></div>') +
          '</div><div class="meta"><h3>' + esc(m.name) + '</h3><span class="mono muted">' + pad(i + 1) + '</span></div>' +
          '<div class="role mono">' + esc(m.role) + '</div>' +
          (m.bio ? '<p>' + esc(m.bio) + '</p>' : '') + '</article>';
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
    if (pre && form.service) form.service.value = pre;

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
          form.outerHTML = '<div class="success"><h3>Thank you, ' + esc(data.name.split(' ')[0]) + '</h3><p>Your message is with our team. We will get back to you by email or phone.</p></div>';
        })
        .catch(function (err) {
          status.className = 'form-status bad';
          status.textContent = err.message === 'Failed to fetch' ? 'Network error. Please try again.' : err.message;
          btn.disabled = false;
        });
    });
  }
})();
