const ADMISSIONS_EMAIL = 'drashiff.alii@gmail.com';

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('open', !isOpen);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}));
document.querySelectorAll('a[href="#contact"]').forEach((link) => { link.href = '#admissions'; });

document.querySelector('#year').textContent = new Date().getFullYear();

// Keep the visual focused on books and study materials, without classroom portraits.
const booksPhoto = 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1000&q=85';
const approachPhoto = document.querySelector('.approach-photo img');
approachPhoto.src = booksPhoto;
approachPhoto.alt = 'Books and study materials ready for a quiet study session';

const replies = {
  admission: 'Start by filling in the enquiry form with the student’s name, class, program of interest, and a phone number or email. MCC can then follow up with admission steps.',
  programs: 'Madina offers school tuition, exam preparation, foundation courses, and one-to-one support. Choose “Need guidance” if you are unsure which fits.',
  details: 'Include the student’s name and class, the subject or program you are interested in, and a phone number or email where the centre can reach you.'
};
document.querySelectorAll('[data-reply]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('#help-reply').textContent = replies[button.dataset.reply];
    document.querySelectorAll('[data-reply]').forEach((item) => item.classList.toggle('selected', item === button));
  });
});

const form = document.querySelector('#admissions-form');
const status = document.querySelector('#form-status');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.classList.remove('is-error', 'is-success');
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form).entries());
  const contact = data.contact.trim();
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const digits = contact.replace(/\D/g, '');
  const looksLikePhone = digits.length >= 7 && digits.length <= 15;
  if (!looksLikeEmail && !looksLikePhone) {
    status.textContent = 'Please enter a valid email address or phone number so MCC can reach you.';
    status.classList.add('is-error');
    form.elements.contact.focus();
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  status.textContent = 'Sending your enquiry…';

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${ADMISSIONS_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        ...data,
        _subject: `MCC admission enquiry: ${data.student}`,
        _replyto: looksLikeEmail ? contact : '',
        _template: 'table',
        _url: window.location.href
      })
    });
    const result = await response.json();
    if (!response.ok || result.success === false || result.success === 'false') {
      throw new Error(result.message || 'The form service could not accept this enquiry.');
    }

    status.textContent = 'Thank you! Your enquiry has been sent to Madina Coaching Centre. We’ll contact you using the details you provided.';
    status.classList.add('is-success');
    form.reset();
  } catch (error) {
    status.textContent = 'We couldn’t send your enquiry right now. Please try again in a moment.';
    status.classList.add('is-error');
  } finally {
    button.disabled = false;
  }
});
