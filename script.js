(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Проекты по умолчанию. demos — живые сайты, которые открываются прямо на странице.
  const DEFAULTS = [
    { id: 'documentsync', title: 'DocumentSync', short: 'Синхронизация комплектов Word-документов',
      text: 'Настольная программа для безопасной синхронизации повторяющихся данных между связанными Word-документами. Меняете данные в главном документе, проверяете будущие правки и одной командой обновляете договоры, акты и приложения.',
      tags: ['.NET 8', 'Windows', 'Word'], private: true, demos: [],
      features: ['Связывание полей Word', 'Предпросмотр изменений', 'История версий и откат', 'Автоматическая и ручная синхронизация', 'Локальное хранение данных', 'RU / EN интерфейс'] },
    { id: 'channel-manager', title: 'Channel Manager', short: 'Панель управления Telegram-каналом',
      text: 'Система управления Telegram-каналами: стратегия, планирование контента, аналитика, эксперименты и память проекта.',
      tags: ['Telegram', 'Automation', 'Analytics'], demos: [],
      features: ['Планирование контента', 'Аналитика', 'Эксперименты', 'Управление каналами'] },
    { id: 'bot-systems', title: 'Bot Systems', short: 'Discord и Telegram-боты',
      text: 'Discord и Telegram-боты с командами, логикой, автоматизацией, конфигурацией и web-панелями.',
      tags: ['Python', 'Discord', 'Telegram'], demos: [],
      features: ['Команды', 'Автоматизация', 'Роли и права', 'Логи', 'Web-панели'] },
    { id: 'web-products', title: 'Web Products', short: 'Интерактивные сайты — открой и потыкай',
      text: 'Современные сайты и панели управления с адаптивной вёрсткой, анимациями и интеграциями.',
      tags: ['Frontend', 'UI/UX', 'Deploy'],
      demos: [
        { name: 'Прованский букет', url: 'https://provansky-buket.vercel.app', images: ['img/buket-home.jpg', 'img/buket-catalog.jpg', 'img/buket-mobile.jpg'] },
        { name: 'ПЕННЫЙ', url: 'https://penny-shop.vercel.app', images: ['img/penny-home.jpg', 'img/penny-catalog.jpg', 'img/penny-mobile.jpg'] }
      ],
      features: ['Адаптивность', 'Интерактивность', 'Анимации', 'Интеграции'] }
  ];
  const KEY = 'astra-studio-projects';
  const clone = v => JSON.parse(JSON.stringify(v));
  let projects = clone(DEFAULTS);
  try { const sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (Array.isArray(sv) && sv.length) projects = sv; } catch {}
  const TOP = ['var(--violet)', 'var(--coral)', 'var(--lime)', 'var(--dark)'];
  const TOP_FG = ['#fff', '#16141c', '#16141c', 'var(--on-dark)'];

  const craft = [
    ['Сайты и интерфейсы', 'Лендинги, портфолио, панели управления и интерактивные веб-приложения.'],
    ['Автоматизация', 'Убираю рутину: планировщики, сценарии и связки между сервисами.'],
    ['Боты и системы', 'Discord и Telegram-боты: команды, роли, базы данных, логи и web-панели.'],
    ['Моды и игры', 'Minecraft-моды, механики, ресурсы, серверные системы и прототипы.']
  ];
  const tech = ['Python', 'JavaScript', 'React', 'Node.js', 'NeoForge', 'Fabric', 'Forge', 'GeckoLib', 'discord.py', 'Telegram Bot API', 'OpenAI API', 'Gemini API', 'Git', 'GitHub', 'Vercel', 'systemd'];

  // ---------- bento ----------
  function renderBento() {
    $('#bento').innerHTML = projects.map((p, i) => `
      <button class="tile rv in${p.demos?.length && !p.private ? ' demo' : ''}${p.private ? ' private' : ''}" type="button" data-i="${i}">
        <span class="deco"></span><span class="num">0${i + 1}</span><span class="arrow">${p.private ? '🔒' : '↗'}</span>
        <h3>${esc(p.title)}</h3><p>${esc(p.short)}</p>
        <div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
      </button>`).join('');
  }
  renderBento();
  // Общий список работ с сервера (его же меняет Telegram-бот)
  fetch('/api/works', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(d => {
    if (d?.works?.length) { projects = d.works; renderBento(); }
  }).catch(() => {});

  $('#rows').innerHTML = craft.map(([t, d], i) => `
    <li class="row rv"><span class="n">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p><span class="go">→</span></li>`).join('');
  const m = tech.map(t => `<span>${esc(t)}</span>`).join('');
  $('#marquee').innerHTML = m + m;

  // ---------- project modal + live viewer ----------
  const modal = $('#modal'), viewer = $('#viewer');
  const safeUrl = u => /^https?:\/\//i.test(u) ? u : '#';

  function openViewer(p, idx = 0, shot = 0) {
    const d = p.demos[idx], imgs = (d.images || []).filter(u => /^(img\/|https?:\/\/)/.test(u));
    const url = esc(safeUrl(d.url));
    $('#viewer-body').innerHTML = `
      <div class="v-bar"><h3>${esc(p.title)}</h3>
        <div class="v-tabs">${p.demos.length > 1 ? p.demos.map((x, j) => `<button type="button" data-j="${j}" class="${j === idx ? 'on' : ''}">${esc(x.name)}</button>`).join('') : ''}</div>
        <a class="v-open" href="${url}" target="_blank" rel="noreferrer">Открыть сайт ↗</a>
        <button class="v-x" type="button" aria-label="Закрыть">×</button></div>
      ${imgs.length ? `
        <div class="v-stage"><img src="${esc(imgs[shot])}" alt="${esc(d.name)} — скриншот ${shot + 1}" class="${/mobile/.test(imgs[shot]) ? 'phone' : ''}"></div>
        <div class="v-thumbs">${imgs.map((u, k) => `<button type="button" data-k="${k}" class="${k === shot ? 'on' : ''}" aria-label="Скриншот ${k + 1}"><img src="${esc(u)}" alt=""></button>`).join('')}</div>`
      : `<div class="v-stage empty"><p>${esc(d.name)}</p><a class="btn solid" href="${url}" target="_blank" rel="noreferrer">Открыть сайт ↗</a></div>`}`;
    $('.v-tabs', viewer).onclick = e => { const b = e.target.closest('button'); if (b) openViewer(p, +b.dataset.j); };
    const th = $('.v-thumbs', viewer); if (th) th.onclick = e => { const b = e.target.closest('button'); if (b) openViewer(p, idx, +b.dataset.k); };
    if (!viewer.open) viewer.showModal();
  }
  viewer.addEventListener('click', e => { if (e.target.closest('.v-x')) viewer.close(); });
  viewer.addEventListener('close', () => { $('#viewer-body').innerHTML = ''; });

  $('#bento').addEventListener('click', e => {
    const t = e.target.closest('.tile'); if (!t) return;
    const i = +t.dataset.i, p = projects[i];
    if (p.demos?.length && !p.private) return openViewer(p);
    $('#modal-body').innerHTML = `
      <div class="m-top" style="background:${TOP[i] || 'var(--violet)'};color:${TOP_FG[i] || '#fff'}">
        <small>0${i + 1} / проект</small><h3>${esc(p.title)}</h3>
        <div class="tags">${(p.tags || []).map(x => `<span>${esc(x)}</span>`).join('')}</div>
        <button class="m-x" type="button" aria-label="Закрыть">×</button>
      </div>
      <div class="m-body"><p>${esc(p.text)}</p>
        ${(p.features || []).length ? `<ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
        <p class="lock">${p.private ? '🔒 Приватный проект — публичной демо-версии нет.' : 'Демо-версия скоро появится.'}</p></div>`;
    modal.showModal();
  });
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.m-x')) modal.close(); });

  // ---------- typing code card ----------
  const lines = [
    '<span class="c">// кто я</span>',
    '<span class="k">const</span> astra = {',
    '  name: <span class="s">"Денис"</span>,',
    '  focus: [<span class="s">"web"</span>, <span class="s">"bots"</span>,',
    '          <span class="s">"automation"</span>, <span class="s">"mods"</span>],',
    '  langs: [<span class="s">"ru"</span>, <span class="s">"en"</span>],',
    '  status: <span class="s">"open to work"</span>',
    '};'
  ];
  const code = $('#code'); let li = 0;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) code.innerHTML = lines.join('\n');
  else (function tick() { code.innerHTML = lines.slice(0, ++li).join('\n'); if (li < lines.length) setTimeout(tick, 420); })();

  // ---------- reveal + counters ----------
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in'); io.unobserve(en.target);
  }), { threshold: .15 });
  document.querySelectorAll('.rv:not(.tile),.head,.me > *,.contact').forEach(el => { el.classList.add('rv'); io.observe(el); });

  document.querySelectorAll('[data-count]').forEach(el => {
    const to = +el.dataset.count, t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  });

  // ---------- theme ----------
  const root = document.documentElement;
  const setTheme = t => { root.dataset.theme = t; try { localStorage.setItem('astra-theme', t); } catch {} };
  let saved; try { saved = localStorage.getItem('astra-theme'); } catch {}
  setTheme(saved || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
  $('#theme').addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  // ---------- Studio ----------
  const panel = $('#studio'), loginD = $('#login'), sbtn = $('#studio-open');
  let authed = null;
  async function check() {
    try { authed = (await fetch('/api/studio/session', { credentials: 'same-origin', cache: 'no-store' })).ok; } catch { authed = false; }
    sbtn.classList.toggle('on', authed); return authed;
  }
  const toList = t => t.split(',').map(x => x.trim()).filter(Boolean);
  const demosToText = d => (d || []).map(x => `${x.name} | ${x.url}`).join('\n');
  const textToDemos = t => t.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const [n, ...u] = l.split('|');
    const url = (u.length ? u.join('|') : n).trim();
    return { name: u.length ? n.trim() : url.replace(/^https?:\/\//, ''), url };
  }).filter(x => /^https?:\/\//i.test(x.url));

  function renderStudio() {
    panel.innerHTML = `
      <div class="s-head"><h3>Astra Studio</h3><button type="button" data-a="close" aria-label="Закрыть">×</button></div>
      <p class="s-hint">Демо-ссылки — по одной в строке: «Название | https://адрес». «Сохранить» публикует изменения для всех посетителей. Работы с галочкой Telegram синхронизируются с постами в канале (хэштег #работа).</p>
      <div class="s-list">${projects.map((p, i) => `
        <details class="s-item" data-i="${i}"><summary><span>${esc(p.title)}</span><span>${p.private ? '🔒' : p.demos?.length ? '● live' : ''}</span></summary>
          <div class="s-fields">
            <label>Название<input data-f="title" value="${esc(p.title)}"></label>
            <label>Кратко<input data-f="short" value="${esc(p.short)}"></label>
            <label>Описание<textarea data-f="text">${esc(p.text)}</textarea></label>
            <label>Теги (через запятую)<input data-f="tags" value="${esc((p.tags || []).join(', '))}"></label>
            <label>Возможности (через запятую)<input data-f="features" value="${esc((p.features || []).join(', '))}"></label>
            <label>Демо-ссылки<textarea data-f="demos">${esc(demosToText(p.demos))}</textarea></label>
            <label class="chk"><input type="checkbox" data-f="private" ${p.private ? 'checked' : ''}> Приватный проект (без демо)</label>
            <label class="chk"><input type="checkbox" data-f="tg" ${p.tg ? 'checked' : ''}> Синхронизировать с Telegram-каналом</label>
            <button class="s-del" type="button" data-a="del">Удалить проект</button>
          </div></details>`).join('')}</div>
      <div class="s-foot">
        <button class="btn solid" type="button" data-a="save">Сохранить</button>
        <button class="btn line" type="button" data-a="add">+ Проект</button>
        <button class="btn line" type="button" data-a="json">Копировать JSON</button>
        <button class="btn line" type="button" data-a="reset">Сбросить</button>
        <button class="btn line" type="button" data-a="logout">Выйти</button>
      </div>`;
  }
  function readStudio() {
    panel.querySelectorAll('.s-item').forEach(el => {
      const p = projects[+el.dataset.i], f = k => el.querySelector(`[data-f=${k}]`);
      p.title = f('title').value.trim() || 'Без названия'; p.short = f('short').value; p.text = f('text').value;
      p.tags = toList(f('tags').value); p.features = toList(f('features').value);
      const old = p.demos || []; p.demos = textToDemos(f('demos').value).map(d => ({ ...d, images: old.find(o => o.url === d.url)?.images || [] })); p.private = f('private').checked; p.tg = f('tg').checked && !p.private;
    });
  }
  async function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(projects)); } catch {}
    renderBento();
    try {
      const r = await fetch('/api/works', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ works: projects }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, msg: d.error || 'Ошибка сервера' };
      projects = d.works; renderBento();
      return { ok: true, msg: (d.warnings || []).join('\n') };
    } catch { return { ok: false, msg: 'Нет связи с сервером' }; }
  }
  const openStudio = () => { renderStudio(); panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); };
  const closeStudio = () => { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); };
  async function gate() {
    if (authed === null) await check();
    if (authed) return openStudio();
    $('#login-err').textContent = ''; $('#login-pass').value = ''; loginD.showModal();
  }
  sbtn.addEventListener('click', () => panel.classList.contains('open') ? closeStudio() : gate());
  document.addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') { e.preventDefault(); gate(); } });
  $('#login-cancel').addEventListener('click', () => loginD.close());
  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.submitter, err = $('#login-err'); btn.disabled = true; err.textContent = '';
    try {
      const r = await fetch('/api/studio/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('#login-pass').value }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Не удалось войти');
      authed = true; sbtn.classList.add('on'); loginD.close(); openStudio();
    } catch (x) { err.textContent = x.message; } finally { btn.disabled = false; }
  });
  panel.addEventListener('click', async e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'close') return closeStudio();
    if (a === 'logout') {
      try { await fetch('/api/studio/logout', { method: 'POST', credentials: 'same-origin' }); } catch {}
      authed = false; sbtn.classList.remove('on'); return closeStudio();
    }
    if (a === 'reset') {
      if (!confirm('Вернуть проекты к исходным?')) return;
      projects = clone(DEFAULTS); try { localStorage.removeItem(KEY); } catch {}
      renderBento(); return renderStudio();
    }
    readStudio();
    if (a === 'add') projects.push({ id: 'w' + Date.now(), title: 'Новый проект', short: 'Короткое описание', text: 'Описание проекта.', tags: ['New'], features: [], demos: [] });
    if (a === 'del') {
      const i = +b.closest('.s-item').dataset.i;
      if (!confirm(`Удалить «${projects[i].title}»?`)) return;
      projects.splice(i, 1);
    }
    if (a === 'json') {
      navigator.clipboard?.writeText(JSON.stringify(projects, null, 2));
      b.textContent = 'Скопировано ✓'; return setTimeout(() => b.textContent = 'Копировать JSON', 1500);
    }
    b.disabled = true;
    const res = await persist();
    b.disabled = false;
    if (a !== 'save') renderStudio();
    else { b.textContent = res.ok ? 'Сохранено ✓' : 'Ошибка'; setTimeout(() => b.textContent = 'Сохранить', 1500); }
    if (res.msg) alert(res.ok ? `Сохранено, но:\n${res.msg}` : `Не сохранено на сервере: ${res.msg}\nИзменения сохранены только в этом браузере.`);
  });
  check();

  // ---------- copy ----------
  $('#copy').addEventListener('click', e => {
    const b = e.currentTarget, old = b.textContent;
    navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.textContent = 'Скопировано ✓'; setTimeout(() => b.textContent = old, 1600); });
  });
})();
