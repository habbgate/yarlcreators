<?php
// JSON API for the contact form and the admin dashboard.
// Every /api/... URL is routed here by .htaccess (Apache) or router.php (php -S).
declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';
require dirname(__DIR__) . '/includes/content.php';

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

final class HttpError extends Exception
{
    public int $status;
    public array $extra;
    public function __construct(int $status, string $message, array $extra = [])
    {
        parent::__construct($message);
        $this->status = $status;
        $this->extra = $extra;
    }
}

function json_out($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function body(): array
{
    static $b = null;
    if ($b === null) {
        $raw = file_get_contents('php://input') ?: '';
        $b = $raw !== '' ? json_decode($raw, true) : [];
        if (!is_array($b)) {
            $b = $_POST ?: [];
        }
    }
    return $b;
}

function str_in($v, int $max = 5000): string
{
    return is_string($v) ? mb_substr(trim($v), 0, $max) : '';
}

function bool_in($v): bool
{
    return $v === true || $v === 1 || $v === '1' || $v === 'true';
}

function id_in($v): ?int
{
    if (is_int($v) && $v > 0) {
        return $v;
    }
    return (is_string($v) && ctype_digit($v) && (int) $v > 0) ? (int) $v : null;
}

function need_id(string $v): int
{
    $id = id_in($v);
    if (!$id) {
        throw new HttpError(400, 'Bad id');
    }
    return $id;
}

// ---------- admin session ----------
function start_admin_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('yc_admin');
    session_set_cookie_params([
        'lifetime' => 12 * 3600,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    ini_set('session.gc_maxlifetime', (string) (12 * 3600));
    session_start();
}

function require_admin(): string
{
    start_admin_session();
    $email = $_SESSION['admin'] ?? null;
    $exp = $_SESSION['exp'] ?? 0;
    if (!$email || $exp < time()) {
        throw new HttpError(401, 'Sign in required');
    }
    return $email;
}

// ---------- media ----------
function store_data_url($dataUrl, $name): array
{
    if (!preg_match('/^data:(image\/(png|jpe?g|webp|gif|avif|svg\+xml));base64,([A-Za-z0-9+\/=\s]+)$/i', (string) $dataUrl, $m)) {
        throw new HttpError(400, 'Only PNG, JPEG, WebP, GIF, AVIF or SVG images are accepted');
    }
    $mime = strtolower($m[1]);
    $data = (string) preg_replace('/\s/', '', $m[3]);
    $bytes = base64_decode($data, true);
    if ($bytes === false) {
        throw new HttpError(400, 'Image data is not valid base64');
    }
    if (strlen($bytes) > MAX_IMAGE_BYTES) {
        throw new HttpError(413, 'Image is larger than 6 MB');
    }
    if ($mime === 'image/svg+xml' && preg_match('/<script|on[a-z]+\s*=|javascript:/i', $bytes)) {
        throw new HttpError(400, 'SVG contains scripts');
    }
    q('INSERT INTO media (mime, data, size, name, created_at) VALUES (?, ?, ?, ?, ?)', [$mime, $data, strlen($bytes), str_in($name, 200), now_sql()]);
    $id = (int) db()->lastInsertId();
    return ['id' => (string) $id, 'url' => media_url($id)];
}

function delete_media(array $ids): void
{
    $ids = array_values(array_unique(array_filter(array_map('intval', $ids))));
    if ($ids) {
        q('DELETE FROM media WHERE id IN (' . implode(',', array_fill(0, count($ids), '?')) . ')', $ids);
    }
}

// ---------- blogs ----------
function unique_slug(string $base, ?int $excludeId = null): string
{
    $slug = $base;
    for ($i = 2; ; $i++) {
        $sql = 'SELECT id FROM blogs WHERE slug = ?' . ($excludeId ? ' AND id <> ?' : '') . ' LIMIT 1';
        $params = $excludeId ? [$slug, $excludeId] : [$slug];
        if (!q($sql, $params)->fetch()) {
            return $slug;
        }
        $slug = $base . '-' . $i;
    }
}

function to_sql_date($v): ?string
{
    if (!is_string($v) || $v === '') {
        return null;
    }
    $t = strtotime($v);
    return $t ? gmdate('Y-m-d H:i:s', $t) : null;
}

function blog_input(array $b, array $existing = []): array
{
    $content = sanitize_html((string) ($b['content'] ?? $existing['content'] ?? ''));
    $status = in_array($b['status'] ?? null, ['draft', 'published'], true) ? $b['status'] : ($existing['status'] ?? 'draft');
    $title = str_in($b['title'] ?? $existing['title'] ?? '', 200);
    if ($title === '') {
        throw new HttpError(400, 'Add a title');
    }
    $excerpt = str_in($b['excerpt'] ?? '', 400);
    if ($excerpt === '') {
        $excerpt = mb_substr(strip_html($content), 0, 180);
    }
    $cover = $existing['cover_id'] ?? null;
    if (array_key_exists('coverId', $b)) {
        $cover = $b['coverId'] === null ? null : (id_in($b['coverId']) ?? $cover);
    }
    $out = [
        'title' => $title,
        'excerpt' => $excerpt,
        'category' => str_in($b['category'] ?? $existing['category'] ?? '', 80),
        'content' => $content,
        'cover_id' => $cover,
        'featured' => array_key_exists('featured', $b) ? (int) bool_in($b['featured']) : (int) ($existing['featured'] ?? 0),
        'status' => $status,
        'reading_minutes' => reading_minutes($content),
        'updated_at' => now_sql(),
    ];
    $pub = to_sql_date($b['publishedAt'] ?? null);
    if ($pub) {
        $out['published_at'] = $pub;
    } elseif ($status === 'published' && empty($existing['published_at'])) {
        $out['published_at'] = now_sql();
    }
    return $out;
}

function inline_media_ids(string $html): array
{
    preg_match_all('#/media/(\d+)#', $html, $m);
    return $m[1];
}

// ---------- team ----------
function team_input(array $b, array $existing = []): array
{
    $name = str_in($b['name'] ?? $existing['name'] ?? '', 120);
    if ($name === '') {
        throw new HttpError(400, 'Add a name');
    }
    $photo = $existing['photo_id'] ?? null;
    if (array_key_exists('photoId', $b)) {
        $photo = $b['photoId'] === null ? null : (id_in($b['photoId']) ?? $photo);
    }
    return [
        'name' => $name,
        'role' => str_in($b['role'] ?? $existing['role'] ?? '', 120),
        'bio' => str_in($b['bio'] ?? $existing['bio'] ?? '', 600),
        'photo_id' => $photo,
        'visible' => array_key_exists('visible', $b) ? (int) bool_in($b['visible']) : (int) ($existing['visible'] ?? 1),
        'updated_at' => now_sql(),
    ];
}

function insert_row(string $table, array $data): int
{
    $cols = array_keys($data);
    q('INSERT INTO `' . $table . '` (`' . implode('`, `', $cols) . '`) VALUES (' . implode(', ', array_fill(0, count($cols), '?')) . ')', array_values($data));
    return (int) db()->lastInsertId();
}

function update_row(string $table, int $id, array $data): void
{
    $set = implode(', ', array_map(fn($c) => "`$c` = ?", array_keys($data)));
    q('UPDATE `' . $table . '` SET ' . $set . ' WHERE id = ?', array_merge(array_values($data), [$id]));
}

function contact_out(array $c): array
{
    $id = (string) $c['id'];
    return [
        'id' => $id,
        '_id' => $id,
        'name' => $c['name'],
        'email' => $c['email'],
        'phone' => $c['phone'],
        'service' => $c['service'],
        'message' => (string) $c['message'],
        'status' => $c['status'],
        'createdAt' => iso($c['created_at']),
        'updatedAt' => iso($c['updated_at']),
    ];
}

// ---------- routing ----------
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = '/' . trim((string) preg_replace('#^.*?/api(/|$)#', '', $path), '/');
$seg = $path === '/' ? [] : explode('/', ltrim($path, '/'));

try {
    // ----- public -----
    if ($method === 'POST' && $path === '/contact') {
        if (!rate_ok('contact', 5, 600)) {
            throw new HttpError(429, 'Too many requests. Please try again shortly.');
        }
        $b = body();
        if (str_in($b['company_site'] ?? '') !== '') {
            json_out(['ok' => true]); // honeypot filled in: quietly ignore
        }
        $doc = [
            'name' => str_in($b['name'] ?? '', 120),
            'email' => strtolower(str_in($b['email'] ?? '', 160)),
            'phone' => str_in($b['phone'] ?? '', 40),
            'service' => str_in($b['service'] ?? '', 80),
            'message' => str_in($b['message'] ?? '', 5000),
            'status' => 'new',
            'created_at' => now_sql(),
        ];
        $errors = [];
        if ($doc['name'] === '') {
            $errors['name'] = 'Enter your name';
        }
        if (!preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $doc['email'])) {
            $errors['email'] = 'Enter a valid email';
        }
        if (!preg_match('/^[+\d][\d\s()-]{6,}$/', $doc['phone'])) {
            $errors['phone'] = 'Enter a valid phone number';
        }
        if ($errors) {
            throw new HttpError(400, 'Please check the highlighted fields', ['errors' => $errors]);
        }
        insert_row('contacts', $doc);
        json_out(['ok' => true], 201);
    }

    if ($method === 'GET' && $path === '/blogs') {
        $list = published_posts((int) ($_GET['limit'] ?? 24) ?: 24, bool_in($_GET['featured'] ?? ''), str_in($_GET['category'] ?? '', 80));
        json_out(array_map('blog_summary', $list));
    }

    if ($method === 'GET' && count($seg) === 2 && $seg[0] === 'blogs') {
        $b = post_by_slug(rawurldecode($seg[1]));
        if (!$b) {
            throw new HttpError(404, 'Not found');
        }
        json_out(blog_summary($b) + ['content' => $b['content'], 'more' => array_map('blog_summary', more_posts((int) $b['id']))]);
    }

    if ($method === 'GET' && $path === '/logos') {
        json_out(visible_logos());
    }

    if ($method === 'GET' && $path === '/team') {
        json_out(array_map('team_out', visible_team()));
    }

    // ----- admin -----
    if (($seg[0] ?? '') !== 'admin') {
        throw new HttpError(404, 'Not found');
    }
    $a = array_slice($seg, 1);
    $ap = '/' . implode('/', $a);

    if ($method === 'POST' && $ap === '/login') {
        if (!rate_ok('login', 10, 900)) {
            throw new HttpError(429, 'Too many requests. Please try again shortly.');
        }
        $email = strtolower(str_in(body()['email'] ?? '', 160));
        $password = (string) (body()['password'] ?? '');
        $expected = (string) config('admin_password', '');
        if ($expected === '' || $expected === 'change-me') {
            throw new HttpError(503, 'Set admin_password in config.php first');
        }
        $ok = hash_equals(strtolower((string) config('admin_email', '')), $email)
            & hash_equals(hash('sha256', $expected), hash('sha256', $password));
        if (!$ok) {
            throw new HttpError(401, 'Email or password is incorrect');
        }
        start_admin_session();
        session_regenerate_id(true);
        $_SESSION['admin'] = $email;
        $_SESSION['exp'] = time() + 12 * 3600;
        json_out(['ok' => true, 'email' => $email]);
    }

    if ($method === 'POST' && $ap === '/logout') {
        start_admin_session();
        $_SESSION = [];
        session_destroy();
        setcookie('yc_admin', '', ['expires' => time() - 3600, 'path' => '/', 'httponly' => true, 'samesite' => 'Strict']);
        json_out(['ok' => true]);
    }

    $admin = require_admin();
    session_write_close(); // the rest only reads the session

    if ($method === 'GET' && $ap === '/me') {
        json_out(['email' => $admin]);
    }

    if ($method === 'GET' && $ap === '/stats') {
        $since = gmdate('Y-m-d H:i:s', time() - 30 * 86400);
        $count = fn(string $sql, array $p = []) => (int) q($sql, $p)->fetchColumn();
        $daily = q("SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS n FROM contacts WHERE created_at >= ? GROUP BY d", [$since])->fetchAll();
        json_out([
            'contactsTotal' => $count("SELECT COUNT(*) FROM contacts WHERE status <> 'archived'"),
            'contactsNew' => $count("SELECT COUNT(*) FROM contacts WHERE status = 'new'"),
            'contacts30' => $count('SELECT COUNT(*) FROM contacts WHERE created_at >= ?', [$since]),
            'blogsPublished' => $count("SELECT COUNT(*) FROM blogs WHERE status = 'published'"),
            'blogsDraft' => $count("SELECT COUNT(*) FROM blogs WHERE status = 'draft'"),
            'blogsFeatured' => $count("SELECT COUNT(*) FROM blogs WHERE status = 'published' AND featured = 1"),
            'team' => $count('SELECT COUNT(*) FROM team'),
            'recent' => array_map('contact_out', q('SELECT * FROM contacts ORDER BY created_at DESC, id DESC LIMIT 6')->fetchAll()),
            'daily' => array_map(fn($r) => ['_id' => $r['d'], 'n' => (int) $r['n']], $daily),
        ]);
    }

    // Enquiries from the contact form
    if ($method === 'GET' && $ap === '/contacts') {
        $status = str_in($_GET['status'] ?? '', 20);
        $where = [];
        $params = [];
        if ($status === '' ) {
            $where[] = "status <> 'archived'";
        } elseif ($status !== 'all') {
            $where[] = 'status = ?';
            $params[] = $status;
        }
        $term = str_in($_GET['q'] ?? '', 100);
        if ($term !== '') {
            $where[] = '(name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ? OR service LIKE ?)';
            $like = '%' . addcslashes($term, '%_\\') . '%';
            array_push($params, $like, $like, $like, $like, $like);
        }
        $sql = 'SELECT * FROM contacts' . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY created_at DESC, id DESC LIMIT 500';
        json_out(array_map('contact_out', q($sql, $params)->fetchAll()));
    }

    if ($method === 'GET' && $ap === '/contacts.csv') {
        $rows = q('SELECT * FROM contacts ORDER BY created_at DESC, id DESC')->fetchAll();
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="yarl-creators-enquiries.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, ['Date', 'Name', 'Email', 'Phone', 'Service', 'Message', 'Status'], ',', '"', '');
        foreach ($rows as $c) {
            // a leading = + - @ would be run as a formula by spreadsheet apps
            $cells = array_map(fn($v) => (preg_match('/^[=+\-@\t\r]/', (string) $v) && !preg_match('/^\+[\d\s()-]+$/', (string) $v)) ? "'" . $v : (string) $v, [iso($c['created_at']), $c['name'], $c['email'], $c['phone'], $c['service'], $c['message'], $c['status']]);
            fputcsv($out, $cells, ',', '"', '');
        }
        exit;
    }

    if (count($a) === 2 && $a[0] === 'contacts') {
        $id = need_id($a[1]);
        if ($method === 'PATCH') {
            $status = str_in(body()['status'] ?? '', 20);
            if (!in_array($status, ['new', 'read', 'replied', 'archived'], true)) {
                throw new HttpError(400, 'Unknown status');
            }
            q('UPDATE contacts SET status = ?, updated_at = ? WHERE id = ?', [$status, now_sql(), $id]);
            json_out(['ok' => true]);
        }
        if ($method === 'DELETE') {
            q('DELETE FROM contacts WHERE id = ?', [$id]);
            json_out(['ok' => true]);
        }
    }

    // Image upload (base64 data URL -> media table)
    if ($method === 'POST' && $ap === '/media') {
        json_out(store_data_url(body()['dataUrl'] ?? '', body()['name'] ?? ''), 201);
    }

    // Blog posts
    if ($a === ['blogs']) {
        if ($method === 'GET') {
            json_out(array_map('blog_summary', q('SELECT ' . BLOG_LIST_COLUMNS . ' FROM blogs ORDER BY updated_at DESC, id DESC')->fetchAll()));
        }
        if ($method === 'POST') {
            $doc = blog_input(body());
            $doc['slug'] = unique_slug(slugify(str_in(body()['slug'] ?? '', 120) ?: $doc['title']));
            $doc['created_at'] = now_sql();
            $id = insert_row('blogs', $doc);
            json_out(['id' => (string) $id, 'slug' => $doc['slug']], 201);
        }
    }

    if (count($a) === 2 && $a[0] === 'blogs') {
        $id = need_id($a[1]);
        $existing = q('SELECT * FROM blogs WHERE id = ?', [$id])->fetch();
        if (!$existing) {
            throw new HttpError(404, 'Not found');
        }
        if ($method === 'GET') {
            json_out(blog_summary($existing) + ['coverId' => $existing['cover_id'] ? (string) $existing['cover_id'] : null, 'content' => $existing['content']]);
        }
        if ($method === 'PUT') {
            $doc = blog_input(body(), $existing);
            $wanted = str_in(body()['slug'] ?? '', 120);
            if ($wanted !== '' && slugify($wanted) !== $existing['slug']) {
                $doc['slug'] = unique_slug(slugify($wanted), $id);
            }
            update_row('blogs', $id, $doc);
            if ($existing['cover_id'] && (int) $existing['cover_id'] !== (int) $doc['cover_id']) {
                delete_media([$existing['cover_id']]);
            }
            json_out(['ok' => true, 'slug' => $doc['slug'] ?? $existing['slug']]);
        }
        if ($method === 'PATCH') {
            $set = ['updated_at' => now_sql()];
            if (array_key_exists('featured', body())) {
                $set['featured'] = (int) bool_in(body()['featured']);
            }
            if (in_array(body()['status'] ?? null, ['draft', 'published'], true)) {
                $set['status'] = body()['status'];
                if ($set['status'] === 'published' && empty($existing['published_at'])) {
                    $set['published_at'] = now_sql();
                }
            }
            update_row('blogs', $id, $set);
            json_out(['ok' => true]);
        }
        if ($method === 'DELETE') {
            q('DELETE FROM blogs WHERE id = ?', [$id]);
            delete_media(array_merge([$existing['cover_id']], inline_media_ids((string) $existing['content'])));
            json_out(['ok' => true]);
        }
    }

    // Client logos
    if ($a === ['logos']) {
        ensure_logos();
        if ($method === 'GET') {
            json_out(array_map('logo_out', q('SELECT * FROM logos ORDER BY sort_order, id')->fetchAll()));
        }
        if ($method === 'POST') {
            $b = body();
            $img = id_in($b['imageId'] ?? null);
            if (!$img) {
                throw new HttpError(400, 'Upload a logo image');
            }
            $id = insert_row('logos', [
                'name' => str_in($b['name'] ?? '', 120),
                'image_id' => $img,
                'sort_order' => (int) q('SELECT COALESCE(MAX(sort_order), -1) + 1 FROM logos')->fetchColumn(),
                'created_at' => now_sql(),
            ]);
            json_out(['id' => (string) $id], 201);
        }
    }
    if ($method === 'POST' && $ap === '/logos/reorder') {
        ensure_logos();
        $ids = array_values(array_filter(array_map('id_in', is_array(body()['ids'] ?? null) ? body()['ids'] : [])));
        $st = db()->prepare('UPDATE logos SET sort_order = ? WHERE id = ?');
        foreach ($ids as $i => $lid) {
            $st->execute([$i, $lid]);
        }
        json_out(['ok' => true]);
    }
    if (count($a) === 2 && $a[0] === 'logos') {
        ensure_logos();
        $id = need_id($a[1]);
        $existing = q('SELECT * FROM logos WHERE id = ?', [$id])->fetch();
        if (!$existing) {
            throw new HttpError(404, 'Not found');
        }
        if ($method === 'PUT') {
            $b = body();
            $set = [];
            if (array_key_exists('visible', $b)) {
                $set['visible'] = (int) bool_in($b['visible']);
            }
            if (array_key_exists('name', $b)) {
                $set['name'] = str_in($b['name'], 120);
            }
            if ($set) {
                update_row('logos', $id, $set);
            }
            json_out(['ok' => true]);
        }
        if ($method === 'DELETE') {
            q('DELETE FROM logos WHERE id = ?', [$id]);
            delete_media([$existing['image_id']]);
            json_out(['ok' => true]);
        }
    }

    // Team
    if ($a === ['team']) {
        if ($method === 'GET') {
            json_out(array_map('team_out', q('SELECT * FROM team ORDER BY sort_order, id')->fetchAll()));
        }
        if ($method === 'POST') {
            $doc = team_input(body());
            $doc['sort_order'] = (int) q('SELECT COALESCE(MAX(sort_order), -1) + 1 FROM team')->fetchColumn();
            $doc['created_at'] = now_sql();
            json_out(['id' => (string) insert_row('team', $doc)], 201);
        }
    }

    if ($method === 'POST' && $ap === '/team/reorder') {
        $ids = array_values(array_filter(array_map('id_in', is_array(body()['ids'] ?? null) ? body()['ids'] : [])));
        $st = db()->prepare('UPDATE team SET sort_order = ? WHERE id = ?');
        foreach ($ids as $i => $tid) {
            $st->execute([$i, $tid]);
        }
        json_out(['ok' => true]);
    }

    if (count($a) === 2 && $a[0] === 'team') {
        $id = need_id($a[1]);
        $existing = q('SELECT * FROM team WHERE id = ?', [$id])->fetch();
        if (!$existing) {
            throw new HttpError(404, 'Not found');
        }
        if ($method === 'PUT') {
            $doc = team_input(body(), $existing);
            update_row('team', $id, $doc);
            if ($existing['photo_id'] && (int) $existing['photo_id'] !== (int) $doc['photo_id']) {
                delete_media([$existing['photo_id']]);
            }
            json_out(['ok' => true]);
        }
        if ($method === 'DELETE') {
            q('DELETE FROM team WHERE id = ?', [$id]);
            delete_media([$existing['photo_id']]);
            json_out(['ok' => true]);
        }
    }

    throw new HttpError(404, 'Not found');
} catch (HttpError $e) {
    json_out(['error' => $e->getMessage()] + $e->extra, $e->status);
} catch (Throwable $e) {
    error_log('[api] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    json_out(['error' => config('debug') ? $e->getMessage() : 'Server error'], 500);
}
