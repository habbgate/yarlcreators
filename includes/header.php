<?php
// Shared <head> and site header. Set $page = ['title', 'description', 'nav', 'cta_title', 'cta_text'] before including.
function nav_current(string $key): string
{
    global $page;
    return ($page['nav'] ?? '') === $key ? ' aria-current="page"' : '';
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($page['title']) ?></title>
<meta name="description" content="<?= e($page['description']) ?>">
<?php if (!empty($page['head'])) echo $page['head']; ?>
<meta name="theme-color" content="#e5e1da">
<link rel="icon" type="image/png" href="/images/2026/02/4-1.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Inter+Tight:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body<?= !empty($page['body']) ? ' class="' . e($page['body']) . '"' : '' ?>>
<a class="sr-only" href="#main">Skip to content</a>
<div class="frame">
<header class="site-header">
  <div class="bar">
    <a class="brand" href="/" aria-label="Yarl Creators home"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">Yarl Creators</span></a>
    <nav class="nav" aria-label="Main"><a href="/"<?= nav_current('home') ?>>Home</a><a href="/about"<?= nav_current('about') ?>>About</a><a href="/services"<?= nav_current('services') ?>>Services</a><a href="/insights"<?= nav_current('insights') ?>>Insights</a><a href="/contact"<?= nav_current('contact') ?>>Contact</a></nav>
    <div class="head-cta">
      <a class="btn sm" href="/contact">Get a quote <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a>
      <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg></button>
    </div>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">
    <div class="mn-links"><a href="/"<?= nav_current('home') ?>>Home</a><a href="/about"<?= nav_current('about') ?>>About</a><a href="/services"<?= nav_current('services') ?>>Services</a><a href="/insights"<?= nav_current('insights') ?>>Insights</a><a href="/contact"<?= nav_current('contact') ?>>Contact</a></div>
    <div class="mn-foot">
      <a class="btn white" href="/contact">Start a project <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a>
      <div class="mn-meta"><a href="tel:+94761981178">+94 76 198 1178</a><a href="mailto:yarlcreators0@gmail.com">yarlcreators0@gmail.com</a></div>
      <div class="mn-social"><a href="https://www.instagram.com/yarl_creators" rel="noopener">Instagram</a><a href="https://www.youtube.com/@Yarlinyathrikal" rel="noopener">YouTube</a><a href="https://web.facebook.com/profile.php?id=100083580871638" rel="noopener">Facebook</a></div>
    </div>
  </nav>
</header>
<main id="main">
