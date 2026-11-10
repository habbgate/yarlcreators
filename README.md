# Yarl Creators website

Public website and admin dashboard for Yarl Creators, a media production studio in Jaffna.
Node.js + Express serve the site, and MongoDB stores enquiries, blog posts, the team and every uploaded image (as base64).

## Run it locally

Requirements: Node.js 18+ and MongoDB running on `mongodb://127.0.0.1:27017`.

```bash
npm install
cp .env.example .env      # then set ADMIN_PASSWORD and SESSION_SECRET
npm run seed              # loads the team and posts into MongoDB (only fills empty collections)
npm run dev               # http://localhost:3000, admin at http://localhost:3000/admin
```

`npm run seed -- --force` wipes posts, team and their images and seeds them again.

## What is where

| Path | What it is |
| --- | --- |
| `server.js` | Express server: public API, admin API, image serving, static files |
| `scripts/seed.js` | Imports the original team and posts with their photos as base64 |
| `scripts/build-pages.js` | Generates the public HTML pages from one shared header, footer and content list. Edit it and run `node scripts/build-pages.js` instead of editing the pages by hand |
| `public/` | The public site: `index`, `about`, `services`, `insights`, `post` (single article), `contact`, `404` |
| `public/css/styles.css` | Site design: monochrome warm off-white and near-black, Geist and Geist Mono |
| `public/js/main.js` | Loads featured posts, insights, articles and team from the API; sends the contact form |
| `public/admin/` | Admin dashboard (plain HTML, CSS and JS, no build step) |

## Admin dashboard

Sign in at `/admin` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

- **Overview**: new enquiries, 30-day enquiry chart, latest messages and the posts currently on the home page
- **Enquiries**: every contact form submission, with search, status (new, read, replied, archived), reply by email, call, delete and CSV export
- **Insights**: create, edit, publish, unpublish and delete posts. The star sends a post to the home page; the home page shows the newest three featured posts
- **Post editor**: rich text (headings, lists, quotes, links, dividers, YouTube and Vimeo embeds), an HTML source view, HTML file import, and drag-and-drop or paste for images anywhere in the text and for the cover image
- **Team**: add, edit, hide, delete and drag to reorder members, with photo upload

### How images are stored

Images dropped into the dashboard are resized in the browser (WebP, max 1800 to 2000px) and sent as base64 to `POST /api/admin/media`.
They live in the `media` collection and are served from `/media/:id`, so posts reference `/media/:id` instead of embedding megabytes of base64 in the HTML.
Deleting a post or team member also deletes its images.

## MongoDB collections

Database `yarlcreators_cms` (set with `DB_NAME`):

- `contacts`: name, email, phone, service, message, status, createdAt
- `blogs`: title, slug, excerpt, category, content (HTML), coverId, featured, status, publishedAt
- `team`: name, role, bio, photoId, order, visible
- `media`: mime, data (base64), size, name

## Deploying

Set `NODE_ENV=production` so the admin cookie is marked `Secure`, use a strong `ADMIN_PASSWORD` and a long random `SESSION_SECRET`, and point `MONGODB_URI` at your production database (for example MongoDB Atlas).

---

Design pass guided by [unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0.
