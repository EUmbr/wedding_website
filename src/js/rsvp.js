// RSVP form: validate, then POST to the Google Form formResponse endpoint.
// no-cors means the response is opaque — a resolved fetch counts as success,
// a network failure shows the error state. The user never leaves the site.

const FORM_ENDPOINT =
  'https://docs.google.com/forms/d/e/1FAIpQLSfAJeA3KAyWPzdxbx2BmUa_BF1gEkYT11rZ1tB4DvcElPZzgA/formResponse';

// фио, присутствие, напитки, горячее блюдо — all required in the Google Form
const REQUIRED = ['entry.1199485873', 'entry.100062412', 'entry.1865058381', 'entry.1134375954'];

export function initRsvp() {
  const form = document.getElementById('rsvp');
  if (!form) return;
  const status = document.getElementById('rsvp-status');
  const submitBtn = form.querySelector('.s7__submit');
  const nameInput = document.getElementById('rsvp-name');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // all four questions are required in the Google Form too
    const data = new FormData(form);
    const missing = REQUIRED.some((name) => !data.getAll(name).join('').trim());

    nameInput.classList.toggle('is-invalid', !nameInput.value.trim());
    if (missing) {
      status.textContent = 'пожалуйста, заполните все поля';
      return;
    }

    submitBtn.disabled = true;
    status.textContent = 'отправляем...';
    try {
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(form)),
      });
      form.classList.add('is-sent');
      submitBtn.hidden = true;
      status.textContent = 'спасибо! ваш ответ записан';
    } catch {
      submitBtn.disabled = false;
      status.textContent = 'ошибка сети — попробуйте еще раз';
    }
  });
}
