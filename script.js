document.addEventListener('DOMContentLoaded',()=>{
  const root=document.documentElement;
  const defaults={
    hero:{eyebrow:'DIGITAL CREATOR · DEVELOPER',title:'Astra-GHT — Advanced Software, Technology & Research',lead:'Web-сайты, боты, автоматизация и игровые проекты. От идеи и архитектуры до готового продукта.'},
    stack:['Python','JavaScript','Minecraft','Web'],
    projects:{intro:'Подборка проектов и направлений, над которыми я работал.'},
    skills:{intro:'Собираю решения вокруг задачи, а не вокруг конкретного инструмента.'},
    about:{title:'Денис — разработчик, который любит превращать идеи в рабочие системы.',text:'Мне интересны продукты на стыке программирования, автоматизации, web и игр. Я люблю разбираться в архитектуре, собирать прототип, доводить интерфейс до аккуратного состояния и затем превращать всё это в поддерживаемый проект.'},
    contact:{text:'Напишите мне и расскажите, что нужно сделать. Можно коротко — разберём задачу вместе.'},
    skillsData:{
      1:{title:'Web Development',text:'Лендинги, портфолио, панели, интерактивные интерфейсы и интеграции.'},
      2:{title:'Automation Systems',text:'Автоматизация процессов, планировщики и рабочие сценарии.'},
      3:{title:'Bots & Systems',text:'Discord/Telegram-боты, команды, роли, базы данных, планировщики и логи.'},
      4:{title:'GameDev & Minecraft',text:'Моды, механики, ресурсы, серверные системы, карты и прототипирование.'}
    },
    projectsData:{
      channel:{title:'Channel Manager',description:'Система управления Telegram-каналами: стратегия, планирование контента, аналитика, эксперименты и память проекта.',tags:['Telegram','Automation','Analytics'],type:'channel'},
      sculk:{title:'Sculk Magic',description:'Мод с собственной системой Resonance и магией, вдохновлённой механиками Echo и Sculk.',tags:['Minecraft','NeoForge','GameDev'],type:'sculk'},
      bots:{title:'Bot Systems',description:'Discord и Telegram-боты с командами, логикой, автоматизацией, конфигурацией и web-панелями.',tags:['Python','Discord','Telegram'],type:'bots'},
      web:{title:'Web Products',description:'Современные сайты и панели управления с адаптивной вёрсткой, анимациями и интеграциями.',tags:['Frontend','UI/UX','Deploy'],type:'web'}
    },
    accent:'#a7ff3f',motion:1,orbit:true
  };
  let state=clone(defaults),editMode=false,selected=null,dirty=false;
  try{const saved=JSON.parse(localStorage.getItem('astra-ght-studio')||'null');if(saved)state=merge(state,saved)}catch{}
  function clone(v){return JSON.parse(JSON.stringify(v))}
  function merge(base,extra){if(!extra||typeof extra!=='object')return base;Object.keys(extra).forEach(k=>{if(extra[k]&&typeof extra[k]==='object'&&!Array.isArray(extra[k]))base[k]=merge(base[k]||{},extra[k]);else base[k]=extra[k]});return base}
  const safe=v=>{const d=document.createElement('div');d.textContent=v??'';return d.innerHTML};
  const id=v=>document.getElementById(v);
  function renderProjects(){
    const grid=id('project-grid'); if(!grid)return;
    grid.innerHTML=Object.entries(state.projectsData).map(([key,p])=>`<article class="project-card reveal-up" data-project="${safe(key)}" data-edit-project="${safe(key)}"><div class="project-art art-${safe(p.type||'web')}">${artMarkup(p)}</div><div class="project-info"><div class="tags">${(p.tags||[]).map(t=>`<span>${safe(t)}</span>`).join('')}</div><h3>${safe(p.title)}</h3><p>${safe(p.description)}</p><a href="#contact">Подробнее ↗</a></div></article>`).join('');
  }
  function artMarkup(p){
    if(p.type==='channel')return '<span class="art-label">CHANNEL MANAGER</span><div class="mini-dashboard"><div class="mini-head"><span>Growth</span><b>+34.8%</b></div><div class="mini-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>';
    if(p.type==='sculk')return '<span class="art-label">SCULK MAGIC</span><div class="sculk-shape">◈</div><div class="scan"></div>';
    if(p.type==='bots')return '<span class="art-label">BOT SYSTEMS</span><div class="terminal-card"><span>&gt; system.start()</span><b>status: online</b><span>&gt; deploy.ready()</span></div>';
    return '<span class="art-label">WEB PRODUCTS</span><div class="browser-card"><i></i><i></i><i class="wide"></i><i class="hero-line"></i></div>';
  }
  function render(){
    const title=id('hero.title'); if(title)title.innerHTML=safe(state.hero.title).replace('Advanced Software, Technology & Research','<span class="accent">Advanced Software, Technology & Research</span>');
    const heroEyebrow=document.querySelector('[data-edit-key="hero.eyebrow"]');if(heroEyebrow)heroEyebrow.innerHTML=`<span class="status-dot"></span>${safe(state.hero.eyebrow)}`;
    id('hero.lead')?.replaceChildren(document.createTextNode(state.hero.lead));
    id('about.title')?.replaceChildren(document.createTextNode(state.about.title));
    id('about.text')?.replaceChildren(document.createTextNode(state.about.text));
    id('projects.intro')?.replaceChildren(document.createTextNode(state.projects.intro));
    id('skills.intro')?.replaceChildren(document.createTextNode(state.skills.intro));
    id('contact.text')?.replaceChildren(document.createTextNode(state.contact.text));
    const stack=document.querySelector('[data-edit-key="stack"]');if(stack)stack.innerHTML=state.stack.map(x=>`<span>${safe(x)}</span>`).join('');
    Object.entries(state.skillsData).forEach(([n,d])=>{const el=document.querySelector(`[data-edit-key="skills.${n}"]`);if(el){el.querySelector('h3').textContent=d.title;el.querySelector('p').textContent=d.text}});
    renderProjects();
    root.style.setProperty('--accent',state.accent);
    document.querySelector('.hero-visual')?.classList.toggle('disabled',!state.orbit);
    bindEditorTargets();
  }
  render();

  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    const tl=gsap.timeline({defaults:{ease:'power3.out'}});
    tl.from('.site-header',{y:-20,opacity:0,duration:.55}).from('.hero-copy>*',{y:18,opacity:0,stagger:.07,duration:.42},'-=.2').from('.hero-visual',{scale:.97,opacity:0,duration:.7},'-=.5');
    gsap.utils.toArray('.reveal-up').forEach(el=>gsap.fromTo(el,{y:20,opacity:0},{y:0,opacity:1,duration:.58,scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
    gsap.to('.ambient-a',{x:70,y:40,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.ambient-b',{x:-70,y:-20,scrollTrigger:{trigger:'.skills-section',start:'top bottom',end:'bottom top',scrub:1}});
  }else document.querySelectorAll('.reveal-up').forEach(el=>{el.style.opacity=1});
  const dash=document.querySelector('.orbit-dash');if(window.gsap&&dash)gsap.to(dash,{rotation:360,transformOrigin:'50% 50%',duration:28,repeat:-1,ease:'none'});

  const canvas=id('cosmic-field'),ctx=canvas?.getContext('2d');let particles=[];
  function resize(){if(!canvas||!ctx)return;const r=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*r;canvas.height=innerHeight*r;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(r,0,0,r,0,0);particles=Array.from({length:Math.min(64,Math.max(28,Math.floor(innerWidth/26)))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.2+Math.random()*1.1,vx:(Math.random()-.5)*.11,vy:(Math.random()-.5)*.11}))}
  function draw(){if(!ctx)return;ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of particles){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=innerWidth;if(p.x>innerWidth)p.x=0;if(p.y<0)p.y=innerHeight;if(p.y>innerHeight)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(185,255,105,.3)';ctx.fill()}requestAnimationFrame(draw)}
  if(canvas){resize();draw();addEventListener('resize',resize)}

  const editor=id('visual-editor'),editorMode=id('editor-mode'),body=id('ve-body'),editorTitle=id('ve-title'),selection=id('editor-selection');
  function enterEditor(){editMode=true;editorMode.classList.add('active');editorMode.setAttribute('aria-hidden','false');document.body.classList.add('editing');dirty=false;selection.textContent='Нажми на элемент страницы';bindEditorTargets();window.scrollTo({top:0,behavior:'smooth'});}
  function exitEditor(){if(dirty&&!confirm('Есть несохранённые изменения. Выйти без сохранения?'))return;editMode=false;selected=null;editorMode.classList.remove('active');editorMode.setAttribute('aria-hidden','true');editor.classList.remove('open');editor.setAttribute('aria-hidden','true');document.body.classList.remove('editing');}
  function openInspector(kind,key,element){selected={kind,key,element};editor.classList.add('open');editor.setAttribute('aria-hidden','false');editorTitle.textContent=kind==='project'?'Проект':kind==='stack'?'Стек':key;selection.textContent=`Редактирование: ${kind==='project'?'карточка проекта':key}`;buildInspector();}
  function bindEditorTargets(){
    if(!editMode)return;
    document.querySelectorAll('[data-edit-key],[data-edit-project]').forEach(el=>{
      el.classList.add('editor-target');
      el.onclick=(e)=>{if(!editMode)return;e.preventDefault();e.stopPropagation();if(el.dataset.editProject)openInspector('project',el.dataset.editProject,el);else openInspector(el.dataset.editType||'text',el.dataset.editKey,el)};
    });
  }
  function inputRow(label,value,idv,type='text'){return `<label class="ve-field"><span>${label}</span>${type==='textarea'?`<textarea id="${idv}">${safe(value)}</textarea>`:`<input id="${idv}" value="${safe(value)}">`}</label>`}
  function buildInspector(){
    if(!body||!selected)return;
    if(selected.kind==='project'){
      const p=state.projectsData[selected.key];
      body.innerHTML=`<div class="ve-section"><div class="ve-kicker">PROJECT / ${selected.key.toUpperCase()}</div>${inputRow('Название',p.title,'ve-p-title')}${inputRow('Описание',p.description,'ve-p-desc','textarea')}${inputRow('Теги',(p.tags||[]).join(', '),'ve-p-tags')}<div class="ve-actions"><button class="ve-save" id="ve-apply-project">Применить</button><button class="ve-danger" id="ve-delete-project">Удалить карточку</button></div></div>`;
      id('ve-apply-project').onclick=()=>{p.title=id('ve-p-title').value.trim()||p.title;p.description=id('ve-p-desc').value.trim();p.tags=id('ve-p-tags').value.split(',').map(x=>x.trim()).filter(Boolean);dirty=true;render();openInspector('project',selected.key,document.querySelector(`[data-edit-project="${CSS.escape(selected.key)}"]`));};
      id('ve-delete-project').onclick=()=>{if(!confirm(`Удалить проект «${p.title}»?`))return;delete state.projectsData[selected.key];dirty=true;editor.classList.remove('open');render();};
      return;
    }
    if(selected.kind==='list'){
      body.innerHTML=`<div class="ve-section"><div class="ve-kicker">TECH STACK</div>${inputRow('Технологии',state.stack.join(', '),'ve-stack','textarea')}<div class="ve-actions"><button class="ve-save" id="ve-apply">Применить</button></div></div>`;
      id('ve-apply').onclick=()=>{state.stack=id('ve-stack').value.split(',').map(x=>x.trim()).filter(Boolean);dirty=true;render()};return;
    }
    if(selected.kind==='skill'){
      const n=selected.key.split('.')[1],d=state.skillsData[n];
      body.innerHTML=`<div class="ve-section"><div class="ve-kicker">SKILL ${n}</div>${inputRow('Название',d.title,'ve-s-title')}${inputRow('Описание',d.text,'ve-s-text','textarea')}<div class="ve-actions"><button class="ve-save" id="ve-apply">Применить</button></div></div>`;
      id('ve-apply').onclick=()=>{d.title=id('ve-s-title').value.trim()||d.title;d.text=id('ve-s-text').value.trim();dirty=true;render()};return;
    }
    const [group,prop]=selected.key.split('.');const value=state[group]?.[prop]??'';
    body.innerHTML=`<div class="ve-section"><div class="ve-kicker">TEXT</div>${inputRow('Содержимое',value,'ve-text','textarea')}<div class="ve-actions"><button class="ve-save" id="ve-apply">Применить</button></div></div>`;
    id('ve-apply').onclick=()=>{state[group][prop]=id('ve-text').value;dirty=true;render()};
  }

  document.addEventListener('click',e=>{
    if(!editMode)return;
    if(e.target.closest('.site-header,.visual-editor,#editor-mode'))return;
    const target=e.target.closest('[data-edit-key],[data-edit-project]');
    if(target){e.preventDefault();e.stopPropagation();if(target.dataset.editProject)openInspector('project',target.dataset.editProject,target);else openInspector(target.dataset.editType||'text',target.dataset.editKey,target)}
  },true);
  id('editor-exit').onclick=exitEditor;
  id('editor-save').onclick=()=>{localStorage.setItem('astra-ght-studio',JSON.stringify(state));dirty=false;selection.textContent='Изменения сохранены';};
  id('ve-close').onclick=()=>editor.classList.remove('open');
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&editMode)exitEditor();});
  window.addEventListener('astra:studio-authenticated',()=>enterEditor());
});