// Seeds MongoDB with the team and blog posts that were on the original static site.
// Images are read from public/images and stored as base64 in the `media` collection.
// Usage:  npm run seed            (only fills empty collections)
//         npm run seed -- --force (wipes blogs, team and their media first)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'yarlcreators_cms';
const IMG = path.join(__dirname, '..', 'public', 'images');
const force = process.argv.includes('--force');

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

const team = [
  { name: 'S Kobikan', role: 'Founder & Production Manager', img: '2025/08/t1.jpg' },
  { name: 'A Praveen', role: 'Founder & Creative Director', img: '2025/08/wevfwefwef.jpg' },
  { name: 'S Janarthan', role: 'Director of Photography', img: '2025/08/ascvasdvsadvsdv.jpg' },
  { name: 'V Sharukeshan', role: 'Visual Editor', img: '2025/08/rgtjgdg.jpg' },
  { name: 'B Baskaran', role: 'Art Director', img: '2025/08/regergerg.jpg' },
  { name: 'S Danushan', role: 'Broadcast Announcer', img: '2025/08/ascascasccvasva.jpg' },
];

const blogs = [
  {
    title: 'Opening Ceremony of the DP Logistics Multi-User 3PL Warehouse',
    category: 'Event coverage',
    date: '2026-01-28',
    img: '2025/08/vwevwewew.jpg',
    featured: true,
    excerpt: 'Behind the scenes: commercial photography and videography.',
    body: '<p>Our crew covered the opening ceremony of the DP Logistics multi-user 3PL warehouse with commercial photography and videography.</p><p>The brief was a complete record of the day: arrivals, the formal opening and the facility itself, delivered as an edited film and a photo set the client could use across its own channels.</p>',
  },
  {
    title: "India's 77th Republic Day Celebrations",
    category: 'Event coverage',
    date: '2026-01-26',
    img: '2026/02/ycgp-1-scaled.jpg',
    featured: true,
    excerpt: 'Event coverage for the Consulate General of India in Jaffna.',
    body: '<p>Yarl Creators provided event coverage for the Consulate General of India in Jaffna during the 77th Republic Day celebrations.</p><p>The team handled photography and video across the ceremony and the cultural programme that followed.</p>',
    gallery: ['2026/02/DSC3635-scaled.jpg'],
  },
  {
    title: 'Mahaposa Commercial Advertisement',
    category: 'Commercial',
    date: '2025-12-25',
    img: '2025/08/102.jpg',
    featured: true,
    excerpt: 'Behind the scenes of a commercial advertisement shoot.',
    body: '<p>Behind the scenes of the Mahaposa commercial advertisement, from setup on location to the final takes.</p><p>Commercial work like this runs through our full production pipeline: concept, shoot, edit and delivery in the formats each platform needs.</p>',
  },
  {
    title: 'Nadiyas textile brand introduction video',
    category: 'Brand film',
    date: '2025-12-21',
    img: '2025/08/12111.jpg',
    featured: false,
    excerpt: 'Behind the scenes of a brand story film.',
    body: '<p>Behind the scenes of the brand introduction film for Nadiyas textiles.</p><p>A brand story film gives a business a single piece of video that explains who they are, and can be cut down into short-form clips for social media.</p>',
  },
  {
    title: '55th Anniversary of Asia Asset Finance PLC',
    category: 'Event coverage',
    date: '2025-01-01',
    img: '2024/01/01111.jpg',
    featured: false,
    excerpt: 'Event coverage in Jaffna and Kilinochchi.',
    body: '<p>Event coverage of the 55th anniversary of Asia Asset Finance PLC, across events in Jaffna and Kilinochchi.</p>',
  },
];

// Articles from the earlier `yarlcreators` database (if it exists locally) get real photos as covers.
const LEGACY_DB = process.env.LEGACY_DB_NAME || 'yarlcreators';
const legacyCovers = { blog_1: '2025/09/WhatsApp-Image-2025-08-25-at-19.28.48_21117187-copy.jpg', blog_2: '2025/08/1245.jpg', blog_3: '2025/08/1425.jpg' };

function textToHtml(text) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return String(text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => {
      const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1 && lines.slice(1).every((l) => /^\d+[.)]\s/.test(l))) {
        return `<p>${esc(lines[0])}</p><ol>${lines.slice(1).map((l) => `<li>${esc(l.replace(/^\d+[.)]\s*/, ''))}</li>`).join('')}</ol>`;
      }
      if (lines.every((l) => /^\d+[.)]\s/.test(l))) return `<ol>${lines.map((l) => `<li>${esc(l.replace(/^\d+[.)]\s*/, ''))}</li>`).join('')}</ol>`;
      return `<p>${lines.map(esc).join('<br>')}</p>`;
    }).join('\n');
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const media = db.collection('media');

  async function storeFile(rel) {
    const file = path.join(IMG, rel);
    const buf = fs.readFileSync(file);
    const mime = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const r = await media.insertOne({ mime, data: buf.toString('base64'), size: buf.length, name: path.basename(file), createdAt: new Date() });
    return r.insertedId;
  }

  if (force) {
    const oldIds = [
      ...(await db.collection('blogs').find({}).toArray()).flatMap((b) => [b.coverId, ...[...String(b.content || '').matchAll(/\/media\/([a-f0-9]{24})/g)].map((m) => m[1])]),
      ...(await db.collection('team').find({}).toArray()).map((t) => t.photoId),
    ].filter(Boolean).map(String);
    await media.deleteMany({ _id: { $in: oldIds.map((id) => new (require('mongodb').ObjectId)(id)) } });
    await db.collection('blogs').deleteMany({});
    await db.collection('team').deleteMany({});
    console.log('Cleared blogs, team and their images');
  }

  const legacy = DB_NAME === LEGACY_DB ? null : client.db(LEGACY_DB);
  const legacyTeam = legacy ? await legacy.collection('team').find({}).toArray().catch(() => []) : [];
  const legacyBlogs = legacy ? await legacy.collection('blogs').find({}).toArray().catch(() => []) : [];

  if ((await db.collection('team').countDocuments()) === 0) {
    for (const [i, t] of team.entries()) {
      const photoId = await storeFile(t.img);
      const bio = (legacyTeam.find((l) => l.name === t.name) || {}).bio || '';
      await db.collection('team').insertOne({ name: t.name, role: t.role, bio, photoId, visible: true, order: i, createdAt: new Date(), updatedAt: new Date() });
    }
    console.log(`Team: inserted ${team.length} members`);
  } else console.log('Team: already has data, skipped');

  if ((await db.collection('blogs').countDocuments()) === 0) {
    for (const b of blogs) {
      const coverId = await storeFile(b.img);
      let content = b.body;
      for (const g of b.gallery || []) {
        const id = await storeFile(g);
        content += `<figure><img src="/media/${id}" alt=""></figure>`;
      }
      const date = new Date(b.date + 'T09:00:00Z');
      await db.collection('blogs').insertOne({
        title: b.title, slug: slugify(b.title), excerpt: b.excerpt, category: b.category, content, coverId,
        featured: b.featured, status: 'published', publishedAt: date, createdAt: date, updatedAt: date,
        readingMinutes: 1,
      });
    }
    let n = 0;
    for (const l of legacyBlogs) {
      if (!l.title || !l.content) continue;
      const coverId = await storeFile(legacyCovers[l._id] || '2025/08/0102.jpg');
      const content = textToHtml(l.content);
      const date = new Date(l.publishedAt || Date.now());
      await db.collection('blogs').insertOne({
        title: l.title, slug: l.slug || slugify(l.title), excerpt: l.excerpt || '', category: l.category || '', content, coverId,
        featured: !!l.featured, status: 'published', publishedAt: date, createdAt: date, updatedAt: date,
        readingMinutes: Math.max(1, Math.round(content.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 220)),
      });
      n++;
    }
    // Keep the home page to three featured posts: the newest three marked featured
    const feat = await db.collection('blogs').find({ featured: true }).sort({ publishedAt: -1 }).toArray();
    const drop = feat.slice(3).map((b) => b._id);
    if (drop.length) await db.collection('blogs').updateMany({ _id: { $in: drop } }, { $set: { featured: false } });
    console.log(`Blogs: inserted ${blogs.length} posts from the site and ${n} from the ${LEGACY_DB} database`);
  } else console.log('Blogs: already has data, skipped');

  await client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
