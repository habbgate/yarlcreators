// Generates the static public pages in /public from shared header, footer and content.
// Run with: node scripts/build-pages.js
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'public');

const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  arrow: svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
  left: svg('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'),
  menu: svg('<path d="M4 8h16M4 16h16"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z"/></svg>',
  video: svg('<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>'),
  camera: svg('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'),
  monitor: svg('<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>'),
  pen: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
  users: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  mail: svg('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
  pin: svg('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'),
  layers: svg('<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>'),
  target: svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  globe: svg('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  fb: svg('<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'),
  ig: svg('<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>'),
  yt: svg('<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>'),
};
const YT = 'https://www.youtube.com/@Yarlinyathrikal';
const SOCIAL = [
  ['Facebook', 'https://web.facebook.com/profile.php?id=100083580871638', I.fb],
  ['Instagram', 'https://www.instagram.com/yarl_creators', I.ig],
  ['YouTube', YT, I.yt],
];
const socials = `<div class="socials">${SOCIAL.map(([n, u, ic]) => `<a href="${u}" rel="noopener" aria-label="${n}">${ic}</a>`).join('')}</div>`;
const arr = `<span class="arr">${I.arrow}</span>`;

const IMG = {
  crew: '/images/2025/09/541616347_768839202578769_5928788825476520921_n.jpg',
  event: '/images/2025/09/545005084_776640355131987_8880665081703902771_n.jpg',
  group: '/images/2026/02/ycgp-1-scaled.jpg',
  team: '/images/2025/09/WhatsApp-Image-2025-08-25-at-19.28.48_21117187-copy.jpg',
  stage: '/images/2026/02/DSC3635-scaled.jpg',
  photographer: '/images/2025/08/vwevwewew.jpg',
  tripod: '/images/2025/08/540882654_768292029300153_6998871547980025643_n.jpg',
};
const services = [
  { id: 'storytelling', name: 'Creative storytelling', icon: I.video, img: IMG.tripod,
    short: 'Documentaries, short-form video and commercial advertisements that give a brand its voice.',
    long: 'Brand narratives told on film. We plan, shoot and edit documentaries, short-form video and commercial advertisements, so a business can explain who it is in a way people remember.',
    ticks: ['Brand narratives and documentaries', 'Short-form video for social platforms', 'Commercial advertisements'] },
  { id: 'visual-content', name: 'Visual content', icon: I.camera, img: IMG.photographer,
    short: 'Commercial photography, videography and editing for products, people and events.',
    long: 'Commercial photography and videography, followed by professional editing. Product shoots, corporate events and hospitality spaces, lit and framed for the brand.',
    ticks: ['Commercial photography', 'Videography and event coverage', 'Video editing and colour grading'] },
  { id: 'digital-presence', name: 'Digital presence', icon: I.monitor, img: '/images/2025/08/1245.jpg',
    short: 'Custom websites and social media management that keep your audience engaged.',
    long: 'A place for your work to live and a steady rhythm of posts. We build custom websites and manage social media so the content we make keeps working after the shoot.',
    ticks: ['Custom website development', 'Social media management', 'Content calendars and publishing'] },
  { id: 'design', name: 'Design and branding', icon: I.pen, img: '/images/2025/08/12111.jpg',
    short: 'Graphic design and branding materials, from identity to print.',
    long: 'Graphic design and branding materials that match the films and photographs, so every touchpoint of a brand looks like it came from the same place.',
    ticks: ['Brand identity and guidelines', 'Campaign key visuals', 'Print and digital design'] },
  { id: 'workshops', name: 'Workshops and partnerships', icon: I.users, img: '/images/2025/08/1425.jpg',
    short: 'Hands-on workshops and production partnerships for aspiring creators.',
    long: 'Hands-on workshops in photography, content creation and branding, including the Wildlife Photography Workshop with the University of Jaffna, and partnerships that open larger productions to regional talent.',
    ticks: ['Photography and content workshops', 'University and institution programmes', 'Production partnerships'] },
];
const logos = ['Untitled-2-2', 'Untitled-3', 'Untitled-4', 'Untitled-5', 'Untitled-6', 'Untitled-8', 'Untitled-9', 'Untitled-78', 'Untitled-457'];
const voices = [
  ['Fast, professional and creative. Our brand video turned out better than we imagined.', 'Suthanthi', 'Digital marketing'],
  ['The workshop was practical and inspiring. The team shares real production knowledge.', 'Sivakumar', 'Workshop participant'],
  ['Reliable partners for our social media content from start to finish.', 'Selvan', 'Social media client'],
  ['Excellent photography and video work. Highly recommended.', 'Gopinath', 'Photography and video'],
  ['Our social media content has never looked this good.', 'Karthik', 'Social media content'],
  ['Great team to work with, from concept to final delivery.', 'Prince', 'Client'],
];

function head(title, desc) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#f7f5f2">
<link rel="icon" type="image/png" href="/images/2026/02/4-1.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body>`;
}

const brand = `<span class="brand-mark" aria-hidden="true"></span><span class="brand-name">Yarl Creators</span>`;
const LINKS = [['/', 'Home', 'home'], ['/about', 'About', 'about'], ['/services', 'Services', 'services'], ['/insights', 'Insights', 'insights'], ['/contact', 'Contact', 'contact']];
function header(active) {
  const nav = LINKS.map(([h, l, k]) => `<a href="${h}"${active === k ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `
<a class="sr-only" href="#main">Skip to content</a>
<header class="site-header">
  <div class="bar">
    <a class="brand" href="/" aria-label="Yarl Creators home">${brand}</a>
    <nav class="nav" aria-label="Main">${nav}</nav>
    <div class="head-cta">
      <a class="btn sm" href="/contact">Get a quote ${arr}</a>
      <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">${I.menu}</button>
    </div>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">${nav}<a class="btn" href="/contact">Get a quote ${arr}</a></nav>
</header>
<main id="main">`;
}

const footer = (title = 'Let’s tell your <em>story</em>', text = 'Tell us about your project. We will come back with ideas, a timeline and a quote.') => `
</main>
<footer class="site-footer on-dark">
  <div class="foot-cta">
    <div class="wrap">
      <span class="eyebrow">Start a project</span>
      <h2>${title}</h2>
      <p>${text}</p>
      <div class="actions"><a class="btn white" href="/contact">Start a project ${arr}</a><a class="btn ghost-light plain" href="tel:+94761981178">Call +94 76 198 1178</a></div>
    </div>
  </div>
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="/">${brand}</a>
        <p>A full-service media production company in Jaffna, Sri Lanka, making films, photographs and designs for growing businesses.</p>
        ${socials}
      </div>
      <div><h4>Company</h4><ul><li><a href="/about">About us</a></li><li><a href="/services">Services</a></li><li><a href="/insights">Insights</a></li><li><a href="/contact">Contact</a></li></ul></div>
      <div><h4>Services</h4><ul>${services.map((s) => `<li><a href="/services#${s.id}">${s.name}</a></li>`).join('')}</ul></div>
      <div><h4>Get in touch</h4><ul>
        <li><a class="contact-li" href="tel:+94761981178">${I.phone}<span>+94 76 198 1178<br>+94 76 332 0012</span></a></li>
        <li><a class="contact-li" href="mailto:yarlcreators0@gmail.com">${I.mail}<span>yarlcreators0@gmail.com</span></a></li>
        <li class="contact-li">${I.pin}<span>Manipay - Kaithady Road, Urumpirai North 40000, Sri Lanka</span></li>
      </ul></div>
    </div>
    <div class="foot-bottom"><span>© <span id="year">2026</span> Yarl Creators. All rights reserved.</span><span>Jaffna, Sri Lanka</span></div>
  </div>
</footer>
<script src="/js/main.js"></script>
</body>
</html>
`;

const pageHead = (crumb, title, lede, img) => `
<section class="page-head" style="padding-bottom:0">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>${crumb}</span></nav>
    <h1>${title}</h1>
    <p class="lede">${lede}</p>
  </div>
  ${img ? `<div class="ph-img"><img src="${img}" alt=""></div>` : ''}
</section>`;

const statsPanel = (statement) => `
<section class="panel-sec">
  <div class="panel on-dark">
    <div class="wrap">
      ${statement || ''}
      <div class="stats"${statement ? '' : ' style="margin-top:0;border-top:0"'}>
        <div class="stat reveal"><strong>2022</strong><span>Founded in Jaffna</span></div>
        <div class="stat reveal"><strong>20<sup>+</sup></strong><span>Businesses served</span></div>
        <div class="stat reveal"><strong>10<sup>+</sup></strong><span>Projects completed</span></div>
        <div class="stat reveal"><strong>6<sup>+</sup></strong><span>Countries with clients</span></div>
      </div>
    </div>
  </div>
</section>`;

const process = `<div class="proc reveal">
      <div class="pstep"><div class="n">01</div><h3>Brief</h3><p>We learn what the business does, who it speaks to and what the work needs to achieve.</p></div>
      <div class="pstep"><div class="n">02</div><h3>Plan</h3><p>Concept, script or shot list, locations and a schedule you approve before filming.</p></div>
      <div class="pstep"><div class="n">03</div><h3>Produce</h3><p>Our crew shoots photo and video on location or in studio, lit for the brand.</p></div>
      <div class="pstep"><div class="n">04</div><h3>Deliver</h3><p>Editing, colour and sound, then files prepared for each platform, with revisions.</p></div>
    </div>`;

const voiceBlock = (title = 'What our clients <em>say</em>') => `
<section>
  <div class="wrap">
    <div class="sh"><span class="eyebrow">Testimonials</span><h2>${title}</h2></div>
    <div class="voice-wrap">
      <div class="qm" aria-hidden="true">“</div>
      <div class="voices">
        ${voices.map(([t, n, r], i) => `<figure class="voice${i === 0 ? ' on' : ''}" aria-hidden="${i !== 0}"><p>${t}</p><figcaption><span class="av">${n[0]}</span><span><b>${n}</b><small>${r}</small></span></figcaption></figure>`).join('\n        ')}
      </div>
      <div class="voice-nav">
        <button class="round" data-voice="-1" aria-label="Previous testimonial">${I.left}</button>
        <div class="dots">${voices.map((_, i) => `<button class="${i === 0 ? 'on' : ''}" data-dot="${i}" aria-label="Testimonial ${i + 1}"></button>`).join('')}</div>
        <button class="round" data-voice="1" aria-label="Next testimonial">${I.arrow}</button>
      </div>
    </div>
  </div>
</section>`;

const tagsList = (items) => `<ul class="tags">${items.map((t) => `<li>${I.check}${t}</li>`).join('')}</ul>`;

const pages = {};

pages['index.html'] = head('Yarl Creators | Media production company in Jaffna, Sri Lanka', 'Yarl Creators is a full-service media production company in Jaffna, Sri Lanka: brand films, commercial photography, event coverage, design and social media for growing businesses.') + header('home') + `
<section class="hero" style="padding-bottom:0">
  <div class="wrap">
    <span class="pill"><b>Since 2022</b>Media production · Jaffna</span>
    <h1>Films, photography and design for <em>growing</em> brands</h1>
    <p class="lede">We help businesses tell their story through brand films, commercial photography, design and social media, from the first idea to the final cut.</p>
    <div class="hero-actions"><a class="btn" href="/contact">Start a project ${arr}</a><a class="btn outline" href="/insights">View our work ${arr}</a></div>
    <ul class="hero-facts" aria-label="At a glance"><li><strong>20+</strong> businesses</li><li><strong>10+</strong> projects</li><li><strong>6</strong> countries</li></ul>
  </div>
  <div class="strip">
    <div class="tile h-out c1"><img src="${IMG.stage}" alt="Stage performance filmed by Yarl Creators"></div>
    <div class="col c2"><div class="tile stat dark"><strong>20+</strong><span>Businesses served</span></div><div class="tile h-mid"><img src="${IMG.photographer}" alt="A Yarl Creators photographer with a camera"></div></div>
    <div class="tile h-main c3"><img src="${IMG.crew}" alt="The Yarl Creators crew filming an interview outdoors" fetchpriority="high"><a class="chip" href="${YT}" rel="noopener"><i>${I.play}</i>Watch our films</a></div>
    <div class="col c4"><div class="tile h-mid"><img src="${IMG.event}" alt="A Yarl Creators videographer filming an event"></div><div class="tile stat light"><strong>6+</strong><span>Countries with clients</span></div></div>
    <div class="tile h-out c5"><img src="${IMG.team}" alt="The Yarl Creators team"></div>
  </div>
</section>

<div class="trust">
  <div class="wrap"><p>Trusted by businesses and institutions in Sri Lanka and abroad</p>
    <div class="logo-row">${logos.map((l) => `<img src="/images/2025/08/${l}.png" alt="Client logo" loading="lazy">`).join('')}</div>
  </div>
</div>

${statsPanel(`<div class="intro">
        <div><span class="eyebrow">Who we are</span></div>
        <div><p class="statement reveal">Yarl Creators is a full-service production team from Jaffna. <span class="dim">We plan, shoot, edit and design under one roof, for small enterprises and established companies at home and abroad.</span></p>
        <a class="btn white" href="/about">About the studio ${arr}</a></div>
      </div>`)}

<section style="padding-top:0">
  <div class="wrap svc-split">
    <div class="left">
      <span class="eyebrow">Our services</span>
      <h2>Everything your brand needs to be <em>seen</em></h2>
      <p>Creative, production and post-production under one roof, so a single brief becomes films, photographs and posts that belong together.</p>
      <a class="btn outline" href="/services">All services ${arr}</a>
    </div>
    <ol class="svc-list">
      ${services.map((s) => `<li><a class="srow reveal" href="/services#${s.id}"><span class="ic">${s.icon}</span><div><h3>${s.name}</h3><p>${s.short}</p></div><img src="${s.img}" alt="" loading="lazy"></a></li>`).join('\n      ')}
    </ol>
  </div>
</section>

<section class="alt">
  <div class="wrap">
    <div class="sh-row"><div><span class="eyebrow">Selected work</span><h2>Recent <em>productions</em></h2></div><p>Event coverage, commercials, brand films and workshops. These are the posts featured from the dashboard.</p></div>
    <div class="work-grid stagger" id="featured-posts" aria-live="polite"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>
    <div class="center-btn"><a class="btn outline" href="/insights">View all work ${arr}</a></div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sh"><span class="eyebrow">How we work</span><h2>A clear process from brief to <em>delivery</em></h2><p>The same four stages, whether it is a single photo day or a month of content.</p></div>
    ${process}
  </div>
</section>

${voiceBlock()}
` + footer();

pages['about.html'] = head('About us | Yarl Creators', 'Yarl Creators is a media production company founded in 2022 in Jaffna, making brand films, photography, design and social media for businesses.') + header('about') +
  pageHead('About us', 'A production team from Jaffna, working for brands <em>everywhere</em>', 'We help businesses tell their stories through film, photography and design, and carry them to audiences at home and abroad.', IMG.group) + `
<section>
  <div class="wrap story">
    <div class="left"><span class="eyebrow">Our story</span><h2>Helping local brands stand out since <em>2022</em></h2></div>
    <div class="right reveal">
      <p>Yarl Creators is a full-service media production company dedicated to crafting visual stories for brands, businesses and organisations.</p>
      <p>Founded in Jaffna in 2022, we have built a reputation for high-quality videography, photography, digital content and branding that helps our clients stand out in a competitive market.</p>
      <p>Our work spans brand storytelling, commercial advertisements, documentaries, short-form video, digital design and social media management, for clients from small enterprises to established companies.</p>
      ${tagsList(['Brand films', 'Documentaries', 'Commercial photography', 'Design and branding', 'Social media'])}
      <a class="btn" href="/services">Our services ${arr}</a>
    </div>
  </div>
</section>
${statsPanel()}
<section style="padding-top:0">
  <div class="wrap">
    <div class="sh"><span class="eyebrow">Our approach</span><h2>What clients can <em>expect</em></h2></div>
    <div class="values">
      <div class="value reveal"><span class="ic">${I.layers}</span><h3>One team</h3><p>Concept, shoot, edit and delivery stay with the same people, so nothing gets lost between stages.</p></div>
      <div class="value reveal"><span class="ic">${I.target}</span><h3>Made for you</h3><p>Lighting, framing and edit are planned around your brand identity, not a house style.</p></div>
      <div class="value reveal"><span class="ic">${I.globe}</span><h3>Wide reach</h3><p>We know Jaffna and the North, and deliver work that reads just as well for audiences abroad.</p></div>
    </div>
  </div>
</section>
<section class="alt">
  <div class="wrap">
    <div class="sh-row"><div><span class="eyebrow">Our team</span><h2>The people behind the <em>camera</em></h2></div><p>Production, direction, photography, editing, design and presenting, all in one crew. <a href="/contact?service=Joining+the+team" style="color:var(--maroon)">Join the team</a></p></div>
    <div class="team-grid" id="team-grid" aria-live="polite"></div>
  </div>
</section>
` + footer('Work with our <em>team</em>', 'Tell us what you are planning and who it is for. We will come back with ideas, a timeline and a quote.');

pages['services.html'] = head('Services | Yarl Creators', 'Creative storytelling, visual content, digital presence, design and workshops from Yarl Creators in Jaffna.') + header('services') +
  pageHead('Services', 'Storytelling and visual content under <em>one roof</em>', 'From a single commercial to an ongoing digital presence, we handle the creative and the production, so you work with one team.') + `
<section style="padding-top:72px">
  <div class="wrap">
    ${services.map((s, i) => `<div class="svc-block reveal" id="${s.id}">
      <div class="media"><img src="${s.img}" alt="" loading="lazy"></div>
      <div class="text"><div class="n">0${i + 1}</div><h2>${s.name}</h2><p>${s.long}</p>
        ${tagsList(s.ticks)}
        <a class="btn" href="/contact?service=${encodeURIComponent(s.name)}">Ask about this service ${arr}</a>
      </div>
    </div>`).join('\n    ')}
  </div>
</section>
<section class="alt">
  <div class="wrap">
    <div class="sh"><span class="eyebrow">How we work</span><h2>A clear process from brief to <em>delivery</em></h2></div>
    ${process}
  </div>
</section>
${voiceBlock('Trusted by our <em>clients</em>')}
<div class="trust" style="padding:0"><div class="wrap"><p>Clients we have worked with</p><div class="logo-row">${logos.map((l) => `<img src="/images/2025/08/${l}.png" alt="Client logo" loading="lazy">`).join('')}</div></div></div>
` + footer('Have a project in <em>mind?</em>', 'Tell us about the business and what you need. We will suggest the right mix of services and a realistic timeline.');

pages['insights.html'] = head('Insights | Yarl Creators', 'Production stories, event coverage and notes on brand storytelling from the Yarl Creators studio.') + header('insights') +
  pageHead('Insights', 'Stories from our <em>productions</em>', 'Recent productions, events and brand stories from our studio.') + `
<section style="padding-top:56px">
  <div class="wrap">
    <div class="filters" id="post-filters" role="toolbar" aria-label="Filter by category"></div>
    <div class="work-grid" id="post-grid" aria-live="polite"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>
  </div>
</section>
` + footer();

pages['post.html'] = head('Insights | Yarl Creators', 'An insight from the Yarl Creators studio.') + header('insights') + `
<article id="article" aria-live="polite"><div class="wrap"><div class="article-head"><div class="skeleton" style="aspect-ratio:auto;min-height:200px"></div></div></div></article>
<section id="more-posts" hidden>
  <div class="wrap">
    <div class="sh"><span class="eyebrow">Keep reading</span><h2>More <em>stories</em></h2></div>
    <div class="work-grid" id="more-grid"></div>
  </div>
</section>
` + footer();

pages['contact.html'] = head('Contact | Yarl Creators', 'Contact Yarl Creators in Jaffna, Sri Lanka, about video, photography, design or social media projects.') + header('contact') +
  pageHead('Contact', 'Let’s talk about your <em>project</em>', 'Send us a short brief and we will get back to you. Prefer to talk? Call us directly.') + `
<section style="padding-top:64px">
  <div class="wrap contact-grid">
    <aside class="cpanel on-dark">
      <h2>Get in touch</h2>
      <p>We work with businesses across Sri Lanka and abroad.</p>
      <div class="citem"><span class="ic">${I.phone}</span><div><h4>Phone</h4><a href="tel:+94761981178">+94 76 198 1178</a><a href="tel:+94763320012">+94 76 332 0012</a></div></div>
      <div class="citem"><span class="ic">${I.mail}</span><div><h4>Email</h4><a href="mailto:yarlcreators0@gmail.com">yarlcreators0@gmail.com</a></div></div>
      <div class="citem"><span class="ic">${I.pin}</span><div><h4>Studio</h4><p>Manipay - Kaithady Road, Urumpirai North 40000, Sri Lanka</p></div></div>
      ${socials}
    </aside>
    <div class="form-card">
      <h2>Send us a message</h2>
      <p>Fields marked with <span style="color:var(--maroon)">*</span> are required.</p>
      <form class="form" id="contact-form" novalidate>
        <div class="field"><label for="f-name">Full name <span>*</span></label><input id="f-name" name="name" autocomplete="name" placeholder="Your name" required><span class="err" aria-live="polite"></span></div>
        <div class="field"><label for="f-email">Email <span>*</span></label><input id="f-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required><span class="err" aria-live="polite"></span></div>
        <div class="field"><label for="f-phone">Phone <span>*</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="+94 77 123 4567" required><span class="err" aria-live="polite"></span></div>
        <div class="field"><label for="f-service">Service</label><select id="f-service" name="service"><option value="">Choose a service</option>${services.map((s) => `<option>${s.name}</option>`).join('')}<option>Joining the team</option><option>Something else</option></select></div>
        <div class="field full"><label for="f-msg">Project details</label><textarea id="f-msg" name="message" placeholder="Tell us what you are planning, and when"></textarea></div>
        <label class="hp" aria-hidden="true">Leave empty<input name="company_site" tabindex="-1" autocomplete="off"></label>
        <div class="form-foot"><button class="btn" type="submit">Send message ${arr}</button><p id="form-status" class="form-status" role="status"></p></div>
      </form>
    </div>
  </div>
</section>
` + footer();

pages['404.html'] = head('Page not found | Yarl Creators', 'Page not found.') + header('') +
  pageHead('Not found', 'We could not find that <em>page</em>', 'The link may be old or mistyped.') + `
<section style="padding-top:48px;text-align:center"><div class="wrap"><a class="btn" href="/">Back to home ${arr}</a></div></section>
` + footer();

for (const [name, html] of Object.entries(pages)) {
  fs.writeFileSync(path.join(OUT, name), html);
  console.log('wrote', name);
}
