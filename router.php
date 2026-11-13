<?php
// Local development server with the same URLs as .htaccess:
//   php -S localhost:8000 router.php
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$root = __DIR__;

if (preg_match('#^/(includes|database|design-review)(/|$)|^/config(\.sample)?\.php$|/\.|\.(sql|md)$#', $path)) {
    http_response_code(403);
    exit('Forbidden');
}
if (preg_match('#^/api(/|$)#', $path)) {
    require $root . '/api/index.php';
    return true;
}
if (preg_match('#^/media/(\d+)/?$#', $path, $m)) {
    $_GET['id'] = $m[1];
    require $root . '/media.php';
    return true;
}
if (preg_match('#^/insights/([^/]+)/?$#', $path, $m)) {
    $_GET['slug'] = $m[1];
    require $root . '/post.php';
    return true;
}
if ($path === '/admin' || $path === '/admin/') {
    if ($path === '/admin') {
        header('Location: /admin/');
        return true;
    }
    readfile($root . '/admin/index.html');
    return true;
}
if ($path === '/' || $path === '/index.php') {
    require $root . '/index.php';
    return true;
}
if (preg_match('#^/([a-z0-9-]+)/?$#', $path, $m) && is_file("$root/{$m[1]}.php") && !in_array($m[1], ['router', 'media'], true)) {
    require "$root/{$m[1]}.php";
    return true;
}
if (is_file($root . $path) && !str_ends_with($path, '.php')) {
    return false; // let the built-in server send static files (css, js, images, admin assets)
}
require $root . '/404.php';
return true;
