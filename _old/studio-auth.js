document.addEventListener('DOMContentLoaded',()=>{
  let authenticated=null,pendingOpen=false;
  const shell=document.createElement('div');
  shell.className='studio-auth';
  shell.innerHTML=`<div class="studio-auth-card" role="dialog" aria-modal="true" aria-labelledby="studio-auth-title"><div class="studio-auth-kicker">ASTRA STUDIO · PRIVATE</div><h2 id="studio-auth-title">Доступ к Studio</h2><p>Введите пароль администратора. Сессия хранится в защищённой cookie.</p><form class="studio-auth-form"><label>Пароль<input id="studio-auth-password" type="password" autocomplete="current-password" required></label><p class="studio-auth-error" aria-live="polite"></p><div class="studio-auth-actions"><button class="button primary" type="submit">Войти</button><button class="button secondary" type="button" data-auth-cancel>Отмена</button></div></form></div>`;
  document.body.appendChild(shell);
  const form=shell.querySelector('form'),password=shell.querySelector('#studio-auth-password'),error=shell.querySelector('.studio-auth-error');
  async function check(){try{const r=await fetch('/api/studio/session',{credentials:'same-origin',cache:'no-store'});authenticated=r.ok}catch{authenticated=false}return authenticated}
  function show(){pendingOpen=true;error.textContent='';password.value='';shell.classList.add('open');setTimeout(()=>password.focus(),30)}
  function hide(){shell.classList.remove('open')}
  async function gate(){if(authenticated===null)await check();if(authenticated){window.dispatchEvent(new Event('astra:studio-authenticated'));return true}show();return false}
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    error.textContent='';
    const submit=form.querySelector('[type="submit"]');
    submit.disabled=true;
    try{
      const r=await fetch('/api/studio/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:password.value})});
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(data.error||'Не удалось выполнить вход');
      authenticated=true;
      pendingOpen=false;
      hide();
      window.dispatchEvent(new Event('astra:studio-authenticated'));
    }catch(err){error.textContent=err.message||'Ошибка авторизации';password.select()}
    finally{submit.disabled=false}
  });
  shell.querySelector('[data-auth-cancel]').addEventListener('click',()=>{pendingOpen=false;hide()});
  shell.addEventListener('click',e=>{if(e.target===shell){pendingOpen=false;hide()}});
  document.addEventListener('click',e=>{
    const trigger=e.target.closest?.('.studio-open');
    if(!trigger)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    gate();
  },true);
  document.addEventListener('keydown',e=>{
    if(!(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='a'))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    gate();
  },true);
  window.addEventListener('astra:studio-logout',async()=>{
    try{await fetch('/api/studio/logout',{method:'POST',credentials:'same-origin',cache:'no-store'})}catch{}
    authenticated=false;
    pendingOpen=false;
    hide();
  });
});