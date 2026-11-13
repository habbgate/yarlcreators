<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/content.php';

http_response_code(404);

$page = [
    'title' => 'Page not found | Yarl Creators',
    'description' => 'Page not found.',
    'nav' => '',
    'cta_title' => 'Let’s tell your <em>story</em>',
    'cta_text' => 'Tell us about your project. We will come back with ideas, a timeline and a quote.',
];
include __DIR__ . '/includes/header.php';
?>
<section class="fr-hero hero-404">
  <img class="fr-bg" src="/images/hero-desk.jpg" alt="" width="1672" height="941" fetchpriority="high">
  <div class="wrap fr-copy">
    <h1>Page not <em>found</em>.</h1>
    <p>The link may be old or mistyped. Let’s get you back to something that exists.</p>
    <a class="fr-btn" href="/">Back to home <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg></span></a>
  </div>
</section>

<section class="lost">
  <div class="wrap">
    <div class="sh"><span class="eyebrow">Where to next</span><h2>Pick up the <em>story</em> from here</h2></div>
    <div class="lost-grid">
      <a href="/about"><b>01</b><strong>About us</strong><span>The team behind the camera</span></a>
      <a href="/services"><b>02</b><strong>Services</strong><span>Film, photo, design and social</span></a>
      <a href="/insights"><b>03</b><strong>Insights</strong><span>Productions and brand stories</span></a>
      <a href="/contact"><b>04</b><strong>Contact</strong><span>Start a project with us</span></a>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
