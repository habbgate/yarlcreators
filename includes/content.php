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
