<?php
// Serves an image stored as base64 in the `media` table: /media/{id}
declare(strict_types=1);

require_once __DIR__ . '/includes/bootstrap.php';

$id = (int) ($_GET['id'] ?? 0);
$m = $id > 0 ? q('SELECT mime, data FROM media WHERE id = ?', [$id])->fetch() : null;
if (!$m) {
    http_response_code(404);
    header('Content-Type: text/plain');
    exit('Not found');
}

$etag = '"m' . $id . '"';
header('Cache-Control: public, max-age=31536000, immutable');
header('ETag: ' . $etag);
header('X-Content-Type-Options: nosniff');
if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
    http_response_code(304);
    exit;
}
header('Content-Type: ' . $m['mime']);
if ($m['mime'] === 'image/svg+xml') {
    header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'");
}
$bytes = base64_decode($m['data']);
header('Content-Length: ' . strlen($bytes));
echo $bytes;
