<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/content.php';

$page = [
    'title' => 'Services | Yarl Creators',
    'description' => 'Creative storytelling, visual content, digital presence, design and workshops from Yarl Creators in Jaffna.',
    'nav' => 'services',
    'cta_title' => 'Have a project in <em>mind?</em>',
    'cta_text' => 'Tell us about the business and what you need. We will suggest the right mix of services and a realistic timeline.',
];
include __DIR__ . '/includes/header.php';
?>
<?= page_banner('Services', 'Services', 'Storytelling and visual content under <em>one roof</em>.', '/images/covers/vintage-camera-moody.jpg') ?>
<section class="sv-intro">
  <div class="wrap">
    <p class="sv-lead">From the first idea to the final file, one crew <em>plans, shoots, edits and designs</em> everything your brand needs.</p>
    <nav class="sv-jump" aria-label="Jump to a service"><a href="#brand-story-documentaries"><b>01</b>Brand Story & Documentaries</a><a href="#commercial-advertisement"><b>02</b>Commercial Advertisement</a><a href="#short-form"><b>03</b>Short-form Content Creation</a><a href="#digital-marketing"><b>04</b>Digital Marketing</a><a href="#workshops"><b>05</b>Workshops and Partnerships</a></nav>
  </div>
</section>
<section class="sv-stack-sec">
  <div class="wrap sv-stack">
    <article class="sv-card t-light" id="brand-story-documentaries" style="--i:0">
      <div class="sv-media"><img src="/images/2025/08/540882654_768292029300153_6998871547980025643_n.jpg" alt="" loading="lazy"></div>
      <div class="sv-text"><span class="sv-n">01</span><h2>Brand Story & Documentaries</h2><p>Narratives that give your brand a voice, and cinematic documentaries shot and cut for screen. We shape the story, then film it.</p>
        <ul class="tags"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Brand story films</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Cinematic documentaries</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Interviews and narration</li></ul>
        <a class="btn" href="/contact?service=Brand%20Story%20%26%20Documentaries">Ask about this service <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a>
      </div>
    </article>
    <article class="sv-card t-dark" id="commercial-advertisement" style="--i:1">
      <div class="sv-media"><img src="/images/2025/08/vwevwewew.jpg" alt="" loading="lazy"></div>
      <div class="sv-text"><span class="sv-n">02</span><h2>Commercial Advertisement</h2><p>Ads crafted to showcase your products and services, from concept and script to the final cut.</p>
        <ul class="tags"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>TV and online commercials</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Product advertisements</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Campaign planning and shoot</li></ul>
        <a class="btn" href="/contact?service=Commercial%20Advertisement">Ask about this service <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a>
      </div>
    </article>
    <article class="sv-card t-rose" id="short-form" style="--i:2">
      <div class="sv-media"><img src="/images/2025/08/1245.jpg" alt="" loading="lazy"></div>
      <div class="sv-text"><span class="sv-n">03</span><h2>Short-form Content Creation</h2><p>Reels, shorts and social-first video, edited to hold attention in the first few seconds.</p>
        <ul class="tags"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Instagram Reels</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>TikTok and YouTube Shorts</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Social-first editing</li></ul>
        <a class="btn" href="/contact?service=Short-form%20Content%20Creation">Ask about this service <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a>
      </div>
    </article>
    <article class="sv-card t-dark" id="digital-marketing" style="--i:3">
      <div class="sv-media"><img src="/images/2025/08/12111.jpg" alt="" loading="lazy"></div>
      <div class="sv-text"><span class="sv-n">04</span><h2>Digital Marketing</h2><p>Campaigns that grow your reach through social media, influencers and graphic design.</p>
        <ul class="tags"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Social media campaigns</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Influencer campaigns</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Graphic designs</li></ul>
        <a class="btn" href="/contact?service=Digital%20Marketing">Ask about this service <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a>
      </div>
    </article>
    <article class="sv-card t-light" id="workshops" style="--i:4">
      <div class="sv-media"><img src="/images/2025/08/1425.jpg" alt="" loading="lazy"></div>
      <div class="sv-text"><span class="sv-n">05</span><h2>Workshops and Partnerships</h2><p>Hands-on workshops in photography, content creation and branding, and partnerships that open larger productions to regional talent.</p>
        <ul class="tags"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Photography and content workshops</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>University and institution programmes</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Production partnerships</li></ul>
        <a class="btn" href="/contact?service=Workshops%20and%20Partnerships">Ask about this service <span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span></a>
      </div>
    </article>
  </div>
</section>
<section class="sv-process">
  <div class="wrap">
    <div class="sh on-dark"><span class="eyebrow">How we work</span><h2>A clear process from brief to <em>delivery</em></h2></div>
    <div class="proc reveal">
      <div class="pstep"><div class="n">01</div><h3>Brief</h3><p>We learn what the business does, who it speaks to and what the work needs to achieve.</p></div>
      <div class="pstep"><div class="n">02</div><h3>Plan</h3><p>Concept, script or shot list, locations and a schedule you approve before filming.</p></div>
      <div class="pstep"><div class="n">03</div><h3>Produce</h3><p>Our crew shoots photo and video on location or in studio, lit for the brand.</p></div>
      <div class="pstep"><div class="n">04</div><h3>Deliver</h3><p>Editing, colour and sound, then files prepared for each platform, with revisions.</p></div>
    </div>
  </div>
</section>

<?= render_testimonials('Testimonials', 'Trusted by our <em>clients</em>') ?>
<?php include __DIR__ . '/includes/logos.php'; ?>

<?php include __DIR__ . '/includes/footer.php'; ?>
