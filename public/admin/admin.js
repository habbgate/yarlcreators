// Yarl Creators — admin dashboard (no build step, plain JS)
(function () {
  'use strict';

  // ---------- utilities ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
  function ago(d) {
    if (!d) return '';
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return 'Just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    if (s < 172800) return 'Yesterday';
    return fmtDate(d);
  }
  const dateInput = (d) => { const x = d ? new Date(d) : new Date(); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

  const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    home: P('<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>'),
    inbox: P('<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'),
    file: P('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>'),
    users: P('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    external: P('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
    logout: P('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>'),
    menu: P('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    search: P('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    plus: P('<path d="M5 12h14"/><path d="M12 5v14"/>'),
    download: P('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>'),
    x: P('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    trash: P('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>'),
    edit: P('<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>'),
    eye: P('<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),
    eyeoff: P('<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>'),
    star: P('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    image: P('<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'),
    upload: P('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>'),
    bold: P('<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>'),
    italic: P('<line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>'),
    underline: P('<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/>'),
    link: P('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
    ul: P('<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>'),
    ol: P('<line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>'),
    quote: P('<path d="M17 6H3"/><path d="M21 12H8"/><path d="M21 18H8"/><path d="M3 12v6"/>'),
    video: P('<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>'),
    divider: P('<path d="M3 12h18"/><path d="M8 6h8"/><path d="M8 18h8"/>'),
    undo: P('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>'),
    redo: P('<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>'),
    code: P('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
    grip: P('<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>'),
    mail: P('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
    phone: P('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
    archive: P('<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>'),
    check: P('<path d="M20 6 9 17l-5-5"/>'),
    info: P('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    fileup: P('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/>'),
  };
  const ic = (n) => `<i data-icon="${n}">${ICONS[n] || ''}</i>`;
  function paintIcons(root = document) { $$('i[data-icon]', root).forEach((el) => { if (!el.innerHTML) el.innerHTML = ICONS[el.dataset.icon] || ''; }); }

  // ---------- API ----------
  async function api(method, url, body) {
    const res = await fetch('/api/admin' + url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
    if (res.status === 401 && url !== '/login') { showLogin(); throw new Error('Signed out'); }
    const data = res.headers.get('content-type')?.includes('json') ? await res.json() : null;
    if (!res.ok) throw new Error(data?.error || 'Request failed (' + res.status + ')');
    return data;
  }

  // ---------- UI helpers ----------
  function toast(msg, bad) {
    const t = document.createElement('div');
    t.className = 'toast' + (bad ? ' bad' : '');
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), bad ? 5000 : 2600);
  }
  const fail = (e) => { if (e.message !== 'Signed out') toast(e.message, true); };

  const modal = $('#modal');
  function openModal(html, onReady) {
    return new Promise((resolve) => {
      modal.innerHTML = html;
      paintIcons(modal);
      const done = (v) => { modal.close(); resolve(v); };
      modal.onclose = () => resolve(null);
      modal.oncancel = () => resolve(null);
      onReady && onReady(modal, done);
      modal.showModal();
      const first = modal.querySelector('input:not([type=hidden]):not([type=checkbox]), textarea, button.primary');
      first && first.focus();
    });
  }
  function confirmBox(title, text, okLabel = 'Delete', danger = true) {
    return openModal(`<form method="dialog"><div class="modal-head"><h2>${esc(title)}</h2><p>${esc(text)}</p></div>
      <div class="modal-foot"><button class="btn" value="no">Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" value="yes">${esc(okLabel)}</button></div></form>`,
      (m, done) => { $('form', m).onsubmit = (e) => { e.preventDefault(); done(e.submitter?.value === 'yes'); }; }).then((v) => v === true);
  }
  function promptBox(title, fields, okLabel = 'Save') {
    return openModal(`<form><div class="modal-head"><h2>${esc(title)}</h2></div><div class="modal-body">
      ${fields.map((f) => `<label class="field"><span>${esc(f.label)}</span>${f.type === 'textarea' ? `<textarea name="${f.name}">${esc(f.value || '')}</textarea>` : `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}">`}${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</label>`).join('')}
      </div><div class="modal-foot"><button class="btn" type="button" data-x>Cancel</button><button class="btn primary">${esc(okLabel)}</button></div></form>`,
      (m, done) => {
        $('[data-x]', m).onclick = () => done(null);
        $('form', m).onsubmit = (e) => { e.preventDefault(); done(Object.fromEntries(new FormData(e.target))); };
      });
  }

  const drawer = $('#drawer');
  const scrim = $('#scrim');
  function openDrawer(html) {
    drawer.innerHTML = html;
    paintIcons(drawer);
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    scrim.hidden = false;
    setTimeout(() => $('[data-close]', drawer)?.focus(), 50);
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    scrim.hidden = true;
    $$('.tbl tr.sel').forEach((r) => r.classList.remove('sel'));
  }
  scrim.addEventListener('click', () => { closeDrawer(); $('#sidebar').classList.remove('open'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });

  // ---------- images: file -> resized base64 -> MongoDB ----------
  function readAsDataUrl(file) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error('Could not read the file')); r.readAsDataURL(file); });
  }
  async function fileToDataUrl(file, maxDim) {
    if (!file.type.startsWith('image/')) throw new Error(file.name + ' is not an image');
    if (/gif|svg/.test(file.type)) return readAsDataUrl(file);
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch { return readAsDataUrl(file); }
    const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(bmp, 0, 0, w, h);
    let url = c.toDataURL('image/webp', 0.86);
    if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', 0.86);
    return url;
  }
  async function uploadImage(file, maxDim = 1920) {
    const dataUrl = await fileToDataUrl(file, maxDim);
    return api('POST', '/media', { dataUrl, name: file.name });
  }
  function bindDrop(el, onFiles) {
    ['dragenter', 'dragover'].forEach((t) => el.addEventListener(t, (e) => { if (hasFiles(e)) { e.preventDefault(); el.classList.add('over'); } }));
    ['dragleave', 'dragend'].forEach((t) => el.addEventListener(t, (e) => { if (!el.contains(e.relatedTarget)) el.classList.remove('over'); }));
    el.addEventListener('drop', (e) => {
      el.classList.remove('over');
      const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;
      e.preventDefault();
      onFiles(files, e);
    });
  }
  const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files');
  function pickFiles(accept, multiple) {
    return new Promise((resolve) => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = accept; inp.multiple = !!multiple;
      inp.onchange = () => resolve(Array.from(inp.files || []));
      inp.click();
    });
  }

  // Single image dropzone (cover photo, team photo)
  function imageDrop(el, { url, maxDim, onChange, label = 'Drop an image here', hint = 'or click to choose. JPG, PNG or WebP' }) {
    let current = url || null;
    const render = (busy) => {
      el.classList.toggle('has', !!current);
      el.innerHTML = current
        ? `<img class="preview" src="${esc(current)}" alt=""><div class="drop-actions"><button type="button" class="btn sm" data-replace>Replace</button><button type="button" class="btn sm danger" data-remove aria-label="Remove image">${ic('trash')}</button></div>`
        : `${ic('image')}<strong>${esc(label)}</strong><span>${esc(hint)}</span>`;
      if (busy) el.insertAdjacentHTML('beforeend', '<div class="busy">Uploading</div>');
      paintIcons(el);
    };
    const handle = async (file) => {
      render(true);
      try {
        const r = await uploadImage(file, maxDim);
        current = r.url;
        onChange(r);
        render();
      } catch (e) { render(); fail(e); }
    };
    el.addEventListener('click', async (e) => {
      if (e.target.closest('[data-remove]')) { current = null; onChange(null); render(); return; }
      const [f] = await pickFiles('image/*');
      if (f) handle(f);
    });
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
    bindDrop(el, (files) => handle(files[0]));
    render();
  }

  // ---------- auth ----------
  function showLogin() {
    $('#app').hidden = true;
    $('#login').hidden = false;
    closeDrawer();
    setTimeout(() => $('#login-form [name=email]').focus(), 30);
  }
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    const btn = $('button', e.target);
    btn.disabled = true;
    $('#login-err').textContent = '';
    try {
      await api('POST', '/login', fd);
      e.target.reset();
      boot();
    } catch (err) { $('#login-err').textContent = err.message; }
    btn.disabled = false;
  });
  $('#logout').addEventListener('click', async () => { await api('POST', '/logout').catch(() => {}); showLogin(); });
  $('#menu').addEventListener('click', () => { $('#sidebar').classList.add('open'); scrim.hidden = false; });

  async function boot() {
    try {
      const me = await api('GET', '/me');
      $('#me-email').textContent = me.email;
      $('#me-av').textContent = (me.email[0] || 'A').toUpperCase();
      $('#login').hidden = true;
      $('#app').hidden = false;
      paintIcons();
      refreshBadge();
      route();
    } catch { /* showLogin already called on 401 */ }
  }
  async function refreshBadge() {
    try {
      const list = await api('GET', '/contacts?status=new');
      $('#nav-new').textContent = list.length || '';
    } catch {}
  }

  // ---------- router ----------
  const state = { dirty: false, lastHash: location.hash };
  window.addEventListener('beforeunload', (e) => { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });
  window.addEventListener('hashchange', () => {
    if (state.dirty && !confirm('You have unsaved changes. Leave without saving?')) {
      history.replaceState(null, '', state.lastHash || '#/');
      return;
    }
    state.dirty = false;
    route();
  });

  function setChrome(crumbs, actions = '') {
    $('#crumbs').innerHTML = crumbs;
    $('#top-actions').innerHTML = actions;
    paintIcons($('#top-actions'));
  }

  function route() {
    state.lastHash = location.hash;
    const parts = location.hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean);
    const key = parts[0] || 'overview';
    $$('.side-nav a[data-route]').forEach((a) => a.classList.toggle('active', a.dataset.route === key));
    $('#sidebar').classList.remove('open');
    closeDrawer();
    // fresh element per view so listeners from the previous view do not pile up
    const old = $('#view');
    const view = old.cloneNode(false);
    old.replaceWith(view);
    window.scrollTo(0, 0);
    const views = { overview: viewOverview, enquiries: viewEnquiries, posts: parts[1] ? viewEditor : viewPosts, team: viewTeam };
    (views[key] || viewOverview)(view, parts[1]);
  }

  // ---------- Overview ----------
  async function viewOverview(view) {
    setChrome('<b>Overview</b>', `<a class="btn" href="#/posts/new">${ic('plus')}New post</a>`);
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    view.innerHTML = `<div class="page-title"><div><h1>Overview</h1><p>${today}</p></div></div><div class="stats">${'<div class="card stat"><div class="skel" style="height:58px"></div></div>'.repeat(4)}</div>`;
    let s, posts;
    try { [s, posts] = await Promise.all([api('GET', '/stats'), api('GET', '/blogs')]); } catch (e) { return fail(e); }
    const featured = posts.filter((p) => p.featured && p.status === 'published').sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // 30-day series
    const days = [];
    const byDay = Object.fromEntries(s.daily.map((d) => [d._id, d.n]));
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400e3);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, d, n: byDay[key] || 0 });
    }

    view.innerHTML = `
      <div class="page-title"><div><h1>Overview</h1><p>${today}</p></div></div>
      <div class="stats">
        <a class="card stat" href="#/enquiries" style="text-decoration:none"><span class="label">New enquiries</span><div class="fig accent">${s.contactsNew}</div><div class="delta">${s.contactsTotal} open in total</div></a>
        <div class="card stat"><span class="label">Enquiries, last 30 days</span><div class="fig">${s.contacts30}</div><div class="delta">From the website contact form</div></div>
        <a class="card stat" href="#/posts" style="text-decoration:none"><span class="label">Published posts</span><div class="fig">${s.blogsPublished}</div><div class="delta">${s.blogsDraft} ${s.blogsDraft === 1 ? 'draft' : 'drafts'}, ${s.blogsFeatured} featured</div></a>
        <a class="card stat" href="#/team" style="text-decoration:none"><span class="label">Team members</span><div class="fig">${s.team}</div><div class="delta">Shown on the About page</div></a>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-head"><h2>Enquiries per day</h2><span class="muted num">Last 30 days</span></div>
          <div class="chart" id="chart"></div>
        </div>
        <div class="card">
          <div class="card-head"><h2>Latest enquiries</h2><a class="btn sm ghost" href="#/enquiries">View all</a></div>
          ${s.recent.length ? `<ul class="list">${s.recent.map((c) => `<li><a class="list-row" href="#/enquiries/${c._id}"><span class="dot ${c.status === 'new' ? '' : 'off'}"></span><div class="grow"><div class="t">${esc(c.name)}</div><div class="s">${esc(c.service || c.message || c.email)}</div></div><span class="when">${ago(c.createdAt)}</span></a></li>`).join('')}</ul>`
            : '<div class="empty"><strong>No enquiries yet</strong>Messages from the contact form will appear here</div>'}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>On the home page</h2><a class="btn sm ghost" href="#/posts?featured">Manage posts</a></div>
        ${featured.length ? `<ul class="list">${featured.map((p, i) => `<li><div class="list-row" data-edit="${p.id}"><img class="thumb" src="${esc(p.cover || '')}" alt=""><div class="grow"><div class="t">${esc(p.title)}</div><div class="s">${i < 3 ? (i === 0 ? 'Large feature' : 'Side feature') : 'Featured, but only the newest three are shown'} · ${fmtDate(p.publishedAt)}</div></div><button class="btn sm" data-unfeature="${p.id}">Remove from home</button></div></li>`).join('')}</ul>`
          : '<div class="empty"><strong>No featured posts</strong>Star a post in Insights to show it on the home page. Until then the three newest posts are shown.</div>'}
      </div>`;
    paintIcons(view);
    drawBars($('#chart'), days);
    view.addEventListener('click', async (e) => {
      const un = e.target.closest('[data-unfeature]');
      if (un) { e.stopPropagation(); try { await api('PATCH', '/blogs/' + un.dataset.unfeature, { featured: false }); toast('Removed from the home page'); route(); } catch (er) { fail(er); } return; }
      const ed = e.target.closest('[data-edit]');
      if (ed) location.hash = '#/posts/' + ed.dataset.edit;
    });
  }

  function drawBars(el, days) {
    const W = el.clientWidth - 40, H = el.clientHeight - 28;
    const max = Math.max(4, ...days.map((d) => d.n));
    const step = Math.ceil(max / 4);
    const top = step * 4;
    const left = 28, bw = (W - left) / days.length;
    const y = (v) => H - (v / top) * (H - 8);
    let g = '<g class="grid">';
    for (let v = 0; v <= top; v += step) g += `<line x1="${left}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/>`;
    g += '</g><g class="axis">';
    for (let v = 0; v <= top; v += step) g += `<text x="0" y="${y(v) + 4}">${v}</text>`;
    days.forEach((d, i) => { if ((i % 7 === 0 && i < days.length - 4) || i === days.length - 1) g += `<text x="${left + i * bw + bw / 2}" y="${H + 18}" text-anchor="middle">${d.d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</text>`; });
    g += '</g>';
    const bars = days.map((d, i) => {
      const h = Math.max(d.n ? 3 : 1, H - y(d.n));
      return `<rect class="bar${i === days.length - 1 ? ' today' : ''}" x="${left + i * bw + bw * 0.18}" y="${H - h}" width="${bw * 0.64}" height="${h}" rx="2" data-i="${i}"/>`;
    }).join('');
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H + 24}" preserveAspectRatio="none" role="img" aria-label="Enquiries per day for the last 30 days">${g}${bars}</svg><div class="chart-tip"></div>`;
    const tip = $('.chart-tip', el);
    el.addEventListener('mousemove', (e) => {
      const r = e.target.closest('rect.bar');
      if (!r) { tip.style.opacity = 0; return; }
      const d = days[r.dataset.i];
      tip.textContent = `${d.d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: ${d.n} ${d.n === 1 ? 'enquiry' : 'enquiries'}`;
      const box = el.getBoundingClientRect(), rb = r.getBoundingClientRect();
      tip.style.left = rb.left - box.left + rb.width / 2 + 'px';
      tip.style.top = rb.top - box.top - 6 + 'px';
      tip.style.opacity = 1;
    });
    el.addEventListener('mouseleave', () => { tip.style.opacity = 0; });
  }

  // ---------- Enquiries ----------
  async function viewEnquiries(view, openId) {
    setChrome('<b>Enquiries</b>', `<a class="btn" href="/api/admin/contacts.csv">${ic('download')}Export CSV</a>`);
    let all = [];
    let tab = 'open';
    let q = '';
    view.innerHTML = `<div class="page-title"><div><h1>Enquiries</h1><p>Messages sent through the contact form on the website</p></div></div>
      <div class="toolbar"><div class="tabs" role="tablist" id="etabs"></div><div class="spacer"></div><label class="search">${ic('search')}<input class="input" id="esearch" placeholder="Search" aria-label="Search enquiries"></label></div>
      <div class="card"><div class="table-wrap" id="etable"><div class="empty">Loading</div></div></div>`;
    paintIcons(view);

    const TABS = [['open', 'Inbox'], ['new', 'New'], ['replied', 'Replied'], ['archived', 'Archived'], ['all', 'All']];
    const matchTab = (c, t) => t === 'all' || (t === 'open' ? c.status !== 'archived' : c.status === t);
    const render = () => {
      $('#etabs').innerHTML = TABS.map(([k, l]) => `<button role="tab" aria-selected="${tab === k}" data-tab="${k}">${l} <span class="n">${all.filter((c) => matchTab(c, k)).length}</span></button>`).join('');
      const needle = q.toLowerCase();
      const list = all.filter((c) => matchTab(c, tab) && (!needle || [c.name, c.email, c.phone, c.service, c.message].join(' ').toLowerCase().includes(needle)));
      $('#etable').innerHTML = list.length ? `<table class="tbl"><thead><tr><th>From</th><th class="hide-sm">Phone</th><th class="hide-sm">Service</th><th class="hide-sm">Message</th><th>Received</th><th>Status</th></tr></thead><tbody>
        ${list.map((c) => `<tr class="click ${c.status === 'new' ? 'unread' : ''}" data-id="${c.id}" tabindex="0">
          <td><div class="t">${esc(c.name)}</div><div class="s">${esc(c.email)}</div></td>
          <td class="hide-sm num">${esc(c.phone)}</td>
          <td class="hide-sm">${esc(c.service || '')}</td>
          <td class="hide-sm"><div class="clip sec">${esc(c.message || '')}</div></td>
          <td class="num" style="white-space:nowrap">${ago(c.createdAt)}</td>
          <td><span class="pill ${c.status}">${statusLabel(c.status)}</span></td></tr>`).join('')}</tbody></table>`
        : `<div class="empty"><strong>${q ? 'No matches' : 'Nothing here'}</strong>${q ? 'Try a different search' : 'Enquiries from the contact form will appear here'}</div>`;
    };
    const load = async () => { all = await api('GET', '/contacts?status=all'); render(); };
    try { await load(); } catch (e) { return fail(e); }

    $('#etabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; render(); } });
    $('#esearch').addEventListener('input', (e) => { q = e.target.value.trim(); render(); });
    const openRow = (tr) => { $$('.tbl tr.sel').forEach((r) => r.classList.remove('sel')); tr.classList.add('sel'); showEnquiry(all.find((c) => c.id === tr.dataset.id)); };
    $('#etable').addEventListener('click', (e) => { const tr = e.target.closest('tr[data-id]'); if (tr) openRow(tr); });
    $('#etable').addEventListener('keydown', (e) => { const tr = e.target.closest('tr[data-id]'); if (tr && e.key === 'Enter') openRow(tr); });

    async function setStatus(c, status, msg) {
      await api('PATCH', '/contacts/' + c.id, { status });
      c.status = status;
      render();
      refreshBadge();
      if (msg) toast(msg);
    }

    async function showEnquiry(c) {
      if (!c) return;
      if (c.status === 'new') setStatus(c, 'read').catch(fail);
      const first = esc((c.name || '').split(' ')[0]);
      const mail = `mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent('Re: your enquiry to Yarl Creators')}&body=${encodeURIComponent('Hi ' + (c.name || '').split(' ')[0] + ',\n\n')}`;
      openDrawer(`<div class="drawer-head"><h2>${esc(c.name)}</h2><button class="icon-btn" data-close aria-label="Close">${ic('x')}</button></div>
        <div class="drawer-body">
          <dl class="kv">
            <dt>Email</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd>
            <dt>Phone</dt><dd><a href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}" class="num">${esc(c.phone)}</a></dd>
            <dt>Service</dt><dd>${esc(c.service || 'Not specified')}</dd>
            <dt>Received</dt><dd class="num">${fmtDateTime(c.createdAt)}</dd>
            <dt>Status</dt><dd><span class="pill ${c.status === 'new' ? 'read' : c.status}">${statusLabel(c.status === 'new' ? 'read' : c.status)}</span></dd>
          </dl>
          <p class="label" style="margin:0 0 8px">Message</p>
          <div class="msg">${c.message ? esc(c.message) : '<span class="muted">No message, contact details only</span>'}</div>
        </div>
        <div class="drawer-foot">
          <a class="btn primary" href="${mail}" data-act="reply">${ic('mail')}Reply to ${first}</a>
          <a class="btn" href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}">${ic('phone')}Call</a>
          <span class="spacer"></span>
          ${c.status !== 'replied' ? `<button class="btn" data-act="replied">${ic('check')}Mark replied</button>` : ''}
          ${c.status !== 'archived' ? `<button class="btn" data-act="archive">${ic('archive')}Archive</button>` : `<button class="btn" data-act="restore">Restore</button>`}
          <button class="btn danger" data-act="delete" aria-label="Delete">${ic('trash')}</button>
        </div>`);
      drawer.onclick = async (e) => {
        if (e.target.closest('[data-close]')) return closeDrawer();
        const a = e.target.closest('[data-act]');
        if (!a) return;
        try {
          if (a.dataset.act === 'reply') { setTimeout(() => setStatus(c, 'replied').catch(fail), 400); return; }
          if (a.dataset.act === 'replied') { await setStatus(c, 'replied', 'Marked as replied'); showEnquiry(c); }
          if (a.dataset.act === 'archive') { await setStatus(c, 'archived', 'Archived'); closeDrawer(); }
          if (a.dataset.act === 'restore') { await setStatus(c, 'read', 'Moved back to the inbox'); showEnquiry(c); }
          if (a.dataset.act === 'delete') {
            if (!(await confirmBox('Delete this enquiry?', `The message from ${c.name} will be removed permanently. This cannot be undone.`))) return;
            await api('DELETE', '/contacts/' + c.id);
            all = all.filter((x) => x.id !== c.id);
            closeDrawer(); render(); refreshBadge(); toast('Enquiry deleted');
          }
        } catch (er) { fail(er); }
      };
    }
    if (openId) { const tr = $(`tr[data-id="${openId}"]`); if (tr) openRow(tr); else showEnquiry(all.find((c) => c.id === openId)); }
  }
  const statusLabel = (s) => ({ new: 'New', read: 'Read', replied: 'Replied', archived: 'Archived' }[s] || s);

  // ---------- Posts ----------
  async function viewPosts(view) {
    setChrome('<b>Insights</b>', `<a class="btn primary" href="#/posts/new">${ic('plus')}New post</a>`);
    let all = [];
    let tab = location.hash.includes('featured') ? 'featured' : 'all';
    let q = '';
    view.innerHTML = `<div class="page-title"><div><h1>Insights</h1><p>Blog posts on the Insights page. Star a post to feature it on the home page.</p></div></div>
      <div id="pnote"></div>
      <div class="toolbar"><div class="tabs" role="tablist" id="ptabs"></div><div class="spacer"></div><label class="search">${ic('search')}<input class="input" id="psearch" placeholder="Search" aria-label="Search posts"></label></div>
      <div class="card"><div class="table-wrap" id="ptable"><div class="empty">Loading</div></div></div>`;
    paintIcons(view);
    const TABS = [['all', 'All'], ['published', 'Published'], ['draft', 'Drafts'], ['featured', 'Featured']];
    const matchTab = (p, t) => t === 'all' || (t === 'featured' ? p.featured : p.status === t);
    const render = () => {
      const featuredLive = all.filter((p) => p.featured && p.status === 'published').length;
      $('#pnote').innerHTML = featuredLive > 3
        ? `<div class="note warn">${ic('info')}<span>${featuredLive} posts are featured. The home page shows the newest three, so the others will not appear.</span></div>`
        : `<div class="note">${ic('info')}<span>The home page shows up to three featured posts, newest first. ${featuredLive} of 3 in use.</span></div>`;
      $('#ptabs').innerHTML = TABS.map(([k, l]) => `<button role="tab" aria-selected="${tab === k}" data-tab="${k}">${l} <span class="n">${all.filter((p) => matchTab(p, k)).length}</span></button>`).join('');
      const needle = q.toLowerCase();
      const list = all.filter((p) => matchTab(p, tab) && (!needle || (p.title + ' ' + p.category).toLowerCase().includes(needle)));
      $('#ptable').innerHTML = list.length ? `<table class="tbl"><thead><tr><th>Post</th><th class="hide-sm">Category</th><th>Status</th><th title="Featured on the home page">Home</th><th class="hide-sm">Published</th><th class="right">Actions</th></tr></thead><tbody>
        ${list.map((p) => `<tr data-id="${p.id}">
          <td><a class="cell-post" href="#/posts/${p.id}" style="text-decoration:none">${p.cover ? `<img class="thumb" src="${esc(p.cover)}" alt="">` : '<span class="thumb"></span>'}<span><span class="t">${esc(p.title)}</span><br><span class="s">/insights/${esc(p.slug)}</span></span></a></td>
          <td class="hide-sm sec">${esc(p.category || '')}</td>
          <td><span class="pill ${p.status}">${p.status === 'published' ? 'Published' : 'Draft'}</span></td>
          <td><button class="icon-btn star ${p.featured ? 'on' : ''}" data-star aria-pressed="${p.featured}" title="${p.featured ? 'Remove from home page' : 'Feature on home page'}" aria-label="Feature on home page">${ICONS.star}</button></td>
          <td class="hide-sm num sec">${p.status === 'published' ? fmtDate(p.publishedAt) : 'Not yet'}</td>
          <td><div class="row-actions">
            <a class="icon-btn" href="#/posts/${p.id}" title="Edit" aria-label="Edit">${ICONS.edit}</a>
            ${p.status === 'published' ? `<a class="icon-btn" href="/insights/${esc(p.slug)}" target="_blank" rel="noopener" title="View on site" aria-label="View on site">${ICONS.external}</a>` : `<button class="icon-btn" data-publish title="Publish" aria-label="Publish">${ICONS.upload}</button>`}
            <button class="icon-btn" data-del title="Delete" aria-label="Delete">${ICONS.trash}</button>
          </div></td></tr>`).join('')}</tbody></table>`
        : `<div class="empty"><strong>${q ? 'No matches' : 'No posts here yet'}</strong>${q ? 'Try a different search' : 'Write the first one'}<br><a class="btn primary" href="#/posts/new">${ICONS.plus}New post</a></div>`;
      paintIcons(view);
    };
    try { all = await api('GET', '/blogs'); render(); } catch (e) { return fail(e); }
    $('#ptabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; render(); } });
    $('#psearch').addEventListener('input', (e) => { q = e.target.value.trim(); render(); });
    $('#ptable').addEventListener('click', async (e) => {
      const tr = e.target.closest('tr[data-id]');
      if (!tr) return;
      const p = all.find((x) => x.id === tr.dataset.id);
      try {
        if (e.target.closest('[data-star]')) {
          await api('PATCH', '/blogs/' + p.id, { featured: !p.featured });
          p.featured = !p.featured;
          toast(p.featured ? (p.status === 'published' ? 'Featured on the home page' : 'Featured. It will show once published') : 'Removed from the home page');
          render();
        } else if (e.target.closest('[data-publish]')) {
          await api('PATCH', '/blogs/' + p.id, { status: 'published' });
          p.status = 'published'; p.publishedAt = p.publishedAt || new Date().toISOString();
          toast('Published'); render();
        } else if (e.target.closest('[data-del]')) {
          if (!(await confirmBox('Delete this post?', `“${p.title}” and its images will be removed permanently. This cannot be undone.`))) return;
          await api('DELETE', '/blogs/' + p.id);
          all = all.filter((x) => x.id !== p.id);
          toast('Post deleted'); render();
        }
      } catch (er) { fail(er); }
    });
  }

  // ---------- Post editor ----------
  async function viewEditor(view, id) {
    const isNew = id === 'new';
    let post = { title: '', content: '', excerpt: '', category: '', status: 'draft', featured: false, coverId: null, cover: null, slug: '', publishedAt: null };
    let categories = [];
    try {
      const [p, list] = await Promise.all([isNew ? null : api('GET', '/blogs/' + id), api('GET', '/blogs')]);
      if (p) post = p;
      categories = [...new Set(list.map((x) => x.category).filter(Boolean))];
    } catch (e) { return fail(e); }

    setChrome(`<a href="#/posts">Insights</a><span>/</span><b id="crumb-title">${esc(post.title || 'New post')}</b>`,
      `<span class="muted hide-sm" id="save-state"></span>${!isNew && post.status === 'published' ? `<a class="btn" href="/insights/${esc(post.slug)}" target="_blank" rel="noopener">${ic('external')}View</a>` : ''}<button class="btn primary" id="save">${isNew ? 'Save' : 'Update'}</button>`);

    view.innerHTML = `
      <div class="editor-layout">
        <div class="editor-main">
          <textarea class="title-input" id="title" rows="1" placeholder="Post title" aria-label="Title">${esc(post.title)}</textarea>
          <div class="rte" id="rte">
            <div class="rte-bar" role="toolbar" aria-label="Formatting">
              <select id="block" aria-label="Text style"><option value="p">Paragraph</option><option value="h2">Heading</option><option value="h3">Subheading</option></select>
              <span class="sep"></span>
              <button type="button" class="icon-btn" data-cmd="bold" title="Bold (Ctrl B)" aria-label="Bold">${ICONS.bold}</button>
              <button type="button" class="icon-btn" data-cmd="italic" title="Italic (Ctrl I)" aria-label="Italic">${ICONS.italic}</button>
              <button type="button" class="icon-btn" data-cmd="underline" title="Underline (Ctrl U)" aria-label="Underline">${ICONS.underline}</button>
              <button type="button" class="icon-btn" data-act="link" title="Link (Ctrl K)" aria-label="Link">${ICONS.link}</button>
              <span class="sep"></span>
              <button type="button" class="icon-btn" data-cmd="insertUnorderedList" title="Bulleted list" aria-label="Bulleted list">${ICONS.ul}</button>
              <button type="button" class="icon-btn" data-cmd="insertOrderedList" title="Numbered list" aria-label="Numbered list">${ICONS.ol}</button>
              <button type="button" class="icon-btn" data-act="quote" title="Quote" aria-label="Quote">${ICONS.quote}</button>
              <span class="sep"></span>
              <button type="button" class="icon-btn" data-act="image" title="Insert images" aria-label="Insert images">${ICONS.image}</button>
              <button type="button" class="icon-btn" data-act="video" title="Embed YouTube or Vimeo" aria-label="Embed video">${ICONS.video}</button>
              <button type="button" class="icon-btn" data-act="hr" title="Divider" aria-label="Divider">${ICONS.divider}</button>
              <span class="sep"></span>
              <button type="button" class="icon-btn" data-cmd="undo" title="Undo" aria-label="Undo">${ICONS.undo}</button>
              <button type="button" class="icon-btn" data-cmd="redo" title="Redo" aria-label="Redo">${ICONS.redo}</button>
              <span class="mode"></span>
              <button type="button" class="icon-btn" data-act="import" title="Import an HTML file" aria-label="Import HTML file">${ICONS.fileup}</button>
              <button type="button" class="icon-btn" data-act="source" title="Edit HTML" aria-label="Edit HTML">${ICONS.code}</button>
            </div>
            <div class="rte-area" id="area" contenteditable="true" data-placeholder="Write the post, paste formatted text, or drop images here" spellcheck="true"></div>
            <textarea class="rte-src" id="src" hidden spellcheck="false" aria-label="HTML source"></textarea>
            <div class="rte-foot"><span id="wc">0 words</span><span>Drop or paste images anywhere in the text. They are stored in MongoDB.</span></div>
          </div>
        </div>
        <aside class="side-panel">
          <div class="card"><div class="card-head"><h2>Publishing</h2></div><div class="card-body">
            <label class="field"><span>Status</span><select id="status"><option value="draft">Draft, not visible on the site</option><option value="published">Published</option></select></label>
            <label class="field"><span>Publish date</span><input type="date" id="pubdate" value="${dateInput(post.publishedAt)}"></label>
            <label class="switch"><input type="checkbox" id="featured" ${post.featured ? 'checked' : ''}><span class="track"></span><span>Feature on the home page</span></label>
          </div></div>
          <div class="card"><div class="card-head"><h2>Cover image</h2></div><div class="card-body"><div class="drop" id="cover"></div></div></div>
          <div class="card"><div class="card-head"><h2>Details</h2></div><div class="card-body">
            <label class="field"><span>Category</span><input id="category" list="cats" value="${esc(post.category)}" placeholder="Event coverage"><datalist id="cats">${categories.map((c) => `<option value="${esc(c)}">`).join('')}</datalist></label>
            <label class="field"><span>Summary</span><textarea id="excerpt" maxlength="300" placeholder="One or two sentences shown on cards and in search results">${esc(post.excerpt)}</textarea><small><span id="exc-n">0</span>/300. Left empty, the first lines of the post are used.</small></label>
            <label class="field"><span>URL</span><input id="slug" value="${esc(post.slug)}" placeholder="Generated from the title"><small class="slug-preview" id="slug-prev"></small></label>
          </div></div>
          ${!isNew ? `<button class="btn danger block" id="del">${ic('trash')}Delete post</button>` : ''}
        </aside>
      </div>`;
    paintIcons(view);

    const area = $('#area'), src = $('#src'), title = $('#title');
    area.innerHTML = post.content || '';
    $('#status').value = post.status;
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch {}

    let coverId = post.coverId || null;
    imageDrop($('#cover'), { url: post.cover, maxDim: 2000, label: 'Drop a cover image', onChange: (r) => { coverId = r ? r.id : null; markDirty(); } });

    const markDirty = () => { state.dirty = true; $('#save-state').textContent = 'Unsaved changes'; };
    const autosize = () => { title.style.height = 'auto'; title.style.height = title.scrollHeight + 'px'; };
    autosize();
    const counts = () => {
      const txt = (src.hidden ? area.innerText : src.value.replace(/<[^>]+>/g, ' ')).trim();
      const n = txt ? txt.split(/\s+/).length : 0;
      $('#wc').textContent = `${n} ${n === 1 ? 'word' : 'words'}, about ${Math.max(1, Math.round(n / 220))} min read`;
      $('#exc-n').textContent = $('#excerpt').value.length;
    };
    const slugPrev = () => { const s = slugify($('#slug').value || title.value); $('#slug-prev').textContent = '/insights/' + (s || '…'); };
    counts(); slugPrev();

    title.addEventListener('input', () => { autosize(); markDirty(); slugPrev(); $('#crumb-title').textContent = title.value || 'New post'; });
    title.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); area.focus(); } });
    ['#excerpt', '#category', '#slug', '#status', '#pubdate', '#featured'].forEach((s) => $(s).addEventListener('input', () => { markDirty(); counts(); slugPrev(); }));
    area.addEventListener('input', () => { markDirty(); counts(); });
    src.addEventListener('input', () => { markDirty(); counts(); });

    // toolbar state
    const syncBar = () => {
      $$('[data-cmd]', view).forEach((b) => { try { b.classList.toggle('active', ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'].includes(b.dataset.cmd) && document.queryCommandState(b.dataset.cmd)); } catch {} });
      try { const v = (document.queryCommandValue('formatBlock') || 'p').toLowerCase().replace(/[<>]/g, ''); $('#block').value = ['h2', 'h3'].includes(v) ? v : 'p'; } catch {}
    };
    document.addEventListener('selectionchange', () => { if (document.activeElement === area) syncBar(); });

    let savedRange = null;
    const saveRange = () => { const s = getSelection(); if (s.rangeCount && area.contains(s.anchorNode)) savedRange = s.getRangeAt(0).cloneRange(); };
    const restoreRange = () => { area.focus(); if (savedRange) { const s = getSelection(); s.removeAllRanges(); s.addRange(savedRange); } };
    area.addEventListener('keyup', saveRange);
    area.addEventListener('mouseup', saveRange);
    area.addEventListener('blur', saveRange);

    const exec = (cmd, val) => { restoreRange(); document.execCommand(cmd, false, val); markDirty(); syncBar(); counts(); saveRange(); };
    const insertHTML = (html) => exec('insertHTML', html);

    $('#block').addEventListener('change', (e) => exec('formatBlock', '<' + e.target.value + '>'));
    $('.rte-bar', view).addEventListener('mousedown', (e) => { if (e.target.closest('.icon-btn')) e.preventDefault(); });
    $('.rte-bar', view).addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.cmd) return exec(b.dataset.cmd);
      const act = b.dataset.act;
      if (act === 'source') return toggleSource();
      if (!src.hidden && act !== 'import') return toast('Switch back from HTML to use this tool');
      if (act === 'link') return addLink();
      if (act === 'quote') {
        const v = (document.queryCommandValue('formatBlock') || '').toLowerCase();
        return exec('formatBlock', v === 'blockquote' ? '<p>' : '<blockquote>');
      }
      if (act === 'hr') return insertHTML('<hr><p><br></p>');
      if (act === 'image') { saveRange(); const files = await pickFiles('image/*', true); return insertImages(files); }
      if (act === 'video') {
        saveRange();
        const v = await promptBox('Embed a video', [{ name: 'url', label: 'YouTube or Vimeo link', placeholder: 'https://www.youtube.com/watch?v=…' }], 'Embed');
        if (!v) return;
        const emb = embedUrl(v.url);
        if (!emb) return toast('That is not a YouTube or Vimeo link', true);
        return insertHTML(`<figure><iframe src="${emb}" title="Video" allowfullscreen loading="lazy"></iframe></figure><p><br></p>`);
      }
      if (act === 'import') return importHtml();
    });

    area.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); addLink(); }
    });

    async function addLink() {
      saveRange();
      const sel = savedRange ? savedRange.toString() : '';
      const v = await promptBox('Add a link', [{ name: 'url', label: 'Link address', placeholder: 'https://' }, ...(sel ? [] : [{ name: 'text', label: 'Text to show' }])], 'Add link');
      if (!v || !v.url) return;
      let url = v.url.trim();
      if (!/^(https?:|mailto:|tel:|\/|#)/i.test(url)) url = 'https://' + url;
      if (sel) exec('createLink', url);
      else insertHTML(`<a href="${esc(url)}">${esc(v.text || url)}</a>&nbsp;`);
    }

    function toggleSource() {
      if (src.hidden) {
        src.value = prettyHtml(area.innerHTML);
        area.hidden = true; src.hidden = false;
        $('[data-act="source"]').classList.add('active');
        src.focus();
      } else {
        area.innerHTML = src.value;
        src.hidden = true; area.hidden = false;
        $('[data-act="source"]').classList.remove('active');
        area.focus();
      }
      counts();
    }

    async function importHtml() {
      const [f] = await pickFiles('.html,.htm,text/html');
      if (!f) return;
      let html = await f.text();
      const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
      if (body) html = body[1];
      const t = /<title>([^<]*)<\/title>/i.exec(await f.text());
      const replace = !area.textContent.trim() || (await confirmBox('Replace the current text?', 'The imported HTML file will replace what is in the editor now.', 'Replace', false));
      if (!replace) return;
      if (!src.hidden) src.value = html; else area.innerHTML = html;
      if (!title.value && t) { title.value = t[1].trim(); autosize(); slugPrev(); }
      markDirty(); counts();
      toast('HTML imported. Embedded images upload when you save.');
    }

    // drag & drop / paste images straight into the text
    async function insertImages(files, range) {
      files = files.filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;
      if (range) { const s = getSelection(); s.removeAllRanges(); s.addRange(range); savedRange = range; }
      restoreRange();
      const ph = `up-${Date.now()}`;
      document.execCommand('insertHTML', false, `<p id="${ph}" class="uploading" contenteditable="false">Uploading ${files.length} ${files.length === 1 ? 'image' : 'images'}</p>`);
      let html = '';
      for (const f of files) {
        try {
          const r = await uploadImage(f, 1800);
          html += `<figure><img src="${r.url}" alt=""></figure>`;
        } catch (e) { fail(e); }
      }
      const node = document.getElementById(ph);
      if (node) {
        const tpl = document.createElement('template');
        tpl.innerHTML = html + '<p><br></p>';
        node.replaceWith(tpl.content);
      }
      markDirty(); counts();
      if (html) toast(files.length === 1 ? 'Image added' : files.length + ' images added');
    }
    const rte = $('#rte');
    bindDrop(rte, (files, e) => {
      let range = null;
      if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(e.clientX, e.clientY);
      else if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(e.clientX, e.clientY); if (p) { range = document.createRange(); range.setStart(p.offsetNode, p.offset); } }
      if (range && !area.contains(range.startContainer)) range = null;
      if (!src.hidden) toggleSource();
      insertImages(files, range);
    });
    area.addEventListener('paste', (e) => {
      const files = Array.from(e.clipboardData?.files || []).filter((f) => f.type.startsWith('image/'));
      if (files.length) { e.preventDefault(); saveRange(); insertImages(files); return; }
      const html = e.clipboardData?.getData('text/html');
      if (html) {
        e.preventDefault();
        document.execCommand('insertHTML', false, cleanPaste(html));
      }
    });

    // image details on double click
    area.addEventListener('click', (e) => {
      $$('img.picked', area).forEach((i) => i.classList.remove('picked'));
      if (e.target.tagName === 'IMG') e.target.classList.add('picked');
    });
    area.addEventListener('dblclick', async (e) => {
      const img = e.target.closest('img');
      if (!img) return;
      const fig = img.closest('figure');
      const cap = fig?.querySelector('figcaption');
      const v = await promptBox('Image details', [
        { name: 'alt', label: 'Description for screen readers', value: img.alt },
        { name: 'caption', label: 'Caption', value: cap ? cap.textContent : '', hint: 'Shown under the image. Leave empty for none.' },
      ]);
      if (!v) return;
      img.alt = v.alt;
      let f = fig;
      if (!f) { f = document.createElement('figure'); img.replaceWith(f); f.appendChild(img); }
      let c = f.querySelector('figcaption');
      if (v.caption) { if (!c) { c = document.createElement('figcaption'); f.appendChild(c); } c.textContent = v.caption; }
      else if (c) c.remove();
      markDirty();
    });

    // save
    async function save() {
      const btn = $('#save');
      if (!title.value.trim()) { toast('Add a title first', true); title.focus(); return; }
      btn.disabled = true;
      $('#save-state').textContent = 'Saving';
      try {
        if (!src.hidden) area.innerHTML = src.value;
        await uploadInlineDataImages(area);
        $$('img.picked', area).forEach((i) => i.classList.remove('picked'));
        $$('.uploading', area).forEach((n) => n.remove());
        const body = {
          title: title.value.trim(),
          content: area.innerHTML,
          excerpt: $('#excerpt').value.trim(),
          category: $('#category').value.trim(),
          slug: $('#slug').value.trim(),
          status: $('#status').value,
          featured: $('#featured').checked,
          publishedAt: $('#pubdate').value ? new Date($('#pubdate').value + 'T09:00:00').toISOString() : undefined,
          coverId,
        };
        if (isNew) {
          const r = await api('POST', '/blogs', body);
          state.dirty = false;
          toast(body.status === 'published' ? 'Post published' : 'Draft saved');
          history.replaceState(null, '', '#/posts/' + r.id);
          route();
          return;
        }
        const r = await api('PUT', '/blogs/' + id, body);
        state.dirty = false;
        $('#slug').value = r.slug; slugPrev();
        $('#save-state').textContent = 'Saved ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        toast(body.status === 'published' ? 'Post updated' : 'Draft saved');
        if (body.status !== post.status) { post.status = body.status; route(); }
      } catch (e) { fail(e); $('#save-state').textContent = 'Not saved'; }
      btn.disabled = false;
    }
    $('#save').addEventListener('click', save);
    view.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } });
    $('#del')?.addEventListener('click', async () => {
      if (!(await confirmBox('Delete this post?', `“${post.title}” and its images will be removed permanently. This cannot be undone.`))) return;
      try { await api('DELETE', '/blogs/' + id); state.dirty = false; toast('Post deleted'); location.hash = '#/posts'; } catch (e) { fail(e); }
    });
    state.dirty = false;
    if (isNew) title.focus();
  }

  // Images pasted or imported as data: URLs get stored in the media collection and replaced by /media/:id
  async function uploadInlineDataImages(root) {
    const imgs = $$('img[src^="data:image/"]', root);
    for (const img of imgs) {
      try {
        const blob = await (await fetch(img.src)).blob();
        const r = await uploadImage(new File([blob], 'inline', { type: blob.type }), 1800);
        img.src = r.url;
      } catch (e) { throw new Error('An embedded image could not be uploaded: ' + e.message); }
    }
  }

  function cleanPaste(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script,style,meta,link,title,o\\:p').forEach((n) => n.remove());
    doc.querySelectorAll('*').forEach((n) => {
      [...n.attributes].forEach((a) => { if (!['href', 'src', 'alt', 'title', 'colspan', 'rowspan'].includes(a.name)) n.removeAttribute(a.name); });
      if (['SPAN', 'FONT'].includes(n.tagName)) n.replaceWith(...n.childNodes);
    });
    doc.querySelectorAll('h1').forEach((h) => { const n = doc.createElement('h2'); n.innerHTML = h.innerHTML; h.replaceWith(n); });
    doc.querySelectorAll('h4,h5,h6').forEach((h) => { const n = doc.createElement('h3'); n.innerHTML = h.innerHTML; h.replaceWith(n); });
    return doc.body.innerHTML;
  }

  function prettyHtml(html) {
    return html.replace(/></g, '>\n<').replace(/\n<\/(strong|em|b|i|u|a|span)>/g, '</$1>').replace(/<(strong|em|b|i|u|a|span)([^>]*)>\n/g, '<$1$2>');
  }

  function embedUrl(u) {
    try {
      const url = new URL(u.trim());
      let m;
      if (/youtu\.be$/.test(url.hostname)) return 'https://www.youtube-nocookie.com/embed/' + url.pathname.slice(1);
      if (/youtube\.com$/.test(url.hostname)) {
        if (url.searchParams.get('v')) return 'https://www.youtube-nocookie.com/embed/' + url.searchParams.get('v');
        if ((m = url.pathname.match(/\/(embed|shorts)\/([\w-]+)/))) return 'https://www.youtube-nocookie.com/embed/' + m[2];
      }
      if (/vimeo\.com$/.test(url.hostname) && (m = url.pathname.match(/(\d+)/))) return 'https://player.vimeo.com/video/' + m[1];
    } catch {}
    return null;
  }
  function slugify(s) {
    return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  }

  // ---------- Team ----------
  async function viewTeam(view) {
    setChrome('<b>Team</b>', `<button class="btn primary" id="add-member">${ic('plus')}Add member</button>`);
    let list = [];
    view.innerHTML = `<div class="page-title"><div><h1>Team</h1><p>Shown on the About page in this order. Drag cards by the handle to reorder.</p></div></div><div class="team-grid" id="tgrid"></div>`;
    const render = () => {
      $('#tgrid').innerHTML = list.length ? list.map((m) => `
        <div class="card tm ${m.visible ? '' : 'hidden-member'}" data-id="${m.id}" draggable="false">
          ${m.visible ? '' : '<span class="pill hidden-tag">Hidden</span>'}
          <div class="ph">${m.photo ? `<img src="${esc(m.photo)}" alt="">` : ''}</div>
          <div class="info"><div class="t">${esc(m.name)}</div><div class="s">${esc(m.role)}</div></div>
          <div class="bar">
            <span class="icon-btn handle" title="Drag to reorder" aria-label="Drag to reorder">${ICONS.grip}</span>
            <span class="spacer" style="flex:1"></span>
            <button class="icon-btn" data-vis title="${m.visible ? 'Hide from the website' : 'Show on the website'}" aria-label="Toggle visibility">${m.visible ? ICONS.eye : ICONS.eyeoff}</button>
            <button class="icon-btn" data-edit title="Edit" aria-label="Edit">${ICONS.edit}</button>
            <button class="icon-btn" data-del title="Delete" aria-label="Delete">${ICONS.trash}</button>
          </div>
        </div>`).join('') : `<div class="card empty" style="grid-column:1/-1"><strong>No team members yet</strong>Add the first person<br><button class="btn primary" data-add>${ICONS.plus}Add member</button></div>`;
    };
    const load = async () => { list = await api('GET', '/team'); render(); };
    try { await load(); } catch (e) { return fail(e); }

    $('#add-member').addEventListener('click', () => editMember());
    const grid = $('#tgrid');
    grid.addEventListener('click', async (e) => {
      if (e.target.closest('[data-add]')) return editMember();
      const card = e.target.closest('[data-id]');
      if (!card) return;
      const m = list.find((x) => x.id === card.dataset.id);
      try {
        if (e.target.closest('[data-edit]')) return editMember(m);
        if (e.target.closest('[data-vis]')) { await api('PUT', '/team/' + m.id, { visible: !m.visible }); m.visible = !m.visible; render(); toast(m.visible ? 'Shown on the website' : 'Hidden from the website'); }
        if (e.target.closest('[data-del]')) {
          if (!(await confirmBox('Remove ' + m.name + '?', 'This removes them and their photo from the website. This cannot be undone.', 'Remove'))) return;
          await api('DELETE', '/team/' + m.id); list = list.filter((x) => x.id !== m.id); render(); toast('Removed');
        }
      } catch (er) { fail(er); }
    });

    // drag to reorder (by handle)
    let dragId = null;
    grid.addEventListener('pointerdown', (e) => { const h = e.target.closest('.handle'); if (h) h.closest('.tm').draggable = true; });
    grid.addEventListener('dragstart', (e) => {
      const c = e.target.closest('.tm');
      if (!c || !c.draggable) return e.preventDefault();
      dragId = c.dataset.id; c.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragId);
    });
    grid.addEventListener('dragover', (e) => {
      if (!dragId) return;
      e.preventDefault();
      const c = e.target.closest('.tm');
      $$('.tm.drop-target', grid).forEach((x) => x !== c && x.classList.remove('drop-target'));
      if (c && c.dataset.id !== dragId) c.classList.add('drop-target');
    });
    grid.addEventListener('drop', async (e) => {
      if (!dragId) return;
      e.preventDefault();
      const c = e.target.closest('.tm');
      if (c && c.dataset.id !== dragId) {
        const from = list.findIndex((x) => x.id === dragId), to = list.findIndex((x) => x.id === c.dataset.id);
        const [m] = list.splice(from, 1);
        list.splice(to, 0, m);
        render();
        try { await api('POST', '/team/reorder', { ids: list.map((x) => x.id) }); toast('Order saved'); } catch (er) { fail(er); }
      }
    });
    grid.addEventListener('dragend', () => { dragId = null; $$('.tm', grid).forEach((x) => { x.classList.remove('dragging', 'drop-target'); x.draggable = false; }); });

    async function editMember(m) {
      const isNew = !m;
      m = m || { name: '', role: '', bio: '', visible: true, photo: null, photoId: null };
      let photoId = m.photoId;
      const res = await openModal(`<form><div class="modal-head"><h2>${isNew ? 'Add team member' : 'Edit ' + esc(m.name)}</h2></div>
        <div class="modal-body"><div class="member-form">
          <div><div class="drop round" id="mphoto"></div></div>
          <div class="fields">
            <label class="field"><span>Name</span><input name="name" value="${esc(m.name)}" required></label>
            <label class="field"><span>Role</span><input name="role" value="${esc(m.role)}" placeholder="Director of Photography"></label>
            <label class="field"><span>Short bio <span class="muted">(optional)</span></span><textarea name="bio" maxlength="600">${esc(m.bio)}</textarea></label>
            <label class="switch"><input type="checkbox" name="visible" ${m.visible ? 'checked' : ''}><span class="track"></span><span>Show on the website</span></label>
          </div>
        </div></div>
        <div class="modal-foot"><button type="button" class="btn" data-x>Cancel</button><button class="btn primary">${isNew ? 'Add member' : 'Save'}</button></div></form>`,
        (md, done) => {
          imageDrop($('#mphoto', md), { url: m.photo, maxDim: 1000, label: 'Photo', hint: 'Drop or click', onChange: (r) => { photoId = r ? r.id : null; } });
          $('[data-x]', md).onclick = () => done(null);
          $('form', md).onsubmit = (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            done({ name: fd.get('name'), role: fd.get('role'), bio: fd.get('bio'), visible: fd.get('visible') === 'on' });
          };
        });
      if (!res) return;
      try {
        const body = { ...res, photoId };
        if (isNew) await api('POST', '/team', body); else await api('PUT', '/team/' + m.id, body);
        toast(isNew ? 'Team member added' : 'Saved');
        load();
      } catch (e) { fail(e); }
    }
  }

  boot();
})();
