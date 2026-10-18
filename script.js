(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const projects = [
    { title: 'DocumentSync', color: 'var(--violet)', short: 'Синхронизация комплектов Word-документов',
      text: 'Настольная программа для безопасной синхронизации повторяющихся данных между связанными Word-документами. Меняете данные в главном документе, проверяете будущие правки и одной командой обновляете договоры, акты и приложения.',
      tags: ['.NET 8', 'Windows', 'Word'],
      features: ['Связывание полей Word', 'Предпросмотр изменений', 'История версий и откат', 'Автоматическая и ручная синхронизация', 'Локальное хранение данных', 'RU / EN интерфейс'] },
    { title: 'Channel Manager', color: 'var(--coral)', short: 'Панель управления Telegram-каналом',
      text: 'Система управления Telegram-каналами: стратегия, планирование контента, аналитика, эксперименты и память проекта.',
      tags: ['Telegram', 'Automation', 'Analytics'],
      features: ['Планирование контента', 'Аналитика', 'Эксперименты', 'Управление каналами'] },
    { title: 'Bot Systems', color: 'var(--lime)', short: 'Discord и Telegram-боты',
      text: 'Discord и Telegram-боты с командами, логикой, автоматизацией, конфигурацией и web-панелями.',
      tags: ['Python', 'Discord', 'Telegram'],
      features: ['Команды', 'Автоматизация', 'Роли и права', 'Логи', 'Web-панели'] },
    { title: 'Web Products', color: 'var(--dark)', short: 'Интерактивные сайты и панели управления',
      text: 'Современные сайты и панели управления с адаптивной вёрсткой, анимациями и интеграциями — от лендинга до полноценного приложения.',
      tags: ['Frontend', 'UI/UX', 'Deploy'],
      features: ['Адаптивность', 'Интерактивность', 'Анимации', 'Интеграции'] }
  ];

  const craft = [
    ['Сайты и интерфейсы', 'Лендинги, портфолио, панели управления и интерактивные веб-приложения.'],
    ['Автоматизация', 'Убираю рутину: планировщики, сценарии и связки между сервисами.'],
    ['Боты и системы', 'Discord и Telegram-боты: команды, роли, базы данных, логи и web-панели.'],
    ['Моды и игры', 'Minecraft-моды, механики, ресурсы, серверные системы и прототипы.']
  ];

  const tech = ['Python', 'JavaScript', 'React', 'Node.js', 'NeoForge', 'Fabric', 'Forge', 'GeckoLib', 'discord.py', 'Telegram Bot API', 'OpenAI API', 'Gemini API', 'Git', 'GitHub', 'Vercel', 'systemd'];

  // bento
  $('#bento').innerHTML = projects.map((p, i) => `
    <button class="tile rv" type="button" data-i="${i}" style="transition-delay:${i * 80}ms">
      <span class="deco"></span><span class="num">0${i + 1}</span><span class="arrow">↗</span>
      <h3>${esc(p.title)}</h3><p>${esc(p.short)}</p>
      <div class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
    </button>`).join('');

  // craft rows
  $('#rows').innerHTML = craft.map(([t, d], i) => `
    <li class="row rv"><span class="n">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p><span class="go">→</span></li>`).join('');

  // marquee
  const m = tech.map(t => `<span>${esc(t)}</span>`).join('');
  $('#marquee').innerHTML = m + m;

  // modal
  const modal = $('#modal');
  $('#bento').addEventListener('click', e => {
    const t = e.target.closest('.tile'); if (!t) return;
    const p = projects[t.dataset.i];
    const fg = p.color === 'var(--lime)' ? '#16141c' : p.color === 'var(--coral)' ? '#16141c' : '#fff';
    $('#modal-body').innerHTML = `
      <div class="m-top" style="background:${p.color};color:${fg}">
        <small>0${+t.dataset.i + 1} / проект</small><h3>${esc(p.title)}</h3>
        <div class="tags">${p.tags.map(x => `<span>${esc(x)}</span>`).join('')}</div>
        <button class="m-x" type="button" aria-label="Закрыть">×</button>
      </div>
      <div class="m-body"><p>${esc(p.text)}</p><ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>`;
    modal.showModal();
  });
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.m-x')) modal.close(); });

  // typing code card
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
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (reduce) code.innerHTML = lines.join('\n');
  else (function tick() { code.innerHTML = lines.slice(0, ++li).join('\n'); if (li < lines.length) setTimeout(tick, 420); })();

  // reveal + counters
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in'); io.unobserve(en.target);
  }), { threshold: .15 });
  document.querySelectorAll('.rv,.head,.me > *,.contact').forEach(el => { el.classList.add('rv'); io.observe(el); });

  document.querySelectorAll('[data-count]').forEach(el => {
    const to = +el.dataset.count, t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  });

  // theme
  const root = document.documentElement;
  const setTheme = t => { root.dataset.theme = t; try { localStorage.setItem('astra-theme', t); } catch {} };
  let saved; try { saved = localStorage.getItem('astra-theme'); } catch {}
  setTheme(saved || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
  $('#theme').addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  // copy
  $('#copy').addEventListener('click', e => {
    const b = e.currentTarget, old = b.textContent;
    navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.textContent = 'Скопировано ✓'; setTimeout(() => b.textContent = old, 1600); });
  });
})();
