// Mobile menu toggle
document.querySelectorAll('.menu-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var nav = document.getElementById('site-nav');
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
});

// Contact form: validates required fields, then hands off to a configurable endpoint.
// Set FORM_ENDPOINT to your form service (Formspree, Netlify Forms, a PHP/Node handler, etc.).
var FORM_ENDPOINT = '';
var form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var status = document.getElementById('form-status');
    var data = new FormData(form);
    if (!data.get('name') || !data.get('email') || !data.get('phone')) {
      status.textContent = 'Please fill in name, email and phone.';
      return;
    }
    if (!FORM_ENDPOINT) {
      status.textContent = 'Form endpoint not configured yet. Please email yarlcreators0@gmail.com.';
      return;
    }
    try {
      var res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      status.textContent = res.ok ? 'Thank you! We will be in touch shortly.' : 'Something went wrong. Please try again.';
      if (res.ok) form.reset();
    } catch (err) {
      status.textContent = 'Network error. Please try again.';
    }
  });
}
