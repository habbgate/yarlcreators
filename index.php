<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/content.php';

$page = [
    'title' => 'Yarl Creators | Media production company in Jaffna, Sri Lanka',
    'description' => 'Yarl Creators is a full-service media production company in Jaffna, Sri Lanka: brand films, commercial photography, event coverage, design and social media for growing businesses.',
    'nav' => 'home',
    'body' => 'home',
    'cta_title' => 'Let’s tell your <em>story</em>',
    'cta_text' => 'Tell us about your project. We will come back with ideas, a timeline and a quote.',
];
include __DIR__ . '/includes/header.php';
?>
<section class="fr-hero">
  <img class="fr-bg" src="/images/hero-desk.jpg" alt="A production desk with a laptop edit, storyboards, Jaffna prints, colour swatches and a camera" width="1672" height="941" fetchpriority="high">
  <div class="wrap fr-copy">
    <h1>Stories that move <em>brands</em> forward.</h1>
    <p>One studio in Jaffna for brand films, commercial photography, design and social content.</p>
    <a class="fr-btn" href="/contact">Start a project <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg></span></a>
  </div>
</section>

<section class="ticker-sec">
  <div class="ticker" aria-hidden="true"><div class="ticker-track">
    <?php for ($i = 0; $i < 2; $i++): ?><div class="ticker-set"><span>Brand films</span><b>✦</b><span>Photography</span><b>✦</b><span>Event coverage</span><b>✦</b><span>Design</span><b>✦</b><span>Social media</span><b>✦</b><span>Workshops</span><b>✦</b></div><?php endfor; ?>
  </div></div>
</section>

<?php include __DIR__ . '/includes/logos.php'; ?>

<section class="panel-sec">
  <div class="panel on-dark">
    <div class="wrap">
      <div class="intro">
        <div><span class="eyebrow">Who we are</span><div class="intro-ph reveal" style="margin-top:28px"><img src="/images/2025/09/545005084_776640355131987_8880665081703902771_n.jpg" alt="A Yarl Creators videographer filming an event" loading="lazy"></div></div>
        <div><p class="statement reveal">Yarl Creators is a full-service production team from Jaffna. <span class="dim">We plan, shoot, edit and design under one roof, for small enterprises and established companies at home and abroad.</span></p>
        <a class="btn" href="/about">About the studio <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a></div>
      </div>
      <div class="stats">
        <div class="stat reveal"><strong>2022</strong><span>Founded in Jaffna</span></div>
        <div class="stat reveal"><strong>20<sup>+</sup></strong><span>Businesses served</span></div>
        <div class="stat reveal"><strong>10<sup>+</sup></strong><span>Projects completed</span></div>
        <div class="stat reveal"><strong>6<sup>+</sup></strong><span>Countries with clients</span></div>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap svc-split">
    <div class="left">
      <span class="eyebrow">Our services</span>
      <h2>Everything your brand needs to be <em>seen</em></h2>
      <p>Creative, production and post-production under one roof, so a single brief becomes films, photographs and posts that belong together.</p>
      <a class="btn outline" href="/services">All services <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a>
    </div>
    <ol class="svc-list">
      <li><a class="srow reveal" href="/services#storytelling"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg></span><div><h3>Creative storytelling</h3><p>Documentaries, short-form video and commercial advertisements that give a brand its voice.</p></div><img src="/images/2025/08/540882654_768292029300153_6998871547980025643_n.jpg" alt="" loading="lazy"></a></li>
      <li><a class="srow reveal" href="/services#visual-content"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></span><div><h3>Visual content</h3><p>Commercial photography, videography and editing for products, people and events.</p></div><img src="/images/2025/08/vwevwewew.jpg" alt="" loading="lazy"></a></li>
      <li><a class="srow reveal" href="/services#digital-presence"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg></span><div><h3>Digital presence</h3><p>Custom websites and social media management that keep your audience engaged.</p></div><img src="/images/2025/08/1245.jpg" alt="" loading="lazy"></a></li>
      <li><a class="srow reveal" href="/services#design"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></span><div><h3>Design and branding</h3><p>Graphic design and branding materials, from identity to print.</p></div><img src="/images/2025/08/12111.jpg" alt="" loading="lazy"></a></li>
      <li><a class="srow reveal" href="/services#workshops"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><div><h3>Workshops and partnerships</h3><p>Hands-on workshops and production partnerships for aspiring creators.</p></div><img src="/images/2025/08/1425.jpg" alt="" loading="lazy"></a></li>
    </ol>
  </div>
</section>

<section class="alt">
  <div class="wrap">
    <div class="sh-row"><div><span class="eyebrow">Selected work</span><h2>Recent <em>productions</em></h2></div><p>Event coverage, commercials, brand films and workshops. These are the posts featured from the dashboard.</p></div>
    <div class="work-grid stagger" id="featured-posts"><?php foreach (home_posts() as $p) echo post_card($p); ?></div>
    <div class="center-btn"><a class="btn outline" href="/insights">View all work <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a></div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sh"><span class="eyebrow">How we work</span><h2>A clear process from brief to <em>delivery</em></h2><p>The same four stages, whether it is a single photo day or a month of content.</p></div>
    <div class="proc reveal">
      <div class="pstep"><div class="n">01</div><h3>Brief</h3><p>We learn what the business does, who it speaks to and what the work needs to achieve.</p></div>
      <div class="pstep"><div class="n">02</div><h3>Plan</h3><p>Concept, script or shot list, locations and a schedule you approve before filming.</p></div>
      <div class="pstep"><div class="n">03</div><h3>Produce</h3><p>Our crew shoots photo and video on location or in studio, lit for the brand.</p></div>
      <div class="pstep"><div class="n">04</div><h3>Deliver</h3><p>Editing, colour and sound, then files prepared for each platform, with revisions.</p></div>
    </div>
  </div>
</section>


<section>
  <div class="wrap">
    <div class="sh"><span class="eyebrow">Testimonials</span><h2>What our clients <em>say</em></h2></div>
    <div class="voice-wrap">
      <div class="qm" aria-hidden="true">“</div>
      <div class="voices">
        <figure class="voice on" aria-hidden="false"><p>Fast, professional and creative. Our brand video turned out better than we imagined.</p><figcaption><span class="av">S</span><span><b>Suthanthi</b><small>Digital marketing</small></span></figcaption></figure>
        <figure class="voice" aria-hidden="true"><p>The workshop was practical and inspiring. The team shares real production knowledge.</p><figcaption><span class="av">S</span><span><b>Sivakumar</b><small>Workshop participant</small></span></figcaption></figure>
        <figure class="voice" aria-hidden="true"><p>Reliable partners for our social media content from start to finish.</p><figcaption><span class="av">S</span><span><b>Selvan</b><small>Social media client</small></span></figcaption></figure>
        <figure class="voice" aria-hidden="true"><p>Excellent photography and video work. Highly recommended.</p><figcaption><span class="av">G</span><span><b>Gopinath</b><small>Photography and video</small></span></figcaption></figure>
        <figure class="voice" aria-hidden="true"><p>Our social media content has never looked this good.</p><figcaption><span class="av">K</span><span><b>Karthik</b><small>Social media content</small></span></figcaption></figure>
        <figure class="voice" aria-hidden="true"><p>Great team to work with, from concept to final delivery.</p><figcaption><span class="av">P</span><span><b>Prince</b><small>Client</small></span></figcaption></figure>
      </div>
      <div class="voice-nav">
        <button class="round" data-voice="-1" aria-label="Previous testimonial"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg></button>
        <div class="dots"><button class="on" data-dot="0" aria-label="Testimonial 1"></button><button class="" data-dot="1" aria-label="Testimonial 2"></button><button class="" data-dot="2" aria-label="Testimonial 3"></button><button class="" data-dot="3" aria-label="Testimonial 4"></button><button class="" data-dot="4" aria-label="Testimonial 5"></button><button class="" data-dot="5" aria-label="Testimonial 6"></button></div>
        <button class="round" data-voice="1" aria-label="Next testimonial"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
      </div>
    </div>
  </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
