document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  const defaults = {
    hero: {
      title: 'Astra-GHT — Advanced Software, Technology & Research',
      lead: 'Web-сайты, боты, автоматизация и игровые проекты. От идеи и архитектуры до готового продукта.'
    },
    about: {
      title: 'Денис — разработчик, который любит превращать идеи в рабочие системы.',
      text: 'Мне интересны продукты на стыке программирования, автоматизации, web и игр. Я люблю разбираться в архитектуре, собирать прототип, доводить интерфейс до аккуратного состояния и затем превращать всё это в поддерживаемый проект.'
    },
    projects: { intro: 'Подборка проектов и направлений, над которыми я работал.' },
    stack: ['Python', 'JavaScript', 'Minecraft', 'Web'],
    projectsData: {
      channel: { title: 'Channel Manager', description: 'Система управления Telegram-каналами: стратегия, планирование контента, аналитика, эксперименты и память проекта.' },
      sculk: { title: 'Sculk Magic', description: 'Мод с собственной системой Resonance и магией, вдохновлённой механиками Echo и Sculk.' },
      bots: { title: 'Bot Systems', description: 'Discord и Telegram-боты с командами, логикой, автоматизацией, конфигурацией и web-панелями.' },
      web: { title: 'Web Products', description: 'Современные сайты и панели управления с адаптивной вёрсткой, анимациями и интеграциями.' }
    },
    accent: '#a7ff3f',
    motion: 1,
    orbit: true
  };

  let state = JSON.parse(JSON.stringify(defaults));
  try {
    const saved = JSON.parse(localStorage.getItem('astra-ght-studio') || 'null');
    if (saved) state = deepMerge(state, saved);
  } catch {}

  function deepMerge(base, extra) {
    if (!extra || typeof extra !== 'object') return base;
    for (const key of Object.keys(extra)) {
      if (extra[key] && typeof extra[key] === 'object' && !Array.isArray(extra[key])) {
        base[key] = deepMerge(base[key] || {}, extra[key]);
      } else {
        base[key] = extra[key];
      }
    }
    return base;
  }

  function escapeHtml(value) {
    const node = document.createElement('div');
    node.textContent = value ?? '';
    return node.innerHTML;
  }

  function renderEditableTitle(selector, value) {
    const el = document.querySelector(selector);
    if (!el) return;
    const safe = escapeHtml(value);
    el.innerHTML = safe.replace('Advanced Software, Technology & Research', '<em>Advanced Software, Technology & Research</em>');
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value ?? '';
  }

  function applyState() {
    renderEditableTitle('[data-edit="hero.title"]', state.hero.title);
    setText('[data-edit="hero.lead"]', state.hero.lead);
    renderEditableTitle('[data-edit="about.title"]', state.about.title);
    setText('[data-edit="about.text"]', state.about.text);
    setText('[data-edit="projects.intro"]', state.projects.intro);

    document.querySelectorAll('[data-project]').forEach(card => {
      const data = state.projectsData[card.dataset.project];
      if (!data) return;
      const title = card.querySelector('[data-project-title]');
      const description = card.querySelector('[data-project-description]');
      if (title) title.textContent = data.title;
      if (description) description.textContent = data.description;
    });

    const stack = document.querySelector('[data-edit="stack"]');
    if (stack) stack.innerHTML = state.stack.map(item => `<span>${escapeHtml(item)}</span>`).join('');

    root.style.setProperty('--accent', state.accent);
    document.querySelector('.hero-visual')?.classList.toggle('hidden-orbit', !state.orbit);
  }
  applyState();

  if (window.Lenis) {
    const lenis = new Lenis({ duration: 0.8, smoothWheel: true, syncTouch: false });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  if (window.gsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const speed = () => Math.max(0.55, Number(state.motion) || 1);

    gsap.from('.site-header', { y: -22, opacity: 0, duration: 0.7 / speed(), ease: 'power3.out' });
    gsap.from('.hero-copy > *', { y: 24, opacity: 0, duration: 0.65 / speed(), stagger: 0.08, ease: 'power3.out' });
    gsap.from('.hero-visual', { scale: 0.94, opacity: 0, duration: 0.9 / speed(), ease: 'power3.out', delay: 0.12 });

    if (window.ScrollTrigger) {
      gsap.utils.toArray('.reveal-up').forEach((element) => {
        element.classList.add('reveal-ready');
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.65 / speed(),
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true }
        });
      });
    } else {
      document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('reveal-ready'));
    }
  }

  const orbitDash = document.querySelector('.orbit-dash');
  if (window.gsap && orbitDash) {
    gsap.to(orbitDash, { rotation: 360, transformOrigin: '50% 50%', duration: 28, repeat: -1, ease: 'none' });
  }

  const canvas = document.getElementById('cosmic-field');
  const ctx = canvas?.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(72, Math.max(30, Math.floor(innerWidth / 24)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.25 + 0.25,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12
    }));
  }

  function drawField() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -8) p.x = innerWidth + 8;
      if (p.x > innerWidth + 8) p.x = -8;
      if (p.y < -8) p.y = innerHeight + 8;
      if (p.y > innerHeight + 8) p.y = -8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(185,255,105,.42)';
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 105) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(167,255,63,${(1 - d / 105) * 0.07})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawField);
  }

  if (canvas) {
    resizeCanvas();
    drawField();
    addEventListener('resize', resizeCanvas);
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href');
      const target = id && document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const studio = document.getElementById('studio');
  const openButtons = [...document.querySelectorAll('.studio-open')];
  const closeButton = document.querySelector('.studio-close');
  const backdrop = document.querySelector('.studio-backdrop');
  const heroTitle = document.getElementById('edit-hero-title');
  const heroLead = document.getElementById('edit-hero-lead');
  const aboutTitle = document.getElementById('edit-about-title');
  const aboutText = document.getElementById('edit-about-text');
  const range = document.getElementById('motion-intensity');
  const accent = document.getElementById('accent-color');
  const projectList = document.getElementById('studio-project-list');

  function fillStudio() {
    if (!projectList) return;
    heroTitle.value = state.hero.title;
    heroLead.value = state.hero.lead;
    aboutTitle.value = state.about.title;
    aboutText.value = state.about.text;
    range.value = state.motion;
    accent.value = state.accent;
    document.querySelector('[data-toggle="hero-orbit"]')?.classList.toggle('active', state.orbit);
    projectList.innerHTML = Object.entries(state.projectsData).map(([key, data]) => `
      <div class="studio-project">
        <b>${key.toUpperCase()}</b>
        <input data-field="${key}.title" value="${escapeHtml(data.title)}">
        <textarea data-field="${key}.description">${escapeHtml(data.description)}</textarea>
      </div>`).join('');
  }

  function openStudio() {
    fillStudio();
    studio?.classList.add('open');
    studio?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.gsap) {
      gsap.to(backdrop, { opacity: 1, duration: 0.25 });
      gsap.to('.studio-panel', { x: 0, duration: 0.42, ease: 'power3.out' });
    }
  }

  function closeStudio() {
    document.body.style.overflow = '';
    if (window.gsap) {
      gsap.to(backdrop, { opacity: 0, duration: 0.2 });
      gsap.to('.studio-panel', { x: '100%', duration: 0.32, ease: 'power2.in', onComplete: () => {
        studio?.classList.remove('open');
        studio?.setAttribute('aria-hidden', 'true');
      }});
    } else {
      studio?.classList.remove('open');
      studio?.setAttribute('aria-hidden', 'true');
    }
  }

  openButtons.forEach(button => button.addEventListener('click', openStudio));
  closeButton?.addEventListener('click', closeStudio);
  backdrop?.addEventListener('click', closeStudio);
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && studio?.classList.contains('open')) closeStudio();
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      document.querySelector('.studio-open')?.click();
    }
  });

  document.querySelector('[data-toggle="hero-orbit"]')?.addEventListener('click', event => {
    state.orbit = !state.orbit;
    event.currentTarget.classList.toggle('active', state.orbit);
    applyState();
  });

  document.getElementById('studio-save')?.addEventListener('click', () => {
    state.hero.title = heroTitle.value;
    state.hero.lead = heroLead.value;
    state.about.title = aboutTitle.value;
    state.about.text = aboutText.value;
    state.motion = Number(range.value);
    state.accent = accent.value;

    projectList.querySelectorAll('[data-field]').forEach(field => {
      const [key, property] = field.dataset.field.split('.');
      if (state.projectsData[key]) state.projectsData[key][property] = field.value;
    });

    localStorage.setItem('astra-ght-studio', JSON.stringify(state));
    applyState();
    if (window.gsap) gsap.fromTo('#studio-save', { scale: 1 }, { scale: 1.035, yoyo: true, repeat: 1, duration: 0.12 });
  });

  document.getElementById('studio-reset')?.addEventListener('click', () => {
    state = JSON.parse(JSON.stringify(defaults));
    localStorage.removeItem('astra-ght-studio');
    applyState();
    fillStudio();
  });

  document.getElementById('studio-export')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'astra-ght-content.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  });

  document.getElementById('studio-import')?.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = deepMerge(JSON.parse(JSON.stringify(defaults)), JSON.parse(reader.result));
        localStorage.setItem('astra-ght-studio', JSON.stringify(state));
        applyState();
        fillStudio();
      } catch {
        alert('Не удалось прочитать JSON-файл.');
      }
    };
    reader.readAsText(file);
  });
});
