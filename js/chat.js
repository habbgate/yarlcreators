/* Website chat assistant. Talks to /api/chat; the AI key never reaches the browser. */
(function () {
  var root = document.getElementById('chat');
  if (!root) return;
  var fab = document.getElementById('chat-fab'), panel = document.getElementById('chat-panel');
  var log = document.getElementById('chat-log'), form = document.getElementById('chat-form');
  var input = document.getElementById('chat-input'), chips = document.getElementById('chat-chips');
  var name = root.getAttribute('data-name') || 'Yazhi AI';
  var KEY = 'yc_chat_v1', history = [], busy = false;

  try { history = JSON.parse(sessionStorage.getItem(KEY) || '[]') || []; } catch (e) { history = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-20))); } catch (e) {} }

  // Turn plain text into safe DOM: line breaks, links to site pages, email and phone numbers.
  function render(text, el) {
    var re = /(\/(?:contact|services|about|insights)(?:\/[a-z0-9-]*)?|[\w.+-]+@[\w-]+\.[\w.-]+|\+?\d[\d\s]{8,}\d)/gi;
    text.split('\n').forEach(function (line, i) {
      if (i) el.appendChild(document.createElement('br'));
      var last = 0, m;
      re.lastIndex = 0;
      while ((m = re.exec(line))) {
        if (m.index > last) el.appendChild(document.createTextNode(line.slice(last, m.index)));
        var a = document.createElement('a'), t = m[0];
        if (t.charAt(0) === '/') a.href = t;
        else if (t.indexOf('@') > -1) a.href = 'mailto:' + t;
        else a.href = 'tel:' + t.replace(/\s+/g, '');
        a.textContent = t;
        el.appendChild(a);
        last = m.index + t.length;
      }
      if (last < line.length) el.appendChild(document.createTextNode(line.slice(last)));
    });
  }
  function bubble(role, text) {
    var d = document.createElement('div');
    d.className = 'chat-msg ' + (role === 'user' ? 'me' : 'bot');
    if (role !== 'user') {
      var av = document.createElement('img');
      av.className = 'chat-mini'; av.src = '/images/mascot/ai-avatar.webp'; av.alt = ''; av.width = 30; av.height = 30;
      d.appendChild(av);
    }
    var p = document.createElement('div');
    p.className = 'chat-bubble';
    if (role === 'user') p.textContent = text; else render(text, p);
    d.appendChild(p);
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function typing() {
    var d = document.createElement('div');
    d.className = 'chat-msg bot';
    d.innerHTML = '<img class="chat-mini" src="/images/mascot/ai-avatar.webp" alt="" width="30" height="30"><div class="chat-bubble chat-typing"><i></i><i></i><i></i></div>';
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function greet() {
    bubble('assistant', 'Hi, I am ' + name + ', the Yarl Creators digital helper. Ask me about our films, photography, design and social media services, or tell me about your project.');
  }
  function restore() {
    log.innerHTML = '';
    if (!history.length) return greet();
    history.forEach(function (m) { bubble(m.role, m.content); });
    chips.hidden = true;
  }

  function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    busy = true;
    chips.hidden = true;
    bubble('user', text);
    history.push({ role: 'user', content: text });
    save();
    input.value = '';
    var t = typing();
    fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-10) }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        t.remove();
        if (!res.ok || !res.j.reply) throw new Error((res.j && res.j.error) || 'error');
        history.push({ role: 'assistant', content: res.j.reply });
        save();
        bubble('assistant', res.j.reply);
      })
      .catch(function (e) {
        t.remove();
        history.pop();
        save();
        var d = bubble('assistant', (e && e.message && e.message !== 'error' && e.message !== 'Failed to fetch') ? e.message : 'Sorry, I could not reach the assistant. Please try again, or use the contact form.');
        d.classList.add('err');
      })
      .then(function () { busy = false; input.focus(); });
  }

  function open(v) {
    panel.hidden = !v;
    root.classList.toggle('open', v);
    fab.setAttribute('aria-expanded', v ? 'true' : 'false');
    if (v) { if (!log.children.length) restore(); setTimeout(function () { input.focus(); }, 60); }
  }
  fab.addEventListener('click', function () { open(panel.hidden); });
  document.getElementById('chat-close').addEventListener('click', function () { open(false); fab.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { open(false); fab.focus(); } });
  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
  chips.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) send(b.textContent); });
})();
