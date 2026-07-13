// Countdown to the wedding. The deadline is fixed in Moscow time (+03:00) —
// never derived from the visitor's timezone. After the deadline: zeros.

const DEADLINE = new Date('2026-08-08T15:00:00+03:00').getTime();

// Russian pluralization: 1 день / 2 дня / 5 дней (and 11-14 are always "many")
const plural = (n, [one, few, many]) => {
  const d10 = n % 10;
  const d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return one;
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return few;
  return many;
};

const WORDS = {
  days: ['день', 'дня', 'дней'],
  hours: ['час', 'часа', 'часов'],
  minutes: ['минута', 'минуты', 'минут'],
  seconds: ['секунда', 'секунды', 'секунд'],
};

export function initCountdown() {
  const root = document.getElementById('timer');
  if (!root) return;
  const digit = {};
  const label = {};
  for (const key of Object.keys(WORDS)) {
    digit[key] = root.querySelector(`[data-unit="${key}"]`);
    label[key] = root.querySelector(`[data-label="${key}"]`);
  }

  const tick = () => {
    const left = Math.max(0, DEADLINE - Date.now());
    const values = {
      days: Math.floor(left / 86400000),
      hours: Math.floor(left / 3600000) % 24,
      minutes: Math.floor(left / 60000) % 60,
      seconds: Math.floor(left / 1000) % 60,
    };
    for (const [key, value] of Object.entries(values)) {
      digit[key].textContent = String(value).padStart(2, '0');
      label[key].textContent = plural(value, WORDS[key]);
    }
  };

  tick();
  setInterval(tick, 1000);
}
