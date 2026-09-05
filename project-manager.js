document.addEventListener('DOMContentLoaded',()=>{
  let editing=false;
  const safe=v=>{const d=document.createElement('div');d.textContent=v??'';return d.innerHTML};
  function addCreate(){
    if(!editing)return;
    const grid=document.getElementById('project-grid');if(!grid||grid.querySelector('.project-create'))return;
    const button=document.createElement('button');button.className='project-create';button.type='button';button.innerHTML='<span>＋ Создать новый проект</span>';
    button.addEventListener('click',()=>{
      let state;
      try{state=JSON.parse(localStorage.getItem('astra-ght-studio')||'null')}catch{state=null}
      if(!state||!state.projectsData){alert('Сначала открой Studio и выполни вход.');return}
      const base='project';let n=1;while(state.projectsData[`${base}${n}`])n++;
      const title=`Новый проект ${n}`;
      state.projectsData[`${base}${n}`]={title,description:'Описание нового проекта.',tags:['New'],type:'web'};
      localStorage.setItem('astra-ght-studio',JSON.stringify(state));
      location.reload();
    });
    grid.appendChild(button);
  }
  window.addEventListener('astra:studio-authenticated',()=>{editing=true;setTimeout(addCreate,80)});
  document.addEventListener('click',()=>{if(editing)addCreate()},true);
});