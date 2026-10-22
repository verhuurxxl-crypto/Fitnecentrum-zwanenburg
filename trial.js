(() => {
  const form = document.querySelector('#trial-form');
  if (!form) return;
  const error = document.querySelector('#trial-error');
  const availability = document.querySelector('#trial-availability');
  const button = form.querySelector('[type=submit]');
  const label = button.textContent;
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let busy = false;
  const selected = new URLSearchParams(location.search).get('interest');
  if ([...form.elements.interest.options].some(option => option.value === selected)) form.elements.interest.value = selected;

  // Availability is a real server check; there is no simulated success response.
  button.disabled = true;
  fetch('/api/trial.php', {headers: {Accept: 'application/json'}, cache: 'no-store'})
    .then(response => response.ok ? response.json() : Promise.reject(new Error('unavailable')))
    .then(data => {
      if (!data.available) throw new Error('unavailable');
      availability.hidden = true;
      button.disabled = false;
    })
    .catch(() => {
      form.hidden = true;
      availability.replaceChildren();
      availability.append('Zin om te komen trainen? Spreek je gratis proeftraining direct met ons af. ');
      const phone = document.createElement('a');
      phone.href = 'tel:+31204978616';
      phone.className = 'button';
      phone.textContent = 'Bel 020 497 8616 ↗';
      availability.append(phone);
    });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || button.disabled || !form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    if (!values.name.trim()) { form.elements.name.setCustomValidity('Vul je naam in.'); form.elements.name.reportValidity(); return; }
    busy = true;
    button.disabled = true;
    button.textContent = 'Je aanvraag wordt verstuurd…';
    form.setAttribute('aria-busy', 'true');
    error.hidden = true;
    try {
      const response = await fetch('/api/trial.php', {
        method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify({...values, requestId, startedAt}), signal: AbortSignal.timeout(30000)
      });
      const data = await response.json();
      if (!response.ok || !data.accepted) throw new Error(data.error || 'Versturen lukt nu niet. Bel 020 497 8616 om je proeftraining af te spreken.');
      document.querySelector('#trial-confirmation').textContent = data.confirmationSent
        ? 'Je aanvraag is ontvangen en je welkomstmail is verstuurd. Zie je hem nog niet? Kijk dan ook even bij ongewenste e-mail.'
        : 'Je aanvraag is ontvangen. De bevestigingsmail kon nog niet worden verstuurd; de club neemt contact met je op.';
      form.hidden = true;
      const success = document.querySelector('#trial-success');
      success.hidden = false;
      success.querySelector('h3').focus();
      success.scrollIntoView({block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    } catch (failure) {
      error.textContent = failure.name === 'TimeoutError' || failure.name === 'AbortError'
        ? 'De verbinding duurt te lang. Je gegevens blijven staan. Probeer opnieuw of bel 020 497 8616.'
        : failure.message;
      error.hidden = false;
    } finally {
      busy = false; button.disabled = false; button.textContent = label; form.removeAttribute('aria-busy');
    }
  });
  form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));
})();
