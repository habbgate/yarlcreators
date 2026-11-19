<?php
// Blog and team queries shared by the pages and the JSON API.
declare(strict_types=1);

const BLOG_LIST_COLUMNS = 'id, title, slug, excerpt, category, cover_id, featured, status, reading_minutes, published_at, updated_at';

function blog_summary(array $b): array
{
    return [
        'id' => (string) $b['id'],
        'title' => $b['title'],
        'slug' => $b['slug'],
        'excerpt' => $b['excerpt'],
        'category' => $b['category'],
        'cover' => media_url($b['cover_id']),
        'featured' => (bool) $b['featured'],
        'status' => $b['status'],
        'publishedAt' => iso($b['published_at']),
        'updatedAt' => iso($b['updated_at']),
        'readingMinutes' => (int) ($b['reading_minutes'] ?: 1),
    ];
}

function team_out(array $t): array
{
    return [
        'id' => (string) $t['id'],
        'name' => $t['name'],
        'role' => $t['role'],
        'bio' => (string) ($t['bio'] ?? ''),
        'photo' => media_url($t['photo_id']),
        'photoId' => $t['photo_id'] ? (string) $t['photo_id'] : null,
        'order' => (int) $t['sort_order'],
        'visible' => (bool) $t['visible'],
    ];
}

/** Published posts, newest first. */
function published_posts(int $limit = 24, bool $featuredOnly = false, string $category = ''): array
{
    $sql = 'SELECT ' . BLOG_LIST_COLUMNS . " FROM blogs WHERE status = 'published'";
    $params = [];
    if ($featuredOnly) {
        $sql .= ' AND featured = 1';
    }
    if ($category !== '') {
        $sql .= ' AND category = ?';
        $params[] = $category;
    }
    $sql .= ' ORDER BY published_at DESC, id DESC LIMIT ' . max(1, min($limit, 60));
    return q($sql, $params)->fetchAll();
}

/** The three posts on the home page: featured ones, or the newest when none are featured. */
function home_posts(): array
{
    $list = published_posts(3, true);
    return $list ?: published_posts(3);
}

function post_by_slug(string $slug): ?array
{
    $row = q("SELECT * FROM blogs WHERE slug = ? AND status = 'published' LIMIT 1", [substr($slug, 0, 120)])->fetch();
    return $row ?: null;
}

function more_posts(int $excludeId, int $limit = 3): array
{
    return q('SELECT ' . BLOG_LIST_COLUMNS . " FROM blogs WHERE status = 'published' AND id <> ? ORDER BY published_at DESC, id DESC LIMIT " . (int) $limit, [$excludeId])->fetchAll();
}

function visible_team(): array
{
    return q('SELECT * FROM team WHERE visible = 1 ORDER BY sort_order, id')->fetchAll();
}

/** Client logos shown in the scrolling strip. Creates and seeds the table on first use. */
function ensure_logos(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $existed = (bool) q("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'logos'")->fetch();
    db()->exec("CREATE TABLE IF NOT EXISTS `logos` (
      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      `name` VARCHAR(120) NOT NULL DEFAULT '',
      `image_id` INT UNSIGNED NULL DEFAULT NULL,
      `src` VARCHAR(255) NULL DEFAULT NULL,
      `visible` TINYINT(1) NOT NULL DEFAULT 1,
      `sort_order` INT NOT NULL DEFAULT 0,
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      KEY `idx_order` (`sort_order`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    if (!$existed) {
        $seed = ['2-2', '3', '4', '5', '6', '8', '9', '78', '457'];
        $st = db()->prepare('INSERT INTO logos (name, src, sort_order) VALUES (?, ?, ?)');
        foreach ($seed as $i => $n) {
            $st->execute(['Client ' . ($i + 1), '/images/2025/08/Untitled-' . $n . '.png', $i]);
        }
    }
}

function logo_out(array $l): array
{
    return [
        'id' => (string) $l['id'],
        'name' => $l['name'],
        'url' => $l['image_id'] ? media_url($l['image_id']) : (string) $l['src'],
        'imageId' => $l['image_id'] ? (string) $l['image_id'] : null,
        'order' => (int) $l['sort_order'],
        'visible' => (bool) $l['visible'],
    ];
}

function visible_logos(): array
{
    ensure_logos();
    return array_map('logo_out', q('SELECT * FROM logos WHERE visible = 1 ORDER BY sort_order, id')->fetchAll());
}

/** Photo card used on the home page, the insights list and under articles. */
function post_card(array $p): string
{
    $arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    $cover = media_url($p['cover_id']);
    return '<a class="work-card reveal" href="/insights/' . e(rawurlencode($p['slug'])) . '" data-cat="' . e($p['category']) . '">'
        . '<span class="wc-img">' . ($cover ? '<img src="' . e($cover) . '" alt="" loading="lazy">' : '') . '<span class="go">' . $arrow . '</span></span>'
        . '<div class="over"><span class="tag">' . e($p['category'] ?: 'Insight') . '</span><h3>' . e($p['title']) . '</h3>'
        . '<div class="meta">' . e(nice_date($p['published_at'])) . ' · ' . (int) ($p['reading_minutes'] ?: 1) . ' min read</div></div></a>';
}


/** Title banner used at the top of every inner page (photo + wine overlay + giant title). */
function page_banner(string $crumb, string $title, string $sub, string $img, string $extra = ''): string
{
    return '<section class="ph-banner" style="--ph-img:url(\'' . e($img) . '\')">'
        . '<div class="wrap">'
        . '<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>' . e($crumb) . '</span></nav>'
        . '<div class="ph-row"><h1>' . e($title) . '</h1>' . ($sub !== '' ? '<p class="ph-sub">' . $sub . '</p>' : '') . '</div>'
        . $extra
        . '<div class="ph-visual" aria-hidden="true"><span class="ph-chip">Yarl Creators · Jaffna</span></div>'
        . '</div></section>';
}

/* ---------- Site stats and testimonials (managed in the admin dashboard) ---------- */
function ensure_stats(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $existed = (bool) q("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'stats'")->fetch();
    db()->exec("CREATE TABLE IF NOT EXISTS `stats` (
      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      `value` VARCHAR(20) NOT NULL DEFAULT '',
      `suffix` VARCHAR(8) NOT NULL DEFAULT '',
      `label` VARCHAR(120) NOT NULL DEFAULT '',
      `visible` TINYINT(1) NOT NULL DEFAULT 1,
      `sort_order` INT NOT NULL DEFAULT 0,
      PRIMARY KEY (`id`),
      KEY `idx_order` (`sort_order`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    if (!$existed) {
        $st = db()->prepare('INSERT INTO stats (value, suffix, label, sort_order) VALUES (?, ?, ?, ?)');
        foreach ([['2022', '', 'Founded in Jaffna'], ['20', '+', 'Businesses served'], ['10', '+', 'Projects completed'], ['6', '+', 'Countries with clients']] as $i => $s) {
            $st->execute([$s[0], $s[1], $s[2], $i]);
        }
    }
}

function ensure_testimonials(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;
    $existed = (bool) q("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'testimonials'")->fetch();
    db()->exec("CREATE TABLE IF NOT EXISTS `testimonials` (
      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      `quote` TEXT NOT NULL,
      `name` VARCHAR(120) NOT NULL DEFAULT '',
      `role` VARCHAR(120) NOT NULL DEFAULT '',
      `visible` TINYINT(1) NOT NULL DEFAULT 1,
      `sort_order` INT NOT NULL DEFAULT 0,
      PRIMARY KEY (`id`),
      KEY `idx_order` (`sort_order`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    if (!$existed) {
        $seed = [
            ['Fast, professional and creative. Our brand video turned out better than we imagined.', 'Suthanthi', 'Digital marketing'],
            ['The workshop was practical and inspiring. The team shares real production knowledge.', 'Sivakumar', 'Workshop participant'],
            ['Reliable partners for our social media content from start to finish.', 'Selvan', 'Social media client'],
            ['Excellent photography and video work. Highly recommended.', 'Gopinath', 'Photography and video'],
            ['Our social media content has never looked this good.', 'Karthik', 'Social media content'],
            ['Great team to work with, from concept to final delivery.', 'Prince', 'Client'],
        ];
        $st = db()->prepare('INSERT INTO testimonials (quote, name, role, sort_order) VALUES (?, ?, ?, ?)');
        foreach ($seed as $i => $s) {
            $st->execute([$s[0], $s[1], $s[2], $i]);
        }
    }
}

function stat_out(array $s): array
{
    return ['id' => (string) $s['id'], 'value' => $s['value'], 'suffix' => $s['suffix'], 'label' => $s['label'], 'visible' => (bool) $s['visible'], 'order' => (int) $s['sort_order']];
}

function testimonial_out(array $t): array
{
    return ['id' => (string) $t['id'], 'quote' => $t['quote'], 'name' => $t['name'], 'role' => $t['role'], 'visible' => (bool) $t['visible'], 'order' => (int) $t['sort_order']];
}

/** Stat blocks. $wrapClass is the container class used by the page. */
function render_stats(): string
{
    ensure_stats();
    $out = '';
    foreach (q('SELECT * FROM stats WHERE visible = 1 ORDER BY sort_order, id')->fetchAll() as $s) {
        $out .= '<div class="stat reveal"><strong>' . e($s['value']) . ($s['suffix'] !== '' ? '<sup>' . e($s['suffix']) . '</sup>' : '') . '</strong><span>' . e($s['label']) . '</span></div>';
    }
    return $out;
}

/** The testimonial slider block (quotes, arrows and dots). Empty when there are none. */
function render_testimonials(string $eyebrow, string $heading): string
{
    ensure_testimonials();
    $rows = q('SELECT * FROM testimonials WHERE visible = 1 ORDER BY sort_order, id')->fetchAll();
    if (!$rows) {
        return '';
    }
    $arrowL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>';
    $arrowR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    $voices = '';
    $dots = '';
    foreach ($rows as $i => $t) {
        $initial = e(mb_strtoupper(mb_substr(trim($t['name']) ?: '?', 0, 1)));
        $voices .= '<figure class="voice' . ($i === 0 ? ' on' : '') . '" aria-hidden="' . ($i === 0 ? 'false' : 'true') . '"><p>' . e($t['quote']) . '</p><figcaption><span class="av">' . $initial . '</span><span><b>' . e($t['name']) . '</b><small>' . e($t['role']) . '</small></span></figcaption></figure>';
        $dots .= '<button class="' . ($i === 0 ? 'on' : '') . '" data-dot="' . $i . '" aria-label="Testimonial ' . ($i + 1) . '"></button>';
    }
    $nav = count($rows) > 1
        ? '<div class="voice-nav"><button class="round" data-voice="-1" aria-label="Previous testimonial">' . $arrowL . '</button><div class="dots">' . $dots . '</div><button class="round" data-voice="1" aria-label="Next testimonial">' . $arrowR . '</button></div>'
        : '';
    return '<section><div class="wrap"><div class="sh"><span class="eyebrow">' . e($eyebrow) . '</span><h2>' . $heading . '</h2></div>'
        . '<div class="voice-wrap"><div class="qm" aria-hidden="true">“</div><div class="voices">' . $voices . '</div>' . $nav . '</div></div></section>';
}
