// auth/login-handler.js
// Responsabilidade: Lógica do formulário de login — validação, feedback visual e redirecionamento

(function () {
  // Se já estiver autenticado, vai direto para o dashboard
  if (isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const feedback = document.getElementById('login-feedback');
  const btn = document.getElementById('btn-entrar');
  const rememberCheckbox = document.getElementById('remember-me');

  // ─── Validação visual em tempo real ───────────────────────────────────
  emailInput.addEventListener('input', () => {
    emailInput.classList.remove('is-valid', 'is-invalid');
    feedback.textContent = '';
    feedback.className = 'login-feedback';
  });

  emailInput.addEventListener('blur', () => {
    if (emailInput.value.trim() && !emailInput.validity.valid) {
      emailInput.classList.add('is-invalid');
    }
  });

  // ─── Submissão do formulário ──────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) return;

    // Validação HTML5 do campo
    if (!emailInput.validity.valid) {
      emailInput.classList.add('is-invalid');
      _showFeedback('Insira um e-mail válido.', 'error');
      return;
    }

    // Estado de loading
    btn.disabled = true;
    btn.classList.add('is-loading');
    emailInput.classList.remove('is-valid', 'is-invalid');
    feedback.textContent = '';
    feedback.className = 'login-feedback';

    const isValid = await validateEmail(email);

    if (isValid) {
      const hash = await hashEmail(email);

      if (rememberCheckbox.checked) {
        saveSession(hash);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          hash: hash,
          timestamp: Date.now(),
        }));
      }

      emailInput.classList.add('is-valid');
      _showFeedback('✓ Acesso autorizado!', 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    } else {
      emailInput.classList.add('is-invalid');
      _showFeedback('E-mail não autorizado.', 'error');
      btn.disabled = false;
      btn.classList.remove('is-loading');
    }
  });

  // ─── Helpers ──────────────────────────────────────────────────────────

  function _showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = 'login-feedback';
    if (type) {
      feedback.classList.add(`login-feedback--${type}`);
    }
  }
})();
