document.addEventListener('DOMContentLoaded',()=>{
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

  let state={...defaults};
  try{const saved=JSON.parse(localStorage.getItem('astra-ght-studio')||'null');if(saved)state=deepMerge({...defaults},saved)}catch(e){}

  function deepMerge(base,extra){if(!extra||typeof extra!=='object')return base;for(const k of Object.keys(extra)){if(extra[k]&&typeof extra[k]==='object'&&!Array.isArray(extra[k]))base[k]=deepMerge(base[k]||{},extra[k]);else base[k]=extra[k]}return base}
  function setText(selector,text){const el=document.querySelector(selector);if(el&&typeof text==='string'){el.textContent=text}}
  function htmlTitle(title){const el=document.querySelector('[data-edit="hero.title"]');if(el)el.innerHTML=escapeHtml(title).replace(/Advanced Software, Technology & Research/,'<em>Advanced Software, Technology & Research</em>')}
  function escapeHtml(value){const d=document.createElement('div');d.textContent=value??'';return d.innerHTML}

  function applyState(){
    htmlTitle(state.hero.title);setText('[data-edit="hero.lead"]',state.hero.lead);setText('[data-edit="about.title"]',state.about.title);setText('[data-edit="about.text"]',state.about.text);setText('[data-edit="projects.intro"]',state.projects.intro);
    document.querySelectorAll('[data-project]').forEach(card=>{const data=state.projectsData[card.dataset.project];if(!data)return;const t=card.querySelector('[data-project-title]'),d=card.querySelector('[data-project-description]');if(t)t.textContent=data.title;if(d)d.textContent=data.description});
    const stack=document.querySelector('[data-edit="stack"]');if(stack){stack.innerHTML=state.stack.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}
    root.style.setProperty('--accent',state.accent);root.style.setProperty('--accent-2',state.accent);root.style.setProperty('--motion-scale',String(state.motion));
    document.querySelector('.hero-orbit')?.classList.toggle('hidden-orbit',!state.orbit);
  }
  applyState();

  if(window.Lenis){const lenis=new Lenis({duration:1.1,smoothWheel:true,syncTouch:false});function raf(t){lenis.raf(t);requestAnimationFrame(raf)}requestAnimationFrame(raf);}

  if(window.gsap){if(window.ScrollTrigger)gsap.registerPlugin(ScrollTrigger);
    const m=()=>Math.max(.45,Number(state.motion)||1);
    gsap.from('.nav',{y:-30,opacity:0,duration:.9/easeFactor(),ease:'power3.out'});
    const heroTl=gsap.timeline({defaults:{ease:'power3.out'}});
    heroTl.from('.hero-eyebrow',{y:18,opacity:0,duration:.55/m()}).from('.hero h1',{y:55,opacity:0,filter:'blur(14px)',duration:1.05/m()},'-=.18').from('.hero .lead',{y:22,opacity:0,duration:.6/m()},'-=.5').from('.hero-actions .button',{y:20,opacity:0,stagger:.09,duration:.45/m()},'-=.3').from('.proof',{y:16,opacity:0,duration:.45/m()},'-=.15').from('.orbital',{scale:.35,opacity:0,stagger:.12,duration:.9/m()},'-=.9').from('.core',{scale:.4,opacity:0,rotation:-90,duration:1/m()},'-=.7').from('.orbit-node',{scale:0,opacity:0,stagger:.12,duration:.4/m()},'-=.6');
    if(window.ScrollTrigger){gsap.utils.toArray('.section:not(.hero)').forEach(sec=>{gsap.from(sec.querySelectorAll('.section-head,.project-card,.skill-item,.about-card,.contact'),{scrollTrigger:{trigger:sec,start:'top 78%',once:true},y:48,opacity:0,filter:'blur(10px)',stagger:.07,duration:.85/m(),ease:'power3.out'})});
      gsap.to('.ambient-a',{x:140,y:90,scale:1.25,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});gsap.to('.ambient-b',{x:-120,y:-50,scale:1.2,scrollTrigger:{trigger:'.projects',start:'top bottom',end:'bottom top',scrub:1}})
    }
    gsap.to('.orbit-trace',{rotation:360,duration:22/m(),repeat:-1,ease:'none'});
    gsap.to('.core',{y:10,duration:3.5/m(),repeat:-1,yoyo:true,ease:'sine.inOut'});
  }
  function easeFactor(){return Math.max(.45,Number(state.motion)||1)}

  const canvas=document.getElementById('cosmic-field');const ctx=canvas?.getContext('2d');let particles=[],pointer={x:-9999,y:-9999};
  function resizeCanvas(){if(!canvas)return;canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);const count=Math.min(90,Math.floor(innerWidth/16));particles=Array.from({length:count},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.4+.25,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18}))}
  function drawField(){if(!ctx)return;ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vx*=.999;p.vy*=.999;if(p.x<-5)p.x=innerWidth+5;if(p.x>innerWidth+5)p.x=-5;if(p.y<-5)p.y=innerHeight+5;if(p.y>innerHeight+5)p.y=-5;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(185,255,105,.42)';ctx.fill()}
    for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const a=particles[i],b=particles[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<105){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(167,255,63,${(1-d/105)*.08})`;ctx.stroke()}}requestAnimationFrame(drawField)}
  if(canvas){resizeCanvas();drawField();addEventListener('resize',resizeCanvas);}

  document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.12}px,${y*.12}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});

  const dot=document.querySelector('.cursor-dot'),ring=document.querySelector('.cursor-ring');if(dot)dot.style.display='none';if(ring)ring.style.display='none';

  const reveal=[...document.querySelectorAll('.project-card,.skill-item,.about-card,.contact')];const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});reveal.forEach(el=>{el.classList.add('reveal');io.observe(el)});

  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id&&id.length>1){const target=document.querySelector(id);if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'})}}}));

  const studio=document.getElementById('studio'),openBtns=[...document.querySelectorAll('.studio-open')],closeBtn=document.querySelector('.studio-close'),backdrop=document.querySelector('.studio-backdrop');
  const heroTitle=document.getElementById('edit-hero-title'),heroLead=document.getElementById('edit-hero-lead'),aboutTitle=document.getElementById('edit-about-title'),aboutText=document.getElementById('edit-about-text'),range=document.getElementById('motion-intensity'),accent=document.getElementById('accent-color'),projectList=document.getElementById('studio-project-list');
  function fillStudio(){heroTitle.value=state.hero.title;heroLead.value=state.hero.lead;aboutTitle.value=state.about.title;aboutText.value=state.about.text;range.value=state.motion;accent.value=state.accent;document.querySelector('[data-toggle="hero-orbit"]')?.classList.toggle('active',state.orbit);projectList.innerHTML=Object.entries(state.projectsData).map(([key,p])=>`<div class="studio-project"><b>${key.toUpperCase()}</b><input data-field="${key}.title" value="${escapeHtml(p.title)}"><textarea data-field="${key}.description">${escapeHtml(p.description)}</textarea></div>`).join('')}
  function openStudio(){fillStudio();studio.classList.add('open');studio.setAttribute('aria-hidden','false');if(window.gsap){gsap.to(backdrop,{opacity:1,duration:.3});gsap.to('.studio-panel',{x:0,duration:.55,ease:'power3.out'})}}
  function closeStudio(){if(window.gsap){gsap.to(backdrop,{opacity:0,duration:.25});gsap.to('.studio-panel',{x:'100%',duration:.4,ease:'power2.in',onComplete:()=>{studio.classList.remove('open');studio.setAttribute('aria-hidden','true')}})}else{studio.classList.remove('open');studio.setAttribute('aria-hidden','true')}}
  openBtns.forEach(b=>b.addEventListener('click',openStudio));closeBtn?.addEventListener('click',closeStudio);backdrop?.addEventListener('click',closeStudio);addEventListener('keydown',e=>{if(e.key==='Escape'&&studio.classList.contains('open'))closeStudio();if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='a'){e.preventDefault();openStudio()}});
  document.querySelector('[data-toggle="hero-orbit"]')?.addEventListener('click',e=>{state.orbit=!state.orbit;e.currentTarget.classList.toggle('active',state.orbit);applyState()});
  document.getElementById('studio-save')?.addEventListener('click',()=>{state.hero.title=heroTitle.value;state.hero.lead=heroLead.value;state.about.title=aboutTitle.value;state.about.text=aboutText.value;state.motion=Number(range.value);state.accent=accent.value;projectList.querySelectorAll('[data-field]').forEach(el=>{const [key,field]=el.dataset.field.split('.');if(state.projectsData[key])state.projectsData[key][field]=el.value});localStorage.setItem('astra-ght-studio',JSON.stringify(state));applyState();if(window.gsap)gsap.fromTo('#studio-save',{scale:1},{scale:1.04,yoyo:true,repeat:1,duration:.13});});
  document.getElementById('studio-reset')?.addEventListener('click',()=>{state=JSON.parse(JSON.stringify(defaults));localStorage.removeItem('astra-ght-studio');applyState();fillStudio()});
  document.getElementById('studio-export')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='astra-ght-content.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)});
  document.getElementById('studio-import')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{state=deepMerge(JSON.parse(JSON.stringify(defaults)),JSON.parse(reader.result));localStorage.setItem('astra-ght-studio',JSON.stringify(state));applyState();fillStudio()}catch(err){alert('Не удалось прочитать JSON-файл.')}};reader.readAsText(file)});

  const refine=document.createElement('style');refine.textContent=`.nav nav{gap:16px}@media(max-width:820px){.nav nav{gap:12px}}.cursor-dot,.cursor-ring{display:none!important}.project-card:after{display:none!important}`;document.head.appendChild(refine);
});
