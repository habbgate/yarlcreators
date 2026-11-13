<?php
// Shared setup for every page and API request: config, database and small helpers.
declare(strict_types=1);

define('ROOT', dirname(__DIR__));

$configFile = ROOT . '/config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    exit('Missing config.php. Copy config.sample.php to config.php and add your database details.');
}
$CONFIG = require $configFile;

date_default_timezone_set('UTC');
ini_set('display_errors', !empty($CONFIG['debug']) ? '1' : '0');
error_reporting(E_ALL);

const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // decoded size limit per uploaded image

function config(string $key, $default = null)
{
    global $CONFIG;
    return $CONFIG[$key] ?? $default;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', config('db_host', 'localhost'), (int) config('db_port', 3306), config('db_name', 'yarlcreators'));
        $pdo = new PDO($dsn, (string) config('db_user', 'root'), (string) config('db_pass', ''), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec("SET time_zone = '+00:00'");
    }
    return $pdo;
}

function q(string $sql, array $params = []): PDOStatement
{
    $st = db()->prepare($sql);
    $st->execute($params);
    return $st;
}

/** HTML-escape for templates */
function e($v): string
{
    return htmlspecialchars((string) ($v ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function media_url($id): ?string
{
    return $id ? '/media/' . (int) $id : null;
}

/** MySQL DATETIME (UTC) -> ISO 8601 for the JSON API */
function iso(?string $dt): ?string
{
    return $dt ? gmdate('Y-m-d\TH:i:s\Z', strtotime($dt . ' UTC')) : null;
}

function nice_date(?string $dt): string
{
    return $dt ? gmdate('j M Y', strtotime($dt . ' UTC')) : '';
}

function now_sql(): string
{
    return gmdate('Y-m-d H:i:s');
}

function client_ip(): string
{
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), 0, 64);
}

/** Returns false when this IP has made $max requests in the bucket within $seconds. */
function rate_ok(string $bucket, int $max, int $seconds): bool
{
    if (random_int(1, 50) === 1) {
        q('DELETE FROM rate_hits WHERE created_at < ?', [gmdate('Y-m-d H:i:s', time() - 86400)]);
    }
    $since = gmdate('Y-m-d H:i:s', time() - $seconds);
    $n = (int) q('SELECT COUNT(*) FROM rate_hits WHERE bucket = ? AND ip = ? AND created_at >= ?', [$bucket, client_ip(), $since])->fetchColumn();
    if ($n >= $max) {
        return false;
    }
    q('INSERT INTO rate_hits (bucket, ip, created_at) VALUES (?, ?, ?)', [$bucket, client_ip(), now_sql()]);
    return true;
}

function slugify(string $s): string
{
    $s = strtolower($s);
    if (function_exists('iconv')) {
        $t = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
        if ($t !== false) {
            $s = strtolower($t);
        }
    }
    $s = trim((string) preg_replace('/[^a-z0-9]+/', '-', $s), '-');
    $s = substr($s, 0, 80);
    return $s !== '' ? $s : 'post';
}

function strip_html(string $html): string
{
    return trim((string) preg_replace('/\s+/', ' ', str_replace('&nbsp;', ' ', (string) preg_replace('/<[^>]*>/', ' ', $html))));
}

function reading_minutes(string $html): int
{
    $words = array_filter(explode(' ', strip_html($html)));
    return max(1, (int) round(count($words) / 220));
}

/**
 * Defence in depth for admin-written HTML: drop scripts, event handlers,
 * javascript: URLs and iframes that are not YouTube/Vimeo embeds.
 */
function sanitize_html(string $html): string
{
    $out = (string) preg_replace('/<\s*(script|style|object|embed|link|meta|base|form)[\s\S]*?<\s*\/\s*\1\s*>/i', '', $html);
    $out = (string) preg_replace('/<\s*\/?\s*(script|style|object|embed|link|meta|base|form)\b[^>]*>/i', '', $out);
    $out = (string) preg_replace('/\son[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $out);
    $out = (string) preg_replace('/(href|src|xlink:href|action)\s*=\s*("|\')\s*(javascript|vbscript|data:text\/html)[^"\']*\2/i', '$1="#"', $out);
    $out = (string) preg_replace_callback('/<iframe\b[^>]*>[\s\S]*?<\/iframe>/i', function ($m) {
        $src = preg_match('/src\s*=\s*["\']([^"\']+)["\']/i', $m[0], $s) ? $s[1] : '';
        return preg_match('#^https://(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)/#i', $src) ? $m[0] : '';
    }, $out);
    return $out;
}
