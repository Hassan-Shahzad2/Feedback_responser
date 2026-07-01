(() => {
  'use strict';

  const WEBHOOK_URL = 'https://hassan115.app.n8n.cloud/webhook/feedback';

  const form = document.getElementById('feedback-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const feedbackInput = document.getElementById('feedback');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const feedbackError = document.getElementById('feedback-error');
  const inlineError = document.getElementById('inline-error');

  const submitBtn = document.getElementById('submit-btn');
  const btnLabel = submitBtn.querySelector('.btn-label');

  const seal = document.getElementById('seal');

  const modalScrim = document.getElementById('modal-scrim');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalName = document.getElementById('modal-name');
  const modalIconOk = document.getElementById('modal-icon-ok');
  const modalIconBad = document.getElementById('modal-icon-bad');
  const modalBtn = document.getElementById('modal-btn');
  const modalClose = document.getElementById('modal-close');

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(inputEl, errorEl, message) {
    if (message) {
      inputEl.classList.add('invalid');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      errorEl.classList.add('show');
    } else {
      inputEl.classList.remove('invalid');
      inputEl.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }
  }

  function validateForm() {
    let isValid = true;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const feedback = feedbackInput.value.trim();

    if (!name) { setFieldError(nameInput, nameError, 'Please enter your name.'); isValid = false; }
    else setFieldError(nameInput, nameError, '');

    if (!email) { setFieldError(emailInput, emailError, 'Please enter your email.'); isValid = false; }
    else if (!EMAIL_REGEX.test(email)) { setFieldError(emailInput, emailError, 'Please enter a valid email address.'); isValid = false; }
    else setFieldError(emailInput, emailError, '');

    if (!feedback) { setFieldError(feedbackInput, feedbackError, 'Please share some feedback.'); isValid = false; }
    else setFieldError(feedbackInput, feedbackError, '');

    return isValid;
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle('loading', isLoading);
    btnLabel.textContent = isLoading ? 'Sending...' : 'Send feedback';
  }

  function openModal({ ok, name, message }) {
    if (ok) {
      modalIconOk.style.display = 'flex';
      modalIconBad.style.display = 'none';
      modalTitle.textContent = 'Message sent';
      modalName.textContent = name || 'there';
      modalBody.innerHTML = `Thanks, <strong id="modal-name">${escapeHtml(name || 'there')}</strong> — your feedback is in. We'll reply by email shortly.`;
      modalBtn.textContent = 'Done';
      modalBtn.classList.remove('retry');
      seal.classList.remove('idle', 'listening');
      seal.classList.add('success');
    } else {
      modalIconOk.style.display = 'none';
      modalIconBad.style.display = 'flex';
      modalTitle.textContent = 'Something went wrong';
      modalBody.textContent = message || 'We could not send your feedback. Please try again in a moment.';
      modalBtn.textContent = 'Try again';
      modalBtn.classList.add('retry');
    }
    modalScrim.classList.add('open');
    modalBtn.focus();
  }

  function closeModal() {
    modalScrim.classList.remove('open');
    setTimeout(() => {
      seal.classList.remove('success');
      seal.classList.add('idle');
    }, 300);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    inlineError.classList.remove('show');

    if (!validateForm()) return;

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      feedback: feedbackInput.value.trim(),
    };

    setLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      openModal({ ok: true, name: payload.name });
      form.reset();
    } catch (error) {
      console.error('Feedback submission failed:', error);
      openModal({ ok: false, message: 'We could not send your feedback. Please try again in a moment.' });
    } finally {
      setLoading(false);
    }
  }

  nameInput.addEventListener('input', () => setFieldError(nameInput, nameError, ''));
  emailInput.addEventListener('input', () => setFieldError(emailInput, emailError, ''));
  feedbackInput.addEventListener('input', () => setFieldError(feedbackInput, feedbackError, ''));

  form.addEventListener('submit', handleSubmit);

  feedbackInput.addEventListener('focus', () => seal.classList.add('listening'));
  feedbackInput.addEventListener('blur', () => seal.classList.remove('listening'));

  modalBtn.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  modalScrim.addEventListener('click', (e) => { if (e.target === modalScrim) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalScrim.classList.contains('open')) closeModal();
  });

  submitBtn.addEventListener('click', (e) => {
    if (submitBtn.disabled) return;
    const rect = submitBtn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    submitBtn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = window.innerWidth < 600 ? 10 : 20;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      const size = Math.random() * 3 + 2;
      const left = Math.random() * 100;
      const duration = Math.random() * 12 + 12;
      const delay = Math.random() * 14;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${left}vw`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      container.appendChild(particle);
    }
  }
  createParticles();
})();