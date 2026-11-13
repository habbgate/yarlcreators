<?php
// Scrolling client logo strip. Logos are managed in the admin dashboard.
$logos = visible_logos(); if ($logos): $reps = max(1, (int) ceil(10 / count($logos)));
?>
<div class="trust">
  <p>Trusted by businesses and institutions in Sri Lanka and abroad</p>
  <div class="marquee" aria-label="Client logos">
    <div class="marquee-track">
      <?php for ($half = 0; $half < 2; $half++): ?><div class="marquee-set"<?= $half ? ' aria-hidden="true"' : '' ?>><?php for ($r = 0; $r < $reps; $r++) foreach ($logos as $l) echo '<img src="' . e($l['url']) . '" alt="' . ($half ? '' : e($l['name'] ?: 'Client logo')) . '" loading="lazy">'; ?></div><?php endfor; ?>
    </div>
  </div>
</div>
<?php endif; ?>
