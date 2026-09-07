document.addEventListener('DOMContentLoaded',()=>{
  const save=document.getElementById('editor-save');
  const exit=document.getElementById('editor-exit');
  const bar=document.querySelector('.editor-topbar');
  if(!save||!exit||!bar)return;

  save.type='button';
  exit.type='button';
  save.style.pointerEvents='auto';
  exit.style.pointerEvents='auto';
  save.style.position='relative';
  exit.style.position='relative';
  save.style.zIndex='1000';
  exit.style.zIndex='1000';

  const originalSave=save.onclick;
  const originalExit=exit.onclick;

  save.onclick=null;
  exit.onclick=null;

  save.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    if(typeof originalSave==='function')originalSave.call(save,e);
    save.classList.add('saved');
    const old=save.textContent;
    save.textContent='Сохранено ✓';
    setTimeout(()=>{save.textContent=old;save.classList.remove('saved')},1300);
  },true);

  exit.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    if(typeof originalExit==='function')originalExit.call(exit,e);
  },true);

  bar.addEventListener('pointerdown',e=>{
    if(e.target.closest('#editor-save,#editor-exit'))e.stopPropagation();
  },true);
});
