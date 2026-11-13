<?php
// Single article: /insights/{slug}
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/content.php';

$slug = (string) ($_GET['slug'] ?? '');
$post = $slug !== '' ? post_by_slug($slug) : null;
if (!$post) {
    http_response_code(404);
    include __DIR__ . '/404.php';
    exit;
}

$cover = media_url($post['cover_id']);
$base = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
$page = [
    'title' => $post['title'] . ' | Yarl Creators',
    'description' => $post['excerpt'] ?: mb_substr(strip_html($post['content']), 0, 160),
    'nav' => 'insights',
    'head' => '<meta property="og:type" content="article">'
        . '<meta property="og:title" content="' . e($post['title']) . '">'
        . '<meta property="og:description" content="' . e($post['excerpt']) . '">'
        . ($cover ? '<meta property="og:image" content="' . e($base . $cover) . '">' : ''),
];
$back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>';
$more = more_posts((int) $post['id']);
include __DIR__ . '/includes/header.php';
?>
<?php
$bannerImg = $cover ?: '/images/hero-studio.jpg';
$metaHtml = '<div class="ph-meta"><span class="tag">' . e($post['category'] ?: 'Insight') . '</span><span>' . e(nice_date($post['published_at'])) . ' · ' . (int) $post['reading_minutes'] . ' min read</span></div>';
echo str_replace('class="ph-banner"', 'class="ph-banner is-article"', page_banner('Article', $post['title'], '', $bannerImg, $metaHtml));
?>
<article id="article">
  <div class="wrap">
    <?php if ($cover): ?><figure class="art-cover"><img src="<?= e($cover) ?>" alt="<?= e($post['title']) ?>"></figure><?php endif; ?>
    <?php if ($post['excerpt']): ?><p class="article-lede"><?= e($post['excerpt']) ?></p><?php endif; ?>
    <div class="prose"><?= $post['content'] /* sanitised when saved in the admin */ ?></div>
    <div class="art-foot"><a class="back" href="/insights"><?= $back ?>All insights</a><a class="btn" href="/contact">Start a project</a></div>
  </div>
</article>
<?php if ($more): ?>
<section id="more-posts">
  <div class="wrap">
    <div class="sh"><span class="eyebrow">Keep reading</span><h2>More <em>stories</em></h2></div>
    <div class="work-grid" id="more-grid"><?php foreach ($more as $p) echo post_card($p); ?></div>
  </div>
</section>
<?php endif; ?>

<?php include __DIR__ . '/includes/footer.php'; ?>
