document.addEventListener('DOMContentLoaded',()=>{
  document.body.classList.add('ready');
  const root=document.documentElement;
  const defaults={
    hero:{title:'Astra-GHT — Advanced Software, Technology & Research',lead:'Web-сайты, боты, автоматизация и игровые проекты. От идеи и архитектуры до готового продукта.'},
    about:{title:'Денис — разработчик, который любит превращать идеи в рабочие системы.',text:'Мне интересны продукты на стыке программирования, автоматизации, web и игр. Я люблю разбираться в архитектуре, собирать прототип, доводить интерфейс до аккуратного состояния и затем превращать всё это в поддерживаемый проект.'},
    projects:{intro:'Подборка проектов и направлений, над которыми я работал.'},
    stack:['Python','JavaScript','Minecraft','Web'],
    projectsData:{
      channel:{title:'Channel Manager',description:'Система управления Telegram-каналами: стратегия, планирование контента, аналитика, эксперименты и память проекта.'},
      sculk:{title:'Sculk Magic',description:'Мод с собственной системой Resonance и магией, вдохновлённой механиками Echo и Sculk.'},
      bots:{title:'Bot Systems',description:'Discord и Telegram-боты с командами, логикой, автоматизацией, конфигурацией и web-панелями.'},
      web:{title:'Web Products',description:'Современные сайты и панели управления с адаптивной вёрсткой, анимациями и интеграциями.'}
    },
    accent:'#a7ff3f',motion:1,orbit:true
  };
  let state=JSON.parse(JSON.stringify(defaults));
  try{const saved=JSON.parse(localStorage.getItem('astra-ght-studio')||'null');if(saved)state=merge(state,saved)}catch{}
  function merge(base,extra){if(!extra||typeof extra!=='object')return base;for(const k in extra){if(extra[k]&&typeof extra[k]==='object'&&!Array.isArray(extra[k]))base[k]=merge(base[k]||{},extra[k]);else base[k]=extra[k]}return base}
  const safe=v=>{const d=document.createElement('div');d.textContent=v??'';return d.innerHTML};
  function render(){
    const hero=document.querySelector('[data-edit="hero.title"]');
    if(hero)hero.innerHTML=safe(state.hero.title).replace('Advanced Software, Technology & Research','<span class="accent">Advanced Software, Technology & Research</span>');
    document.querySelector('[data-edit="hero.lead"]')?.replaceChildren(document.createTextNode(state.hero.lead));
    const about=document.querySelector('[data-edit="about.title"]');if(about)about.textContent=state.about.title;
    document.querySelector('[data-edit="about.text"]')?.replaceChildren(document.createTextNode(state.about.text));
    document.querySelector('[data-edit="projects.intro"]')?.replaceChildren(document.createTextNode(state.projects.intro));
    document.querySelectorAll('[data-project]').forEach(card=>{const d=state.projectsData[card.dataset.project];if(!d)return;card.querySelector('[data-project-title]')?.replaceChildren(document.createTextNode(d.title));card.querySelector('[data-project-description]')?.replaceChildren(document.createTextNode(d.description))});
    const stack=document.querySelector('[data-edit="stack"]');if(stack)stack.innerHTML=state.stack.map(x=>`<span>${safe(x)}</span>`).join('');
    root.style.setProperty('--accent',state.accent);
    document.querySelector('.hero-visual')?.classList.toggle('disabled',!state.orbit);
  }
  render();

  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    const intro=gsap.timeline({defaults:{ease:'power3.out'}});
    intro.from('.site-header',{y:-18,opacity:0,duration:.55})
      .from('.hero-copy .eyebrow',{y:14,opacity:0,duration:.35},'-=.2')
      .from('.hero h1',{y:28,opacity:0,filter:'blur(8px)',duration:.8},'-=.15')
      .from('.hero-lead',{y:18,opacity:0,duration:.45},'-=.45')
      .from('.hero-actions .button',{y:14,opacity:0,stagger:.08,duration:.35},'-=.2')
      .from('.stack-line',{y:10,opacity:0,duration:.35},'-=.18')
      .from('.hero-visual',{scale:.97,opacity:0,duration:.7},'-=.48');
    document.querySelectorAll('.reveal-up').forEach(el=>gsap.fromTo(el,{y:24,opacity:0},{y:0,opacity:1,duration:.65,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));
    gsap.to('.ambient-a',{x:80,y:55,scale:1.1,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.ambient-b',{x:-90,y:-35,scale:1.08,scrollTrigger:{trigger:'.skills-section',start:'top bottom',end:'bottom top',scrub:1}});
  }else document.querySelectorAll('.reveal-up').forEach(el=>el.style.cssText+=';opacity:1;transform:none');

  const canvas=document.getElementById('cosmic-field');const ctx=canvas?.getContext('2d');let particles=[];
  function resize(){if(!canvas||!ctx)return;const r=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*r;canvas.height=innerHeight*r;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(r,0,0,r,0,0);const n=Math.min(68,Math.max(28,Math.floor(innerWidth/25)));particles=Array.from({length:n},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.2+Math.random()*1.1,vx:(Math.random()-.5)*.11,vy:(Math.random()-.5)*.11}))}
  function draw(){if(!ctx)return;ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of particles){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=innerWidth;if(p.x>innerWidth)p.x=0;if(p.y<0)p.y=innerHeight;if(p.y>innerHeight)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(185,255,105,.36)';ctx.fill()}for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const a=particles[i],b=particles[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<100){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(167,255,63,${(1-d/100)*.055})`;ctx.stroke()}}requestAnimationFrame(draw)}
  if(canvas){resize();draw();addEventListener('resize',resize)}

  const dash=document.querySelector('.orbit-dash');if(window.gsap&&dash)gsap.to(dash,{rotation:360,transformOrigin:'50% 50%',duration:28,repeat:-1,ease:'none'});

  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href'),target=id&&document.querySelector(id);if(!target)return;e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'})}));

  const studio=document.getElementById('studio');const close=document.querySelector('.studio-close');const back=document.querySelector('.studio-backdrop');const heroTitle=document.getElementById('edit-hero-title');const heroLead=document.getElementById('edit-hero-lead');const aboutTitle=document.getElementById('edit-about-title');const aboutText=document.getElementById('edit-about-text');const range=document.getElementById('motion-intensity');const accent=document.getElementById('accent-color');const projectList=document.getElementById('studio-project-list');
  function fill(){if(!projectList)return;heroTitle.value=state.hero.title;heroLead.value=state.hero.lead;aboutTitle.value=state.about.title;aboutText.value=state.about.text;range.value=state.motion;accent.value=state.accent;document.querySelector('[data-toggle="hero-orbit"]')?.classList.toggle('active',state.orbit);projectList.innerHTML=Object.entries(state.projectsData).map(([k,p])=>`<div class="studio-project"><b>${k.toUpperCase()}</b><input data-field="${k}.title" value="${safe(p.title)}"><textarea data-field="${k}.description">${safe(p.description)}</textarea></div>`).join('')}
  function open(){fill();studio.classList.add('open');studio.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function hide(){studio.classList.remove('open');studio.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  document.querySelectorAll('.studio-open').forEach(b=>b.addEventListener('click',open));close?.addEventListener('click',hide);back?.addEventListener('click',hide);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&studio.classList.contains('open'))hide();});
  document.querySelector('[data-toggle="hero-orbit"]')?.addEventListener('click',e=>{state.orbit=!state.orbit;e.currentTarget.classList.toggle('active',state.orbit);render()});
  document.getElementById('studio-save')?.addEventListener('click',()=>{state.hero.title=heroTitle.value;state.hero.lead=heroLead.value;state.about.title=aboutTitle.value;state.about.text=aboutText.value;state.motion=Number(range.value);state.accent=accent.value;projectList.querySelectorAll('[data-field]').forEach(el=>{const [k,p]=el.dataset.field.split('.');if(state.projectsData[k])state.projectsData[k][p]=el.value});localStorage.setItem('astra-ght-studio',JSON.stringify(state));render()});
  document.getElementById('studio-reset')?.addEventListener('click',()=>{state=JSON.parse(JSON.stringify(defaults));localStorage.removeItem('astra-ght-studio');render();fill()});
  document.getElementById('studio-export')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='astra-ght-content.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500)});
  document.getElementById('studio-import')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{state=merge(JSON.parse(JSON.stringify(defaults)),JSON.parse(reader.result));localStorage.setItem('astra-ght-studio',JSON.stringify(state));render();fill()}catch{alert('Не удалось прочитать JSON-файл.')}};reader.readAsText(f)});
});