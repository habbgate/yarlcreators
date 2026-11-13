<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/content.php';

$page = [
    'title' => 'About us | Yarl Creators',
    'description' => 'Yarl Creators is a media production company founded in 2022 in Jaffna, making brand films, photography, design and social media for businesses.',
    'nav' => 'about',
    'cta_title' => 'Work with our <em>team</em>',
    'cta_text' => 'Tell us what you are planning and who it is for. We will come back with ideas, a timeline and a quote.',
];
include __DIR__ . '/includes/header.php';
?>
<?= page_banner('About us', 'About us', 'A production team from Jaffna, working for brands <em>everywhere</em>.', '/images/2026/02/ycgp-1-scaled.jpg') ?>
<section class="ab-intro">
  <div class="wrap ab-grid">
    <div class="ab-copy">
      <span class="eyebrow">Our story</span>
      <h2>We turn local stories into films, photographs and brands that <em>travel</em>.</h2>
      <p>Yarl Creators is a full-service media production company in Jaffna. Since 2022 we have made videography, photography, digital content and branding that helps businesses stand out in a competitive market.</p>
      <p>Our work spans brand storytelling, commercial advertisements, documentaries, short-form video, design and social media management, for clients from small enterprises to established companies.</p>
      <ul class="tags"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Brand films</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Documentaries</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Commercial photography</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Design and branding</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Social media</li></ul>
      <a class="btn" href="/services">Our services <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a>
    </div>
    <div class="ab-photos">
      <img class="p1" src="/images/2025/08/1425.jpg" alt="Yarl Creators workshop with students" loading="lazy">
      <img class="p2" src="/images/2025/08/vwevwewew.jpg" alt="Photographer with a camera" loading="lazy">
      <div class="badge" aria-hidden="true"><b>Since</b><strong>2022</strong><span>Jaffna · Sri Lanka</span></div>
    </div>
  </div>
</section>

<section class="ticker-sec">
  <div class="ticker" aria-hidden="true"><div class="ticker-track">
    <?php for ($i = 0; $i < 2; $i++): ?><div class="ticker-set"><span>Stories</span><b>✦</b><span>Craft</span><b>✦</b><span>Community</span><b>✦</b><span>Light</span><b>✦</b><span>Heritage</span><b>✦</b><span>Reach</span><b>✦</b></div><?php endfor; ?>
  </div></div>
</section>

<section class="ab-statsec">
  <div class="wrap">
    <div class="ab-stats on-dark">
      <div class="stat reveal"><strong>2022</strong><span>Founded in Jaffna</span></div>
      <div class="stat reveal"><strong>20<sup>+</sup></strong><span>Businesses served</span></div>
      <div class="stat reveal"><strong>10<sup>+</sup></strong><span>Projects completed</span></div>
      <div class="stat reveal"><strong>6<sup>+</sup></strong><span>Countries with clients</span></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sh"><span class="eyebrow">Our approach</span><h2>What clients can <em>expect</em></h2></div>
    <div class="ab-values">
      <div class="abv reveal"><b>01</b><h3>One team</h3><p>Concept, shoot, edit and delivery stay with the same people, so nothing gets lost between stages.</p></div>
      <div class="abv is-dark reveal"><b>02</b><h3>Made for you</h3><p>Lighting, framing and edit are planned around your brand identity, not a house style.</p></div>
      <div class="abv reveal"><b>03</b><h3>Wide reach</h3><p>We know Jaffna and the North, and deliver work that reads just as well for audiences abroad.</p></div>
    </div>
  </div>
</section>
<section class="ab-team">
  <div class="wrap">
    <div class="sh-row on-dark"><div><span class="eyebrow">Our team</span><h2>The people behind the <em>camera</em></h2></div><p>Production, direction, photography, editing, design and presenting, all in one crew. <a href="/contact?service=Joining+the+team">Join the team</a></p></div>
    <div class="tm-grid" id="team-grid">
      <?php foreach (visible_team() as $m): ?>
      <article class="tm reveal">
        <?php if ($m['photo_id']): ?><img src="<?= e(media_url($m['photo_id'])) ?>" alt="<?= e($m['name']) ?>" loading="lazy"><?php endif; ?>
        <div class="tm-info"><span class="role"><?= e($m['role']) ?></span><h3><?= e($m['name']) ?></h3><?php if (!empty($m['bio'])): ?><p><?= e($m['bio']) ?></p><?php endif; ?></div>
      </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
