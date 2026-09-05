document.addEventListener('DOMContentLoaded', () => {
  let authenticated = null;
  let pendingOpen = false;

  const shell = document.createElement('div');
  shell.className = 'studio-auth';
  shell.innerHTML = `
    <div class="studio-auth-card" role="dialog" aria-modal="true" aria-labelledby="studio-auth-title">
      <div class="studio-auth-kicker">ASTRA STUDIO · PRIVATE</div>
      <h2 id="studio-auth-title">Доступ к панели</h2>
      <p>Введите пароль администратора. Сессия хранится только в защищённой cookie.</p>
      <form class="studio-auth-form">
        <label>Пароль<input id="studio-auth-password" type="password" autocomplete="current-password" required></label>
        <p class="studio-auth-error" aria-live="polite"></p>
        <div class="studio-auth-actions"><button class="button primary" type="submit">Войти</button><button class="button ghost" type="button" data-auth-cancel>Отмена</button></div>
      </form>
    </div>`;
  document.body.appendChild(shell);

  const form = shell.querySelector('form');
  const password = shell.querySelector('#studio-auth-password');
  const error = shell.querySelector('.studio-auth-error');

  async function checkSession() {
    try {
      const r = await fetch('/api/studio/session', { credentials: 'same-origin', cache: 'no-store' });
      authenticated = r.ok;
    } catch {
      authenticated = false;
    }
    return authenticated;
  }

  function showAuth() {
    pendingOpen = true;
    error.textContent = '';
    password.value = '';
    shell.classList.add('open');
    setTimeout(() => password.focus(), 30);
  }

  function closeAuth() {
    pendingOpen = false;
    shell.classList.remove('open');
  }

  async function gate(openAction) {
    if (authenticated === null) await checkSession();
    if (authenticated) return openAction();
    showAuth();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const response = await fetch('/api/studio/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.value })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Не удалось выполнить вход');
      authenticated = true;
      closeAuth();
      if (pendingOpen) document.querySelector('.studio-open')?.click();
    } catch (err) {
      error.textContent = err.message || 'Ошибка авторизации';
      password.select();
    } finally {
      submit.disabled = false;
    }
  });

  shell.querySelector('[data-auth-cancel]').addEventListener('click', closeAuth);
  shell.addEventListener('click', (event) => { if (event.target === shell) closeAuth(); });

  // Capture phase blocks the existing Studio click/shortcut until the server session is valid.
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest?.('.studio-open');
    if (!trigger || authenticated === true) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    gate(() => trigger.click());
  }, true);

  window.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a')) return;
    if (authenticated === true) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    gate(() => document.querySelector('.studio-open')?.click());
  }, true);

  const head = document.querySelector('.studio-head');
  if (head && !head.querySelector('.studio-logout')) {
    const logout = document.createElement('button');
    logout.type = 'button';
    logout.className = 'button ghost studio-logout';
    logout.textContent = 'Выйти';
    logout.addEventListener('click', async () => {
      await fetch('/api/studio/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
      authenticated = false;
      document.querySelector('.studio-close')?.click();
    });
    head.appendChild(logout);
  }
});
