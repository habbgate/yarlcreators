// Yarl Creators — Express + MongoDB server
// Serves the public site from /public, a JSON API for the site and the admin dashboard,
// and images stored as base64 in MongoDB at /media/:id.
require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'yarlcreators_cms';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@yarlcreators.lk').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_HOURS = 12;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // decoded size limit per image

if (!ADMIN_PASSWORD) {
  console.warn('[warn] ADMIN_PASSWORD is not set in .env — admin login is disabled until you set it.');
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));

let db;
const col = (name) => db.collection(name);

// ---------- helpers ----------
const isId = (v) => typeof v === 'string' && ObjectId.isValid(v) && String(new ObjectId(v)) === v;
const oid = (v) => new ObjectId(v);
const str = (v, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const bool = (v) => v === true || v === 'true' || v === 1 || v === '1';

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post';
}

async function uniqueSlug(base, excludeId) {
  let slug = base;
  for (let i = 2; ; i++) {
    const q = { slug };
    if (excludeId) q._id = { $ne: excludeId };
    if (!(await col('blogs').findOne(q, { projection: { _id: 1 } }))) return slug;
    slug = `${base}-${i}`;
  }
}

// Defence in depth for admin-authored HTML: drop scripts, event handlers,
// javascript: URLs and iframes that are not YouTube/Vimeo embeds.
function sanitizeHtml(html) {
  let out = String(html || '');
  out = out.replace(/<\s*(script|style|object|embed|link|meta|base|form)[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  out = out.replace(/<\s*\/?\s*(script|style|object|embed|link|meta|base|form)\b[^>]*>/gi, '');
  out = out.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  out = out.replace(/(href|src|xlink:href|action)\s*=\s*("|')\s*(javascript|vbscript|data:text\/html)[^"']*\2/gi, '$1="#"');
  out = out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (m) => {
    const src = (m.match(/src\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    return /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//i.test(src) ? m : '';
  });
  return out;
}

function stripTags(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function readingMinutes(html) {
  return Math.max(1, Math.round(stripTags(html).split(' ').filter(Boolean).length / 220));
}

const mediaUrl = (id) => (id ? `/media/${id}` : null);

// Accepts "data:image/png;base64,...." and stores it in the media collection.
async function storeDataUrl(dataUrl, name) {
  const m = /^data:(image\/(png|jpe?g|webp|gif|avif|svg\+xml));base64,([A-Za-z0-9+/=\s]+)$/i.exec(String(dataUrl || ''));
  if (!m) throw httpError(400, 'Only PNG, JPEG, WebP, GIF, AVIF or SVG images are accepted');
  const mime = m[1].toLowerCase();
  const data = m[3].replace(/\s/g, '');
  const size = Math.floor((data.length * 3) / 4);
  if (size > MAX_IMAGE_BYTES) throw httpError(413, 'Image is larger than 6 MB');
  if (mime === 'image/svg+xml') {
    const svg = Buffer.from(data, 'base64').toString('utf8');
    if (/<script|on[a-z]+\s*=|javascript:/i.test(svg)) throw httpError(400, 'SVG contains scripts');
  }
  const doc = { mime, data, size, name: str(name, 200), createdAt: new Date() };
  const r = await col('media').insertOne(doc);
  return { id: String(r.insertedId), url: mediaUrl(r.insertedId) };
}

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- sessions (HMAC-signed cookie) ----------
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}
function getCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}
function setSession(res, email) {
  const token = sign({ email, exp: Date.now() + SESSION_HOURS * 3600e3 });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `yc_admin=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secure}`);
}
function requireAdmin(req, res, next) {
  const s = verify(getCookie(req, 'yc_admin'));
  if (!s) return res.status(401).json({ error: 'Sign in required' });
  req.admin = s;
  next();
}

// Tiny in-memory rate limiter
function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (list.length >= max) return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    list.push(now);
    hits.set(key, list);
    next();
  };
}

// ---------- serializers ----------
function blogSummary(b) {
  return {
    id: String(b._id),
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    category: b.category,
    cover: mediaUrl(b.coverId),
    featured: !!b.featured,
    status: b.status,
    publishedAt: b.publishedAt,
    updatedAt: b.updatedAt,
    readingMinutes: b.readingMinutes || 1,
  };
}
function teamOut(t) {
  return { id: String(t._id), name: t.name, role: t.role, bio: t.bio || '', photo: mediaUrl(t.photoId), photoId: t.photoId ? String(t.photoId) : null, order: t.order, visible: t.visible !== false };
}

// ---------- public API ----------
const api = express.Router();

api.post('/contact', rateLimit({ windowMs: 10 * 60e3, max: 5 }), wrap(async (req, res) => {
  const b = req.body || {};
  if (str(b.company_site)) return res.json({ ok: true }); // honeypot
  const doc = {
    name: str(b.name, 120),
    email: str(b.email, 160).toLowerCase(),
    phone: str(b.phone, 40),
    service: str(b.service, 80),
    message: str(b.message, 5000),
    status: 'new',
    createdAt: new Date(),
  };
  const errors = {};
  if (!doc.name) errors.name = 'Enter your name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doc.email)) errors.email = 'Enter a valid email';
  if (!/^[+\d][\d\s()-]{6,}$/.test(doc.phone)) errors.phone = 'Enter a valid phone number';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check the highlighted fields', errors });
  await col('contacts').insertOne(doc);
  res.status(201).json({ ok: true });
}));

api.get('/blogs', wrap(async (req, res) => {
  const q = { status: 'published' };
  if (bool(req.query.featured)) q.featured = true;
  if (req.query.category) q.category = str(req.query.category, 80);
  const limit = Math.min(Number(req.query.limit) || 24, 60);
  const list = await col('blogs').find(q, { projection: { content: 0 } }).sort({ publishedAt: -1 }).limit(limit).toArray();
  res.json(list.map(blogSummary));
}));

api.get('/blogs/:slug', wrap(async (req, res) => {
  const b = await col('blogs').findOne({ slug: str(req.params.slug, 120), status: 'published' });
  if (!b) return res.status(404).json({ error: 'Not found' });
  const more = await col('blogs').find({ status: 'published', _id: { $ne: b._id } }, { projection: { content: 0 } }).sort({ publishedAt: -1 }).limit(3).toArray();
  res.json({ ...blogSummary(b), content: b.content, more: more.map(blogSummary) });
}));

api.get('/team', wrap(async (req, res) => {
  const list = await col('team').find({ visible: { $ne: false } }).sort({ order: 1, createdAt: 1 }).toArray();
  res.json(list.map(teamOut));
}));

// ---------- admin API ----------
const admin = express.Router();

admin.post('/login', rateLimit({ windowMs: 15 * 60e3, max: 10 }), (req, res) => {
  const email = str(req.body?.email, 160).toLowerCase();
  const password = String(req.body?.password || '');
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'Set ADMIN_PASSWORD in .env and restart the server' });
  const ok = email === ADMIN_EMAIL &&
    crypto.timingSafeEqual(crypto.createHash('sha256').update(password).digest(), crypto.createHash('sha256').update(ADMIN_PASSWORD).digest());
  if (!ok) return res.status(401).json({ error: 'Email or password is incorrect' });
  setSession(res, email);
  res.json({ ok: true, email });
});

admin.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'yc_admin=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0');
  res.json({ ok: true });
});

admin.use(requireAdmin);

admin.get('/me', (req, res) => res.json({ email: req.admin.email }));

admin.get('/stats', wrap(async (req, res) => {
  const since = new Date(Date.now() - 30 * 86400e3);
  const [contactsTotal, contactsNew, contacts30, blogsPublished, blogsDraft, blogsFeatured, team, recent, daily] = await Promise.all([
    col('contacts').countDocuments({ status: { $ne: 'archived' } }),
    col('contacts').countDocuments({ status: 'new' }),
    col('contacts').countDocuments({ createdAt: { $gte: since } }),
    col('blogs').countDocuments({ status: 'published' }),
    col('blogs').countDocuments({ status: 'draft' }),
    col('blogs').countDocuments({ status: 'published', featured: true }),
    col('team').countDocuments({}),
    col('contacts').find({}).sort({ createdAt: -1 }).limit(6).toArray(),
    col('contacts').aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } },
    ]).toArray(),
  ]);
  res.json({ contactsTotal, contactsNew, contacts30, blogsPublished, blogsDraft, blogsFeatured, team, recent, daily });
}));

// Contacts
admin.get('/contacts', wrap(async (req, res) => {
  const q = {};
  const status = str(req.query.status, 20);
  if (status && status !== 'all') q.status = status;
  else q.status = { $ne: 'archived' };
  if (status === 'all') delete q.status;
  const term = str(req.query.q, 100);
  if (term) {
    const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    q.$or = [{ name: rx }, { email: rx }, { phone: rx }, { message: rx }, { service: rx }];
  }
  const list = await col('contacts').find(q).sort({ createdAt: -1 }).limit(500).toArray();
  res.json(list.map((c) => ({ ...c, id: String(c._id) })));
}));

admin.get('/contacts.csv', wrap(async (req, res) => {
  const list = await col('contacts').find({}).sort({ createdAt: -1 }).toArray();
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['Date', 'Name', 'Email', 'Phone', 'Service', 'Message', 'Status'].join(',')]
    .concat(list.map((c) => [c.createdAt?.toISOString(), c.name, c.email, c.phone, c.service, c.message, c.status].map(esc).join(',')));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="yarl-creators-enquiries.csv"');
  res.send(rows.join('\n'));
}));

admin.patch('/contacts/:id', wrap(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(400, 'Bad id');
  const status = str(req.body?.status, 20);
  if (!['new', 'read', 'replied', 'archived'].includes(status)) throw httpError(400, 'Unknown status');
  await col('contacts').updateOne({ _id: oid(req.params.id) }, { $set: { status, updatedAt: new Date() } });
  res.json({ ok: true });
}));

admin.delete('/contacts/:id', wrap(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(400, 'Bad id');
  await col('contacts').deleteOne({ _id: oid(req.params.id) });
  res.json({ ok: true });
}));

// Media (base64 upload)
admin.post('/media', wrap(async (req, res) => {
  const r = await storeDataUrl(req.body?.dataUrl, req.body?.name);
  res.status(201).json(r);
}));

// Blogs
function blogInput(b, existing = {}) {
  const content = sanitizeHtml(b.content ?? existing.content ?? '');
  const status = ['draft', 'published'].includes(b.status) ? b.status : existing.status || 'draft';
  const title = str(b.title ?? existing.title, 200);
  if (!title) throw httpError(400, 'Add a title');
  const excerpt = str(b.excerpt, 400) || stripTags(content).slice(0, 180);
  let coverId = existing.coverId || null;
  if (b.coverId === null) coverId = null;
  else if (isId(b.coverId)) coverId = oid(b.coverId);
  const out = {
    title,
    excerpt,
    category: str(b.category ?? existing.category, 80),
    content,
    coverId,
    featured: b.featured === undefined ? !!existing.featured : bool(b.featured),
    status,
    readingMinutes: readingMinutes(content),
    updatedAt: new Date(),
  };
  const pub = b.publishedAt ? new Date(b.publishedAt) : null;
  if (pub && !isNaN(pub)) out.publishedAt = pub;
  else if (status === 'published' && !existing.publishedAt) out.publishedAt = new Date();
  return out;
}

admin.get('/blogs', wrap(async (req, res) => {
  const list = await col('blogs').find({}, { projection: { content: 0 } }).sort({ updatedAt: -1 }).toArray();
  res.json(list.map(blogSummary));
}));

admin.get('/blogs/:id', wrap(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(400, 'Bad id');
  const b = await col('blogs').findOne({ _id: oid(req.params.id) });
  if (!b) throw httpError(404, 'Not found');
  res.json({ ...blogSummary(b), coverId: b.coverId ? String(b.coverId) : null, content: b.content });
}));

admin.post('/blogs', wrap(async (req, res) => {
  const doc = blogInput(req.body || {});
  doc.slug = await uniqueSlug(slugify(req.body?.slug || doc.title));
  doc.createdAt = new Date();
  const r = await col('blogs').insertOne(doc);
  res.status(201).json({ id: String(r.insertedId), slug: doc.slug });
}));

admin.put('/blogs/:id', wrap(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(400, 'Bad id');
  const _id = oid(req.params.id);
  const existing = await col('blogs').findOne({ _id });
  if (!existing) throw httpError(404, 'Not found');
  const doc = blogInput(req.body || {}, existing);
  if (req.body?.slug && slugify(req.body.slug) !== existing.slug) doc.slug = await uniqueSlug(slugify(req.body.slug), _id);
  await col('blogs').updateOne({ _id }, { $set: doc });
  if (existing.coverId && String(existing.coverId) !== String(doc.coverId)) await col('media').deleteOne({ _id: existing.coverId });
  res.json({ ok: true, slug: doc.slug || existing.slug });
}));

admin.patch('/blogs/:id', wrap(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(400, 'Bad id');
  const set = { updatedAt: new Date() };
  if (req.body?.featured !== undefined) set.featured = bool(req.body.featured);
  if (['draft', 'published'].includes(req.body?.status)) {
    set.status = req.body.status;
    if (set.status === 'published') {
      const b = await col('blogs').findOne({ _id: oid(req.params.id) }, { projection: { publishedAt: 1 } });
      if (!b?.publishedAt) set.publishedAt = new Date();
    }
  }
  await col('blogs').updateOne({ _id: oid(req.params.id) }, { $set: set });
  res.json({ ok: true });
}));

admin.delete('/blogs/:id', wrap(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(400, 'Bad id');
  const b = await col('blogs').findOneAndDelete({ _id: oid(req.params.id) });
  if (b?.coverId) await col('media').deleteOne({ _id: b.coverId });
  const inline = [...String(b?.content || '').matchAll(/\/media\/([a-f0-9]{24})/g)].map((m) => oid(m[1]));
  if (inline.length) await col('media').deleteMany({ _id: { $in: inline } });
  res.json({ ok: true });
}));

// Team
function teamInput(b, existing = {}) {
  const name = str(b.name ?? existing.name, 120);
  if (!name) throw httpError(400, 'Add a name');
  let photoId = existing.photoId || null;
  if (b.photoId === null) photoId = null;
  else if (isId(b.photoId)) photoId = oid(b.photoId);
  return {
    name,
    role: str(b.role ?? existing.role, 120),
    bio: str(b.bio ?? existing.bio, 600),
    photoId,
    visible: b.visible === undefined ? existing.visible !== false : bool(b.visible),
    updatedAt: new Date(),
  };
}

admin.get('/team', wrap(async (req, res) => {
  const list = await col('team').find({}).sort({ order: 1, createdAt: 1 }).toArray();
  res.json(list.map(teamOut));
}));

admin.post('/team', wrap(async (req, res) => {
  const doc = teamInput(req.body || {});
  const last = await col('team').find({}).sort({ order: -1 }).limit(1).toArray();
  doc.order = (last[0]?.order ?? -1) + 1;
  doc.createdAt = new Date();
  const r = await col('team').insertOne(doc);
  res.status(201).json({ id: String(r.insertedId) });
}));

admin.put('/team/:id', wrap(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(400, 'Bad id');
  const _id = oid(req.params.id);
  const existing = await col('team').findOne({ _id });
  if (!existing) throw httpError(404, 'Not found');
  const doc = teamInput(req.body || {}, existing);
  await col('team').updateOne({ _id }, { $set: doc });
  if (existing.photoId && String(existing.photoId) !== String(doc.photoId)) await col('media').deleteOne({ _id: existing.photoId });
  res.json({ ok: true });
}));

admin.post('/team/reorder', wrap(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(isId) : [];
  await Promise.all(ids.map((id, i) => col('team').updateOne({ _id: oid(id) }, { $set: { order: i } })));
  res.json({ ok: true });
}));

admin.delete('/team/:id', wrap(async (req, res) => {
  if (!isId(req.params.id)) throw httpError(400, 'Bad id');
  const t = await col('team').findOneAndDelete({ _id: oid(req.params.id) });
  if (t?.photoId) await col('media').deleteOne({ _id: t.photoId });
  res.json({ ok: true });
}));

api.use('/admin', admin);
app.use('/api', api);

// ---------- media ----------
app.get('/media/:id', wrap(async (req, res) => {
  if (!isId(req.params.id)) return res.sendStatus(404);
  const m = await col('media').findOne({ _id: oid(req.params.id) });
  if (!m) return res.sendStatus(404);
  res.setHeader('Content-Type', m.mime);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (m.mime === 'image/svg+xml') res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
  res.send(Buffer.from(m.data, 'base64'));
}));

// ---------- static site ----------
app.get(['/insights/:slug', '/insights/:slug/'], (req, res) => res.sendFile(path.join(__dirname, 'public', 'post.html')));
app.get(['/index', '/index.html'], (req, res) => res.redirect(301, '/'));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

// ---------- errors ----------
app.use((err, req, res, next) => {
  const status = err.status || (err.type === 'entity.too.large' ? 413 : 500);
  if (status >= 500) console.error(err);
  if (req.path.startsWith('/api')) return res.status(status).json({ error: status >= 500 ? 'Server error' : err.message });
  res.status(status).send(status >= 500 ? 'Server error' : err.message);
});

async function start() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  await Promise.all([
    col('blogs').createIndex({ slug: 1 }, { unique: true }),
    col('blogs').createIndex({ status: 1, featured: 1, publishedAt: -1 }),
    col('contacts').createIndex({ createdAt: -1 }),
    col('team').createIndex({ order: 1 }),
  ]);
  app.listen(PORT, () => console.log(`Yarl Creators running at http://localhost:${PORT}  (admin: /admin)`));
}

start().catch((e) => {
  console.error('Could not start:', e.message);
  process.exit(1);
});
