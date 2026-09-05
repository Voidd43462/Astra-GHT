document.addEventListener('DOMContentLoaded',()=>{
  const root=document.getElementById('site-chat');
  const form=document.getElementById('site-chat-form');
  if(!root||!form)return;
  const nameInput=document.getElementById('chat-name');
  const messageInput=document.getElementById('chat-message');
  const messagesEl=document.getElementById('chat-messages');
  const statusEl=document.getElementById('chat-status');
  const sendButton=form.querySelector('button[type="submit"]');
  let lastId=0,pollTimer=null,loading=false;
  const esc=v=>{const d=document.createElement('div');d.textContent=v??'';return d.innerHTML};
  const fmt=v=>{try{return new Date(v).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch{return ''}};
  function render(items){
    if(!items.length&&lastId===0){messagesEl.innerHTML='<div class="chat-empty">Начните диалог. Ответ появится здесь, без перехода на другие сайты.</div>';return}
    if(lastId===0)messagesEl.innerHTML='';
    for(const m of items){
      if(document.querySelector(`[data-message-id="${m.id}"]`))continue;
      const row=document.createElement('div');row.className=`chat-message ${m.sender==='owner'?'owner':'visitor'}`;row.dataset.messageId=m.id;
      row.innerHTML=`<div class="chat-bubble"><div>${esc(m.body).replace(/\n/g,'<br>')}</div><time>${fmt(m.created_at)}</time></div>`;
      messagesEl.appendChild(row);lastId=Math.max(lastId,Number(m.id));
    }
    messagesEl.querySelector('.chat-empty')?.remove();
    messagesEl.scrollTop=messagesEl.scrollHeight;
  }
  async function sync(){
    try{
      const r=await fetch(`/api/chat?since=${lastId}`,{credentials:'same-origin',cache:'no-store'});
      const data=await r.json();
      if(!r.ok)throw new Error(data.error||'Ошибка чата');
      if(data.conversation?.visitorName&&nameInput&&!nameInput.value)nameInput.value=data.conversation.visitorName;
      if(data.conversation?.status==='closed')statusEl.textContent='Диалог закрыт. Новое сообщение снова откроет его.';
      render(data.messages||[]);
    }catch{statusEl.textContent='Не удалось подключиться к чату. Повторяем…'}
  }
  async function send(e){
    e.preventDefault();if(loading)return;
    const name=(nameInput?.value||'').trim();const text=messageInput.value.trim();if(!text)return;
    loading=true;sendButton.disabled=true;statusEl.textContent='Отправка…';
    try{
      const r=await fetch('/api/chat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,message:text})});
      const data=await r.json();if(!r.ok)throw new Error(data.error||'Не удалось отправить сообщение');
      render([data.message]);messageInput.value='';statusEl.textContent='Сообщение доставлено';messageInput.focus();
    }catch(err){statusEl.textContent=err.message||'Ошибка отправки'}
    finally{loading=false;sendButton.disabled=false}
  }
  form.addEventListener('submit',send);
  sync();pollTimer=setInterval(sync,2500);
  window.addEventListener('beforeunload',()=>clearInterval(pollTimer));

  const editorTop=document.querySelector('.editor-top-actions');
  function setupAdmin(){
    if(!editorTop||document.getElementById('studio-chat-open'))return;
    const btn=document.createElement('button');btn.id='studio-chat-open';btn.type='button';btn.className='studio-chat-open';btn.innerHTML='Чаты <span id="studio-chat-badge">0</span>';editorTop.insertBefore(btn,editorTop.firstChild);
    const panel=document.createElement('aside');panel.id='studio-chat-panel';panel.innerHTML=`<div class="sch-head"><div><span>ASTRA INBOX</span><h3>Чаты</h3></div><button id="sch-close" type="button">×</button></div><div class="sch-main"><div class="sch-list" id="sch-list"></div><div class="sch-convo"><div class="sch-convo-head" id="sch-convo-head">Выберите диалог</div><div class="sch-messages" id="sch-messages"></div><form id="sch-form"><textarea id="sch-input" maxlength="1200" placeholder="Ответить посетителю…"></textarea><div><button class="button primary" type="submit">Отправить</button><button class="sch-close-chat" type="button" id="sch-close-chat">Закрыть диалог</button></div></form></div></div>`;document.body.appendChild(panel);
    let conversations=[],current=null,adminLastId=0,adminTimer=null;
    const list=document.getElementById('sch-list'),sm=document.getElementById('sch-messages'),head=document.getElementById('sch-convo-head'),af=document.getElementById('sch-form'),ain=document.getElementById('sch-input');
    const renderList=()=>{list.innerHTML=conversations.length?conversations.map(c=>`<button type="button" class="sch-item ${current?.id===c.id?'active':''}" data-id="${c.id}"><strong>${esc(c.visitor_name)}</strong><span>${esc(c.last_message||'Нет сообщений')}</span><time>${fmt(c.updated_at)}</time></button>`).join(''):'<div class="sch-empty">Пока нет диалогов</div>';document.getElementById('studio-chat-badge').textContent=conversations.filter(c=>c.last_sender==='visitor'&&c.status==='open').length};
    async function loadConversations(){try{const r=await fetch('/api/chat?action=admin',{credentials:'same-origin',cache:'no-store'});if(!r.ok)return;const d=await r.json();conversations=d.conversations||[];renderList();}catch{}}
    async function openConversation(c){current=c;adminLastId=0;sm.innerHTML='';head.textContent=c.visitor_name;renderList();await syncConversation()}
    async function syncConversation(){if(!current)return;try{const r=await fetch(`/api/chat?conversation=${encodeURIComponent(current.id)}&since=${adminLastId}`,{credentials:'same-origin',cache:'no-store'});if(!r.ok)return;const d=await r.json();for(const m of d.messages||[]){if(document.querySelector(`#sch-messages [data-id="${m.id}"]`))continue;const el=document.createElement('div');el.className=`sch-msg ${m.sender}`;el.dataset.id=m.id;el.innerHTML=`<div>${esc(m.body).replace(/\n/g,'<br>')}</div><time>${fmt(m.created_at)}</time>`;sm.appendChild(el);adminLastId=Math.max(adminLastId,Number(m.id))}sm.scrollTop=sm.scrollHeight}catch{}}
    btn.addEventListener('click',async()=>{panel.classList.add('open');await loadConversations();if(current)await syncConversation()});document.getElementById('sch-close').onclick=()=>panel.classList.remove('open');document.getElementById('sch-close-chat').onclick=async()=>{if(!current)return;await fetch('/api/chat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'close',conversationId:current.id})});await loadConversations()};list.addEventListener('click',e=>{const b=e.target.closest('.sch-item');if(b){const c=conversations.find(x=>x.id===b.dataset.id);if(c)openConversation(c)}});af.addEventListener('submit',async e=>{e.preventDefault();if(!current||!ain.value.trim())return;const text=ain.value.trim();ain.disabled=true;try{await fetch('/api/chat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'owner-send',conversationId:current.id,message:text})});ain.value='';await syncConversation();await loadConversations()}finally{ain.disabled=false}});adminTimer=setInterval(()=>{if(panel.classList.contains('open')){loadConversations();syncConversation()}},2500);
  }
  window.addEventListener('astra:studio-authenticated',setupAdmin);
});
