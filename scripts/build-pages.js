// Generates the static public pages in /public from shared header, footer and content.
// Run with: node scripts/build-pages.js
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'public');

const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  arrow: svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
  arrowUR: svg('<path d="M7 17 17 7"/><path d="M7 7h10v10"/>'),
  menu: svg('<path d="M4 9h16M4 15h16"/>'),
  x: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
};
const SOCIAL = {
  Facebook: 'https://web.facebook.com/profile.php?id=100083580871638',
  Instagram: 'https://www.instagram.com/yarl_creators',
  YouTube: 'https://www.youtube.com/@Yarlinyathrikal',
};

const services = [
  { id: 'storytelling', n: '01', name: 'Creative storytelling', short: 'Documentaries, short-form video and commercial advertisements that give a brand its voice.', img: '/images/2025/08/540882654_768292029300153_6998871547980025643_n.jpg',
    long: 'Brand narratives told on film. We plan, shoot and edit documentaries, short-form video and commercial advertisements, so a business can explain who it is in a way people remember.',
    ticks: ['Brand narratives and documentaries', 'Short-form video for social platforms', 'Commercial advertisements'] },
  { id: 'visual-content', n: '02', name: 'Visual content', short: 'Commercial photography, videography and professional video editing.', img: '/images/2025/08/vwevwewew.jpg',
    long: 'Commercial photography and videography, followed by professional editing. Product shoots, corporate events and hospitality spaces, lit and framed for the brand.',
    ticks: ['Commercial photography', 'Videography and event coverage', 'Video editing and colour grading'] },
  { id: 'digital-presence', n: '03', name: 'Digital presence', short: 'Custom websites and social media management that keep an audience engaged.', img: '/images/2025/08/1245.jpg',
    long: 'A place for your work to live and a steady rhythm of posts. We build custom websites and manage social media so the content we make keeps working after the shoot.',
    ticks: ['Custom website development', 'Social media management', 'Content calendars and publishing'] },
  { id: 'design', n: '04', name: 'Design', short: 'Graphic design and branding materials, from identity to print.', img: '/images/2025/08/12111.jpg',
    long: 'Graphic design and branding materials that match the films and photographs, so every touchpoint of a brand looks like it came from the same place.',
    ticks: ['Brand identity and guidelines', 'Campaign key visuals', 'Print and digital design'] },
  { id: 'workshops', n: '05', name: 'Workshops', short: 'Hands-on workshops and partnerships for aspiring creators.', img: '/images/2025/08/1425.jpg',
    long: 'Hands-on workshops in photography, content creation and branding, including the Wildlife Photography Workshop with the University of Jaffna, and partnerships that open larger productions to regional talent.',
    ticks: ['Photography and content workshops', 'University and institution programmes', 'Production partnerships'] },
];
const logos = ['Untitled-2-2', 'Untitled-3', 'Untitled-4', 'Untitled-5', 'Untitled-6', 'Untitled-8', 'Untitled-9', 'Untitled-78', 'Untitled-457'];

function head(title, desc, bodyClass = '') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#f2f0eb">
<link rel="icon" type="image/png" href="/images/2026/02/4-1.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>`;
}

function header(active, over) {
  const links = [['/', 'Home', 'home'], ['/about', 'About', 'about'], ['/services', 'Services', 'services'], ['/insights', 'Insights', 'insights'], ['/contact', 'Contact', 'contact']];
  const nav = links.map(([h, l, k]) => `<a href="${h}"${active === k ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `
<a class="sr-only" href="#main">Skip to content</a>
<header class="site-header${over ? ' over' : ' solid'}">
  <div class="wrap">
    <a class="brand" href="/" aria-label="Yarl Creators home"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">Yarl Creators</span></a>
    <nav class="nav" aria-label="Main">${nav}</nav>
    <div class="head-cta">
      <a class="btn sm" href="/contact"><span>Start a project</span></a>
      <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="menu-sheet">${I.menu}</button>
    </div>
  </div>
</header>
<div class="menu-sheet" id="menu-sheet" aria-hidden="true">
  <div class="top"><span class="brand"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">Yarl Creators</span></span><button class="menu-btn menu-close" style="display:inline-flex" aria-label="Close menu">${I.x}</button></div>
  <nav aria-label="Mobile">${nav}</nav>
  <div class="foot"><a href="mailto:yarlcreators0@gmail.com">yarlcreators0@gmail.com</a><a href="tel:+94761981178">+94 76 198 1178</a></div>
</div>
<main id="main">`;
}

const closing = (line = 'Have a project in mind?') => `
<section class="dark closing" aria-label="Contact">
  <div class="wrap">
    <div class="closing-row"><span class="idx">Contact</span><p class="muted" style="max-width:30rem">${line} Tell us what you are planning and who it is for, and we will get back to you.</p></div>
    <a class="big" href="/contact">Let’s talk ${I.arrowUR}</a>
    <div class="contact-cols">
      <div><h4>Email</h4><a href="mailto:yarlcreators0@gmail.com">yarlcreators0@gmail.com</a></div>
      <div><h4>Phone</h4><a href="tel:+94761981178">+94 76 198 1178</a><a href="tel:+94763320012">+94 76 332 0012</a></div>
      <div><h4>Studio</h4><p>Manipay - Kaithady Road,<br>Urumpirai North 40000, Sri Lanka</p></div>
    </div>
  </div>
</section>`;

const footer = `
</main>
<footer class="site-footer dark">
  <div class="wrap">
    <p class="wordmark" aria-hidden="true">Yarl Creators</p>
    <div class="foot-bar">
      <span>© <span id="year">2026</span> Yarl Creators, Jaffna</span>
      <nav aria-label="Footer"><a href="/about">About</a><a href="/services">Services</a><a href="/insights">Insights</a><a href="/contact">Contact</a></nav>
      <nav aria-label="Social">${Object.entries(SOCIAL).map(([k, v]) => `<a href="${v}" rel="noopener">${k}</a>`).join('')}</nav>
    </div>
  </div>
</footer>
<div class="cursor-preview" aria-hidden="true"><img alt=""></div>
<script src="/js/main.js"></script>
</body>
</html>
`;

const marquee = `<div class="marquee" aria-label="Client logos"><div class="marquee-track">${[...logos, ...logos].map((l, i) => `<img src="/images/2025/08/${l}.png" alt="${i < logos.length ? 'Client logo' : ''}"${i >= logos.length ? ' aria-hidden="true"' : ''} loading="lazy">`).join('')}</div></div>`;

const pages = {};

pages['index.html'] = head('Yarl Creators | Video, photography and design studio in Jaffna', 'Yarl Creators is a media production studio in Jaffna, Sri Lanka: brand films, commercial photography, event coverage, design and social media for growing businesses.', 'home') + header('home', true) + `
<section class="hero">
  <img class="hero-img" src="/images/2025/08/rhrthrthrthr.jpg" alt="A Yarl Creators camera operator filming an event on a gimbal" width="1920" height="1080" fetchpriority="high">
  <div class="wrap">
    <div class="hero-copy">
      <span class="idx light">Production studio · Jaffna, since 2022</span>
      <h1 class="display">Film, photography and design for growing brands</h1>
      <p class="hero-lede">A full-service production team making brand films, commercial photography, design and social content for businesses at home and abroad.</p>
      <div class="hero-actions">
        <a class="btn light" href="/contact">Start a project ${I.arrow}</a>
        <a class="btn ghost-light" href="/insights">See our work</a>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="intro">
      <span class="idx">Studio</span>
      <div>
        <div class="story-split"><p class="statement reveal">Yarl Creators is a production team from Jaffna, planning, shooting, editing and designing under one roof.</p>
        <div><p class="lede reveal" style="margin-bottom:32px">We work for small enterprises and established companies, at home and abroad, and stay with a project from the first idea to the final cut.</p><a class="tlink" href="/about">About the studio ${I.arrow}</a></div></div>
      </div>
    </div>
    <div class="figures">
      <div class="figure reveal"><strong>2022</strong><span>Founded in Jaffna</span></div>
      <div class="figure reveal"><strong>20+</strong><span>Businesses served</span></div>
      <div class="figure reveal"><strong>10+</strong><span>Projects completed</span></div>
      <div class="figure reveal"><strong>6+</strong><span>Countries with clients</span></div>
    </div>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-row"><span class="idx">Selected work</span><div class="right"><h2 class="h2">Recent productions</h2><a class="tlink" href="/insights">All insights ${I.arrow}</a></div></div>
    <div class="work" id="featured-posts" aria-live="polite">
      <div class="work-card"><div class="skeleton" style="aspect-ratio:4/3"></div></div>
      <div class="work-card"><div class="skeleton" style="aspect-ratio:4/5"></div></div>
    </div>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-row"><span class="idx">Services</span><div class="right"><h2 class="h2">What we make</h2><a class="tlink" href="/services">All services ${I.arrow}</a></div></div>
    <ol class="svc-rows">
      ${services.map((s) => `<li><a class="svc-row" href="/services#${s.id}" data-preview="${s.img}"><span class="n">${s.n}</span><div class="body"><h3>${s.name}</h3><p>${s.short}</p><span class="arr">${I.arrow}</span></div></a></li>`).join('\n      ')}
    </ol>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap"><div class="sec-row"><span class="idx">Clients</span><div class="right"><h2 class="h2">Trusted by</h2><p>Businesses, institutions and community organisations, with clients in more than six countries.</p></div></div></div>
  ${marquee}
</section>

<section class="dark">
  <div class="wrap">
    <div class="voices">
      <span class="idx">Client words</span>
      <div>
        <p class="voice-lead reveal">“Fast, professional and creative. Our brand video turned out better than we imagined.”</p>
        <p class="voice-by"><b>Suthanthi</b> &nbsp;Digital marketing</p>
      </div>
    </div>
    <div class="voice-list">
      <blockquote class="reveal"><p>The workshop was practical and inspiring. The team shares real production knowledge.</p><p class="voice-by"><b>Sivakumar</b> &nbsp;Workshop participant</p></blockquote>
      <blockquote class="reveal"><p>Reliable partners for our social media content from start to finish.</p><p class="voice-by"><b>Selvan</b> &nbsp;Social media client</p></blockquote>
      <blockquote class="reveal"><p>Excellent photography and video work. Highly recommended.</p><p class="voice-by"><b>Gopinath</b> &nbsp;Photography and video</p></blockquote>
    </div>
  </div>
</section>
${closing()}
` + footer;

pages['about.html'] = head('About | Yarl Creators', 'Yarl Creators is a media production company founded in 2022 in Jaffna, making brand films, photography, design and social media for businesses.') + header('about') + `
<section class="page-hero">
  <div class="wrap">
    <span class="idx">About</span>
    <div><h1 class="h1">A production team from Jaffna, working for brands everywhere</h1><p class="lede">We help businesses tell their stories through film, photography and design, and carry them to audiences at home and abroad.</p></div>
  </div>
</section>
<figure class="bleed">
  <img src="/images/2026/02/ycgp-1-scaled.jpg" alt="The Yarl Creators crew in maroon uniforms with camera gear at an event for the Consulate General of India in Jaffna" width="2560" height="1707">
  <figcaption class="mono">The crew on assignment for the Consulate General of India, Jaffna</figcaption>
</figure>
<section>
  <div class="wrap intro">
    <span class="idx">Story</span>
    <div>
      <div class="story-split" style="margin-bottom:96px"><p class="statement reveal">Founded in Jaffna in 2022, we make the films, photographs and designs that help local brands stand out.</p>
      <p class="lede reveal">Brand storytelling, commercial advertisements, documentaries, short-form video, digital design and social media management, for small enterprises and established companies.</p></div>
      <div class="principles">
        <div class="reveal"><div class="n">01</div><h3>One team, start to finish</h3><p>Concept, shoot, edit and delivery stay with the same people, so nothing gets lost between stages.</p></div>
        <div class="reveal"><div class="n">02</div><h3>Made for the brand</h3><p>Lighting, framing and edit are planned around the client’s identity, not a house style.</p></div>
        <div class="reveal"><div class="n">03</div><h3>Local roots, wide reach</h3><p>We know Jaffna and the North, and deliver work that reads just as well for audiences abroad.</p></div>
      </div>
    </div>
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-row"><span class="idx">Team</span><div class="right"><h2 class="h2">The people behind the camera</h2><a class="tlink" href="/contact?service=Joining+the+team">Join the team ${I.arrow}</a></div></div>
    <div class="team-grid" id="team-grid" aria-live="polite"></div>
  </div>
</section>
${closing('Want to work with the team?')}
` + footer;

pages['services.html'] = head('Services | Yarl Creators', 'Creative storytelling, visual content, digital presence, design and workshops from Yarl Creators in Jaffna.') + header('services') + `
<section class="page-hero">
  <div class="wrap">
    <span class="idx">Services</span>
    <div><h1 class="h1">Storytelling and visual content, made under one roof</h1><p class="lede">From a single commercial to an ongoing digital presence, we handle the creative and the production, so you deal with one team.</p></div>
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap">
    ${services.map((s) => `<div class="svc-block" id="${s.id}">
      <div class="inner">
        <div class="text reveal"><span class="idx">${s.n} / 05</span><h2 class="h2">${s.name}</h2><p>${s.long}</p>
          <ul class="ticks">${s.ticks.map((t, i) => `<li data-n="0${i + 1}">${t}</li>`).join('')}</ul>
          <a class="tlink" href="/contact?service=${encodeURIComponent(s.name)}">Ask about ${s.name.toLowerCase()} ${I.arrow}</a>
        </div>
        <img class="reveal" src="${s.img}" alt="" loading="lazy">
      </div>
    </div>`).join('\n    ')}
  </div>
</section>
<section class="dark">
  <div class="wrap">
    <div class="sec-row"><span class="idx">Process</span><div class="right"><h2 class="h2">How a project runs</h2><p class="muted">The same four stages, whether it is a single photo day or a month of content.</p></div></div>
    <div class="steps">
      <div class="step reveal"><div class="n">01</div><h3>Brief</h3><p>We learn what the business does, who it speaks to and what the work needs to achieve.</p></div>
      <div class="step reveal"><div class="n">02</div><h3>Plan</h3><p>Concept, script or shot list, locations and a schedule you sign off before anything is filmed.</p></div>
      <div class="step reveal"><div class="n">03</div><h3>Produce</h3><p>Our crew shoots photo and video on location or in studio, lit and framed for the brand.</p></div>
      <div class="step reveal"><div class="n">04</div><h3>Deliver</h3><p>Editing, colour and sound, then files cut for each platform, with a round of revisions.</p></div>
    </div>
    <div class="voice-list">
      <blockquote class="reveal"><p>Great team to work with, from concept to final delivery.</p><p class="voice-by"><b>Prince</b> &nbsp;Client</p></blockquote>
      <blockquote class="reveal"><p>Excellent photography and video work. Highly recommended.</p><p class="voice-by"><b>Gopinath</b> &nbsp;Photography and video</p></blockquote>
      <blockquote class="reveal"><p>Our social media content has never looked this good.</p><p class="voice-by"><b>Karthik</b> &nbsp;Social media content</p></blockquote>
    </div>
  </div>
</section>
<section>
  <div class="wrap"><div class="sec-row"><span class="idx">Clients</span><div class="right"><h2 class="h2">Trusted by</h2></div></div></div>
  ${marquee}
</section>
` + footer;

pages['insights.html'] = head('Insights | Yarl Creators', 'Production stories, event coverage and notes on brand storytelling from the Yarl Creators studio.') + header('insights') + `
<section class="page-hero">
  <div class="wrap">
    <span class="idx">Insights</span>
    <div><h1 class="h1">Notes from the set and the edit</h1><p class="lede">Recent productions, events and brand stories from our studio.</p></div>
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap">
    <div class="filters" id="post-filters" role="toolbar" aria-label="Filter by category"></div>
    <div class="post-grid" id="post-grid" aria-live="polite"><div class="skeleton" style="grid-column:1/-1;aspect-ratio:16/7"></div></div>
  </div>
</section>
` + footer;

pages['post.html'] = head('Insights | Yarl Creators', 'An insight from the Yarl Creators studio.') + header('insights') + `
<article id="article" aria-live="polite"><div class="wrap"><div class="article-head"><span></span><div class="skeleton" style="height:160px"></div></div></div></article>
<section id="more-posts" hidden>
  <div class="wrap">
    <div class="sec-row"><span class="idx">Keep reading</span><div class="right"><h2 class="h2">More insights</h2><a class="tlink" href="/insights">All insights ${I.arrow}</a></div></div>
    <div class="post-grid" id="more-grid"></div>
  </div>
</section>
` + footer;

pages['contact.html'] = head('Contact | Yarl Creators', 'Contact Yarl Creators in Jaffna, Sri Lanka, about video, photography, design or social media projects.') + header('contact') + `
<section class="page-hero">
  <div class="wrap">
    <span class="idx">Contact</span>
    <div><h1 class="h1">Tell us what you are making</h1><p class="lede">Send a short brief and we will get back to you. Prefer to talk? Call us directly.</p></div>
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap contact-layout">
    <aside class="contact-side">
      <div><h4>Email</h4><a href="mailto:yarlcreators0@gmail.com">yarlcreators0@gmail.com</a></div>
      <div><h4>Phone</h4><a href="tel:+94761981178">+94 76 198 1178</a><a href="tel:+94763320012">+94 76 332 0012</a></div>
      <div><h4>Studio</h4><p>Manipay - Kaithady Road,<br>Urumpirai North 40000, Sri Lanka</p></div>
      <div><h4>Follow</h4>${Object.entries(SOCIAL).map(([k, v]) => `<a href="${v}" rel="noopener">${k}</a>`).join('')}</div>
    </aside>
    <form class="form" id="contact-form" novalidate>
      <div class="field"><label for="f-name">Name *</label><input id="f-name" name="name" autocomplete="name" placeholder="Your name" required><span class="err" aria-live="polite"></span></div>
      <div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required><span class="err" aria-live="polite"></span></div>
      <div class="field"><label for="f-phone">Phone *</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="+94" required><span class="err" aria-live="polite"></span></div>
      <div class="field"><label for="f-service">Service</label><select id="f-service" name="service"><option value="">Choose one</option>${services.map((s) => `<option>${s.name}</option>`).join('')}<option>Joining the team</option><option>Something else</option></select></div>
      <div class="field full"><label for="f-msg">Project details</label><textarea id="f-msg" name="message" placeholder="What are you planning, and when?"></textarea></div>
      <label class="hp" aria-hidden="true">Leave empty<input name="company_site" tabindex="-1" autocomplete="off"></label>
      <div class="form-foot"><button class="btn" type="submit">Send enquiry ${I.arrow}</button><p id="form-status" class="form-status" role="status"></p></div>
    </form>
  </div>
</section>
` + footer;

pages['404.html'] = head('Page not found | Yarl Creators', 'Page not found.') + header('') + `
<section class="page-hero" style="min-height:60vh">
  <div class="wrap"><span class="idx">404</span><div><h1 class="h1">This page is not in the edit</h1><p class="lede" style="margin-bottom:40px">The link may be old or mistyped.</p><a class="btn" href="/">Back to home ${I.arrow}</a></div></div>
</section>
` + footer;

for (const [name, html] of Object.entries(pages)) {
  fs.writeFileSync(path.join(OUT, name), html);
  console.log('wrote', name);
}
