<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/content.php';

$page = [
    'title' => 'Insights | Yarl Creators',
    'description' => 'Production stories, event coverage and notes on brand storytelling from the Yarl Creators studio.',
    'nav' => 'insights',
    'cta_title' => 'Let’s tell your <em>story</em>',
    'cta_text' => 'Tell us about your project. We will come back with ideas, a timeline and a quote.',
];
include __DIR__ . '/includes/header.php';
?>
<?= page_banner('Insights', 'Insights', 'Recent productions, events and brand stories from our <em>studio</em>.', '/images/hero-main.jpg') ?>
<section class="ins-sec">
  <div class="wrap">
    <?php
    $posts = published_posts(60);
    $cats = array_values(array_unique(array_filter(array_column($posts, 'category'))));
    ?>
    <?php if (count($cats) > 1): ?>
    <div class="filters" id="post-filters" role="toolbar" aria-label="Filter by category">
      <button class="chip-btn" aria-pressed="true" data-cat="">All posts</button>
      <?php foreach ($cats as $c): ?><button class="chip-btn" aria-pressed="false" data-cat="<?= e($c) ?>"><?= e($c) ?></button><?php endforeach; ?>
    </div>
    <?php endif; ?>
    <div class="work-grid" id="post-grid" aria-live="polite">
      <?php foreach ($posts as $p) echo post_card($p); ?>
      <?php if (!$posts): ?><div class="empty">No posts yet</div><?php endif; ?>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
