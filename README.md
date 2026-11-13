# Yarl Creators website

Public website and admin dashboard for Yarl Creators, a media production studio in Jaffna.
Plain **PHP 8** with a **MySQL / MariaDB** database managed in **phpMyAdmin**. Enquiries, blog posts, the team and every uploaded image (stored as base64) live in the database.

## Run it on XAMPP / MAMP / any PHP host

1. **Database.** Open phpMyAdmin, create a database named `yarlcreators` (collation `utf8mb4_unicode_ci`), open it, choose **Import** and select `database/yarlcreators.sql`.
   This creates the tables and loads the current posts, team and photos. Use `database/schema.sql` instead for empty tables.
2. **Settings.** Copy `config.sample.php` to `config.php` and fill in the database user and password, plus `admin_email` and `admin_password` for the dashboard.
3. **Serve the folder from the web root of a domain** (for example a virtual host, or the whole `htdocs`). Apache needs `mod_rewrite` and `AllowOverride All`, so the `.htaccess` rules work.
4. Open `/` for the site and `/admin` for the dashboard.

### Quick local run without Apache

```bash
php -S localhost:8000 router.php
```

Then open http://localhost:8000 (admin at http://localhost:8000/admin). `router.php` mirrors the `.htaccess` rules.

## What is where

| Path | What it is |
| --- | --- |
| `index.php`, `about.php`, `services.php`, `insights.php`, `post.php`, `contact.php`, `404.php` | The public pages. Posts and team members are read from MySQL on the server |
| `includes/header.php`, `includes/footer.php` | Shared head, header and footer. Edit navigation, contact details and the footer here |
| `includes/bootstrap.php`, `includes/content.php` | Database connection, helpers, HTML sanitiser, post and team queries |
| `api/index.php` | JSON API for the contact form and the admin dashboard |
| `media.php` | Serves images from the `media` table at `/media/{id}` |
| `admin/` | Admin dashboard (plain HTML, CSS and JS, no build step) |
| `css/styles.css`, `js/main.js`, `images/` | Site design, small browser script (menu, testimonial slider, post filter, contact form), static photos and logos |
| `database/schema.sql`, `database/yarlcreators.sql` | Empty tables, and tables with the current content |
| `.htaccess`, `router.php` | Clean URLs and protection for private files (Apache, and the PHP built-in server) |
| `config.php` | Your private settings. Not in git |

Design: light warm ivory with wine red and champagne gold; a studio-photo hero with the giant headline sitting behind the camera (a cut-out layer), Bricolage Grotesque headlines with Instrument Serif italic accents.

## Admin dashboard

Sign in at `/admin` with `admin_email` and `admin_password` from `config.php`.

- **Overview**: new enquiries, 30-day enquiry chart, latest messages and the posts on the home page
- **Enquiries**: every contact form submission, with search, status (new, read, replied, archived), reply by email, call, delete and CSV export
- **Insights**: create, edit, publish, unpublish and delete posts. The star sends a post to the home page, which shows the newest three featured posts
- **Post editor**: rich text (headings, lists, quotes, links, dividers, YouTube and Vimeo embeds), an HTML source view, HTML file import, and drag-and-drop or paste for images anywhere in the text and for the cover image
- **Team**: add, edit, hide, delete and drag to reorder members, with photo upload

### How images are stored

Images dropped into the dashboard are resized in the browser (WebP, max 1800 to 2000px) and sent as base64 to `POST /api/admin/media`.
They live in the `media` table and are served from `/media/{id}`, so posts reference `/media/{id}` instead of embedding megabytes of base64 in the HTML.
Deleting a post or team member also deletes its images.

## Database tables

- `contacts`: name, email, phone, service, message, status, created_at
- `blogs`: title, slug, excerpt, category, content (HTML), cover_id, featured, status, published_at
- `team`: name, role, bio, photo_id, sort_order, visible
- `media`: mime, data (base64), size, name
- `rate_hits`: request log that limits contact-form and login spam

Large uploads: if an image import fails on a host with small limits, raise `upload_max_filesize`, `post_max_size` (about 16M) and MySQL `max_allowed_packet` (at least 16M).

## Going live

- Use a strong `admin_password`, set `'debug' => false` in `config.php`, and serve the site over HTTPS (the admin cookie is marked `Secure` automatically on HTTPS).
- Never upload `config.php` to a public repository. It is listed in `.gitignore`.
- `database/` and `includes/` are blocked from the web by `.htaccess`. On nginx, add equivalent `location` rules, and route `/api`, `/media/{id}` and `/insights/{slug}` to `api/index.php`, `media.php` and `post.php`.
