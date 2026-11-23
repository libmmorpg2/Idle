// ---- общий чат: сообщения хранятся на сервере (PostgreSQL), опрос GET /api/chat ----
const CHAT={msgs:[],last:0,me:null,state:'wait',sending:false,timer:0,note:'',
  get seen(){ return (S&&S.chatSeen)||0; }, set seen(v){ if(S) S.chatSeen=v; }};   // «прочитано» хранится в сохранении
const CHAT_POLL_OPEN=2500, CHAT_POLL_CLOSED=5000, CHAT_POLL_HIDDEN=30000;
const chatEl=id=>document.getElementById(id);
const chatOpen=()=>!chatEl('chatPanel').hidden;
const CHAT_COLS=['#c9a25a','#b98cff','#6ab8ff','#5fd39b','#ff9a6a','#f07ab8','#6ad8e0','#d8c060'];
const colOf=m=>m.uid===CHAT.me?'#ffd27a':CHAT_COLS[m.uid%CHAT_COLS.length];
const nameOf=m=>m.name+(m.lvl?' ['+m.lvl+']':'');

function chatMerge(list){
  if(!list||!list.length) return;
  const ids=new Set(CHAT.msgs.map(m=>m.id));
  for(const m of list) if(!ids.has(m.id)){ CHAT.msgs.push(m); ids.add(m.id); }
  CHAT.msgs.sort((a,b)=>a.id-b.id); CHAT.msgs=CHAT.msgs.slice(-100);
  CHAT.last=CHAT.msgs[CHAT.msgs.length-1].id;
}
function chatLine(m){
  const d=document.createElement('div'); d.className='msg'+(m.uid===CHAT.me?' me':'');
  const n=document.createElement('span'); n.className='cn'; n.style.color=colOf(m); n.textContent=nameOf(m)+':';
  const t=document.createElement('span'); t.textContent=m.text;
  const tm=document.createElement('span'); tm.className='ct'; tm.textContent=new Date(m.ts).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'});
  d.append(n,t,tm); return d;
}
function chatRender(){
  const ms=CHAT.msgs, L=ms[ms.length-1], open=chatOpen();
  const last=chatEl('chatLast'); last.textContent='';
  if(L){ const n=document.createElement('span'); n.className='cn'; n.style.color=colOf(L); n.textContent=L.name+':'; const t=document.createElement('span'); t.textContent=L.text; last.append(n,t); }
  else { const t=document.createElement('span'); t.className='cm'; t.textContent=CHAT.state==='on'?'Чат пуст — напиши первым':CHAT.state==='wait'?'Чат загружается…':'Чат недоступен'; last.append(t); }
  if(open && L && L.ts>CHAT.seen){ CHAT.seen=L.ts; save(); }
  chatEl('chatDot').hidden=!(L && L.ts>CHAT.seen && L.uid!==CHAT.me);
  const can=CHAT.state==='on';
  chatEl('chatIn').disabled=!can; chatEl('chatSend').disabled=!can||CHAT.sending;
  chatEl('chatIn').placeholder=can?'Сообщение…':'Чат недоступен';
  chatEl('chatState').textContent=CHAT.note||(CHAT.state==='on'?'':CHAT.state==='wait'?'подключение…':'нет связи с сервером');
  if(!open) return;
  const list=chatEl('chatList'), atEnd=list.scrollHeight-list.scrollTop-list.clientHeight<40;
  const shown=+list.dataset.last||0, first=list.firstElementChild;
  if(!ms.length){ list.textContent=''; const e=document.createElement('div'); e.className='empty'; e.textContent=CHAT.state==='on'?'Сообщений пока нет — напиши первым':'Чат недоступен'; list.append(e); list.dataset.last=0; return; }
  if(!shown||!first||first.classList.contains('empty')||!ms.some(m=>m.id===shown)){ list.textContent=''; ms.forEach(m=>list.append(chatLine(m))); }
  else ms.filter(m=>m.id>shown).forEach(m=>list.append(chatLine(m)));
  while(list.children.length>100) list.firstElementChild.remove();
  list.dataset.last=L.id;
  if(atEnd||shown!==L.id&&L.uid===CHAT.me) list.scrollTop=list.scrollHeight;
}
async function chatPoll(){
  clearTimeout(CHAT.timer);
  try{
    const r=await api('chat'+(CHAT.last?'?after='+CHAT.last:''));
    if(r.ok){ const j=await r.json(); CHAT.me=j.me; CHAT.state='on'; chatMerge(j.messages); }
    else CHAT.state='off';
  }catch(e){ CHAT.state='off'; }
  chatRender();
  CHAT.timer=setTimeout(chatPoll,document.hidden?CHAT_POLL_HIDDEN:chatOpen()?CHAT_POLL_OPEN:CHAT_POLL_CLOSED);
}
async function chatSend(){
  const inp=chatEl('chatIn'), text=inp.value.replace(/\s+/g,' ').trim().slice(0,140);
  if(!text||CHAT.sending||CHAT.state!=='on') return;
  CHAT.sending=true; CHAT.note=''; chatRender();
  try{
    const r=await api('chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,hero:S.hero,lvl:S.lvl})});
    if(r.ok){ chatMerge([(await r.json()).message]); inp.value=''; }
    else CHAT.note=r.status===429?'не так быстро':'не отправлено';
  }catch(e){ CHAT.note='не отправлено'; }
  CHAT.sending=false; chatRender(); inp.focus();
  if(CHAT.note) setTimeout(()=>{ CHAT.note=''; chatRender(); },2500);
}
function chatInit(){
  chatEl('chatBar').onclick=()=>{ const p=chatEl('chatPanel'); p.hidden=!p.hidden;
    if(!p.hidden){ const pr=p.offsetParent||p.parentElement; p.style.bottom=Math.round(pr.getBoundingClientRect().bottom-document.querySelector('.controls').getBoundingClientRect().top+6)+'px'; chatEl('chatList').dataset.last=0; chatPoll(); }
    chatRender(); if(!p.hidden && !chatEl('chatIn').disabled) setTimeout(()=>chatEl('chatIn').focus(),0); };
  chatEl('chatClose').onclick=()=>{ chatEl('chatPanel').hidden=true; chatRender(); };
  chatEl('chatForm').onsubmit=e=>{ e.preventDefault(); chatSend(); };
  chatEl('chatIn').addEventListener('keydown',e=>e.stopPropagation());
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&CHAT.timer) chatPoll(); });
  chatRender();
}
function chatStart(){ if(!CHAT.timer) chatPoll(); }   // вызывается после входа и загрузки сохранения (main.js)
chatInit();
