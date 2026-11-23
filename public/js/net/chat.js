// ---- чат: общий канал и личные беседы; сообщения на сервере (PostgreSQL), опрос GET /api/chat ----
const CHAT={msgs:[],last:0,me:null,blocked:new Set(),state:'wait',sending:false,timer:0,note:'',
  ch:0,          // 0 — общий чат, иначе tg_id собеседника
  opened:new Map(), // беседы, открытые вручную: uid → имя
  reply:null,    // {id,name,text} — на что отвечаем
  get seen(){ return (S&&S.chatSeen)||0; }, set seen(v){ if(S) S.chatSeen=v; }};   // «прочитано» хранится в сохранении
const CHAT_POLL_OPEN=2500, CHAT_POLL_CLOSED=5000, CHAT_POLL_HIDDEN=30000;
const chatEl=id=>document.getElementById(id);
const chatOpen=()=>!chatEl('chatPanel').hidden;
const CHAT_COLS=['#c9a25a','#b98cff','#6ab8ff','#5fd39b','#ff9a6a','#f07ab8','#6ad8e0','#d8c060'];
const colOf=uid=>uid===CHAT.me?'#ffd27a':CHAT_COLS[uid%CHAT_COLS.length];
const chanOf=m=>m.to==null?0:(m.uid===CHAT.me?m.to:m.uid);
const visible=()=>CHAT.msgs.filter(m=>!CHAT.blocked.has(m.uid)&&!(m.to!=null&&CHAT.blocked.has(chanOf(m))));
function seenOf(ch){ if(!ch) return CHAT.seen; return (S&&S.chatSeenDm&&S.chatSeenDm[ch])||0; }
function setSeen(ch,ts){ if(!S) return; if(!ch){ CHAT.seen=ts; return; } (S.chatSeenDm||(S.chatSeenDm={}))[ch]=ts; }
function dmList(){ // собеседники: из сообщений и открытые вручную, свежие первыми
  const m=new Map(); for(const x of visible()) if(x.to!=null){ const ch=chanOf(x); m.set(ch,{uid:ch,name:x.uid===CHAT.me?x.toName:x.name,ts:x.ts}); }
  for(const [uid,name] of CHAT.opened) if(!m.has(uid)&&!CHAT.blocked.has(uid)) m.set(uid,{uid,name,ts:Infinity});
  return [...m.values()].sort((a,b)=>b.ts-a.ts);
}
function unread(ch,list){ const L=list.filter(m=>chanOf(m)===ch).pop(); return !!(L&&L.uid!==CHAT.me&&L.ts>seenOf(ch)); }

function chatMerge(list){
  if(!list||!list.length) return;
  const ids=new Set(CHAT.msgs.map(m=>m.id));
  for(const m of list) if(!ids.has(m.id)){ CHAT.msgs.push(m); ids.add(m.id); }
  CHAT.msgs.sort((a,b)=>a.id-b.id); CHAT.msgs=CHAT.msgs.slice(-300);
  CHAT.last=CHAT.msgs[CHAT.msgs.length-1].id;
}
function chatLine(m){
  const d=document.createElement('div'); d.className='msg'+(m.uid===CHAT.me?' me':''); d.dataset.id=m.id;
  if(m.reply){ const q=document.createElement('div'); q.className='cq'; q.textContent=CHAT.blocked.has(m.reply.uid)?T('↪ сообщение скрыто'):'↪ '+(m.reply.name||'…')+': '+(m.reply.text||T('сообщение удалено')); d.append(q); }
  const n=document.createElement('button'); n.type='button'; n.className='cn'; n.style.color=colOf(m.uid); n.textContent=m.name+(m.lvl?' ['+m.lvl+']':'')+':';
  n.dataset.uid=m.uid; n.dataset.mid=m.id;
  const t=document.createElement('span'); t.className='tx'; t.textContent=m.text;
  const tm=document.createElement('span'); tm.className='ct'; tm.textContent=new Date(m.ts).toLocaleTimeString(LOCALE,{hour:'2-digit',minute:'2-digit'});
  d.append(n,t,tm); return d;
}
function chatTabs(list){
  const box=chatEl('chatTabs'); box.textContent='';
  const tab=(ch,label)=>{ const b=document.createElement('button'); b.type='button'; b.className='ctab'+(CHAT.ch===ch?' on':''); b.dataset.ch=ch;
    b.textContent=label; if(unread(ch,list)&&CHAT.ch!==ch){ const i=document.createElement('i'); b.append(i); } box.append(b); };
  tab(0,T('Общий')); for(const d of dmList()) tab(d.uid,'✉ '+d.name);
}
function chatRender(){
  const list=visible(), L=list[list.length-1], open=chatOpen();
  const last=chatEl('chatLast'); last.textContent='';
  if(L){ const n=document.createElement('span'); n.className='cn'; n.style.color=colOf(L.uid); n.textContent=(L.to!=null?'✉ ':'')+L.name+':'; const t=document.createElement('span'); t.textContent=L.text; last.append(n,t); }
  else { const t=document.createElement('span'); t.className='cm'; t.textContent=CHAT.state==='on'?T('Чат пуст — напиши первым'):CHAT.state==='wait'?T('Чат загружается…'):T('Чат недоступен'); last.append(t); }
  const chans=[0,...dmList().map(d=>d.uid)];
  if(open){ const cl=list.filter(m=>chanOf(m)===CHAT.ch).pop(); if(cl&&cl.ts>seenOf(CHAT.ch)){ setSeen(CHAT.ch,cl.ts); save(); } }
  chatEl('chatDot').hidden=!chans.some(ch=>unread(ch,list)&&!(open&&CHAT.ch===ch));
  const can=CHAT.state==='on';
  chatEl('chatIn').disabled=!can; chatEl('chatSend').disabled=!can||CHAT.sending;
  chatEl('chatIn').placeholder=!can?T('Чат недоступен'):CHAT.ch?T('Личное сообщение…'):T('Сообщение…');
  chatEl('chatState').textContent=CHAT.note||(CHAT.state==='on'?'':CHAT.state==='wait'?T('подключение…'):T('нет связи'));
  const rb=chatEl('chatReply'); rb.hidden=!CHAT.reply;
  if(CHAT.reply){ rb.querySelector('span').textContent='↪ '+CHAT.reply.name+': '+CHAT.reply.text; }
  if(!open) return;
  chatTabs(list);
  const box=chatEl('chatList'), atEnd=box.scrollHeight-box.scrollTop-box.clientHeight<40;
  const ms=list.filter(m=>chanOf(m)===CHAT.ch), ML=ms[ms.length-1];
  const key=CHAT.ch+':'+(ML?ML.id:0)+':'+[...CHAT.blocked].join(','), shown=box.dataset.key||'';
  if(key===shown) return;
  const [sch,sid,sbl]=shown.split(':'), sameCh=sch===String(CHAT.ch)&&sbl===key.split(':')[2]&&box.querySelector('.msg');
  if(!ms.length){ box.textContent=''; const e=document.createElement('div'); e.className='empty';
    e.textContent=CHAT.state!=='on'?T('Чат недоступен'):CHAT.ch?T('Начните беседу — сообщения увидите только вы двое'):T('Сообщений пока нет — напиши первым'); box.append(e); }
  else if(sameCh&&ms.some(m=>m.id===+sid)) ms.filter(m=>m.id>+sid).forEach(m=>box.append(chatLine(m)));
  else { box.textContent=''; ms.forEach(m=>box.append(chatLine(m))); }
  while(box.children.length>120) box.firstElementChild.remove();
  box.dataset.key=key;
  if(!sameCh||atEnd||ML&&ML.uid===CHAT.me) box.scrollTop=box.scrollHeight;
}
async function chatPoll(){
  clearTimeout(CHAT.timer);
  try{
    const r=await api('chat'+(CHAT.last?'?after='+CHAT.last:''));
    if(r.ok){ const j=await r.json(); CHAT.me=j.me; CHAT.blocked=new Set(j.blocked||[]); CHAT.state='on'; chatMerge(j.messages); }
    else CHAT.state='off';
  }catch(e){ CHAT.state='off'; }
  chatRender();
  CHAT.timer=setTimeout(chatPoll,document.hidden?CHAT_POLL_HIDDEN:chatOpen()?CHAT_POLL_OPEN:CHAT_POLL_CLOSED);
}
function chatNote(t){ CHAT.note=t; chatRender(); clearTimeout(chatNote.t); chatNote.t=setTimeout(()=>{ CHAT.note=''; chatRender(); },2600); }
async function chatSend(){
  const inp=chatEl('chatIn'), text=inp.value.replace(/\s+/g,' ').trim().slice(0,140);
  if(!text||CHAT.sending||CHAT.state!=='on') return;
  const keep=document.activeElement===inp;   // клавиатуру оставляем, только если она уже открыта
  CHAT.sending=true; chatRender();
  try{
    const body={text,hero:S.hero,lvl:S.lvl}; if(CHAT.ch) body.to=CHAT.ch; if(CHAT.reply) body.replyTo=CHAT.reply.id;
    const r=await api('chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(r.ok){ chatMerge([(await r.json()).message]); inp.value=''; CHAT.reply=null; }
    else { const er=await r.json().catch(()=>({})); chatNote(r.status===429?T('не так быстро'):er.error==='banned'?T('вы заблокированы в чате'):r.status===403?T('игрок закрыл вам личные сообщения'):T('не отправлено')); }
  }catch(e){ chatNote(T('не отправлено')); }
  CHAT.sending=false; chatRender(); if(keep) inp.focus();
}

/* ---------- меню игрока: Ответить / Беседа / Инфо / Заблокировать ---------- */
function chatMenu(btn){
  const menu=chatEl('chatMenu'), uid=+btn.dataset.uid, m=CHAT.msgs.find(x=>x.id===+btn.dataset.mid); if(!m) return;
  const mine=uid===CHAT.me;
  menu.innerHTML=''; const add=(label,fn,cls)=>{ const b=document.createElement('button'); b.type='button'; b.textContent=label; if(cls) b.className=cls; b.onclick=e=>{ e.stopPropagation(); fn(b); }; menu.append(b); };
  if(!mine){
    add(T('↪ Ответить'),()=>{ CHAT.reply={id:m.id,name:m.name,text:m.text}; chatMenuClose(); chatRender(); chatEl('chatIn').focus(); });
    add(T('✉ Беседа'),()=>{ chatMenuClose(); chatDm(uid,m.name); });
  }
  add(T('ⓘ Инфо'),()=>{ chatMenuClose(); chatInfo(uid); });
  if(!mine) add(T('⛔ Заблокировать'),b=>{ if(!b.dataset.arm){ b.dataset.arm=1; b.textContent=T('Точно заблокировать?'); return; } chatMenuClose(); chatBlock(uid,true); },'danger');
  const pr=chatEl('chatPanel').getBoundingClientRect(), r=btn.getBoundingClientRect();
  menu.hidden=false;
  const h=menu.offsetHeight, w=menu.offsetWidth;
  let top=r.bottom-pr.top+4; if(top+h>pr.height-8) top=r.top-pr.top-h-4;
  menu.style.top=Math.max(4,top)+'px'; menu.style.left=Math.max(6,Math.min(pr.width-w-6,r.left-pr.left))+'px';
}
function chatMenuClose(){ chatEl('chatMenu').hidden=true; }
function chatDm(uid,name){ CHAT.opened.set(uid,name); CHAT.ch=uid; CHAT.reply=null; const p=chatEl('chatPanel'); if(p.hidden) chatEl('chatBar').click(); else chatRender(); }
async function chatBlock(uid,block){
  try{ const r=await api('chat/block',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:uid,block})});
    if(!r.ok) throw 0; CHAT.blocked=new Set((await r.json()).blocked||[]);
    if(block){ CHAT.opened.delete(uid); if(CHAT.ch===uid) CHAT.ch=0; if(CHAT.reply&&CHAT.msgs.some(m=>m.id===CHAT.reply.id&&m.uid===uid)) CHAT.reply=null; }
    chatNote(block?T('игрок заблокирован'):T('игрок разблокирован'));
  }catch(e){ chatNote(T('не получилось')); }
}
function piEquip(p){   // экипировка текущего героя игрока: 10 ячеек, по нажатию — название и характеристики
  const n=Object.keys(p.eq||{}).length;
  const cell=s=>{ const it=p.eq[s]; return it?`<button type="button" class="slot r${it.rar}" data-s="${s}" aria-label="${SLOT_RU[s]}"><img src="${itemIcon(it.cls,s,it.rar)}" alt=""><i class="lv">${it.lvl}</i>${it.en?`<i class="enb">+${it.en}</i>`:''}</button>`
    :`<span class="slot ghost" aria-label="${SLOT_RU[s]}"><img src="${itemIcon(p.hero,s,0)}" alt=""></span>`; };
  return `<div class="pi-sec">${T("Экипировка")} <small>${n}/${SLOTS.length}</small></div><div class="pi-eq">${[...LEFT_SLOTS,...RIGHT_SLOTS].map(cell).join('')}</div>
    <div class="pi-it">${n?T('<small>Нажми на предмет, чтобы посмотреть</small>'):T('<small>Ничего не надето</small>')}</div>`;
}
async function chatInfo(uid){
  const md=$('modal'); md.innerHTML=T('<div class="card pinfo"><p>Загрузка…</p></div>'); md.hidden=false;
  let p; try{ const r=await api('chat/player/'+uid); if(!r.ok) throw 0; p=await r.json(); }
  catch(e){ md.innerHTML=T('<div class="card pinfo"><p>Не удалось загрузить игрока</p><button id="piClose">Закрыть</button></div>'); $('piClose').onclick=()=>{ md.hidden=true; }; return; }
  const H=p.hero&&HEROES[p.hero], date=t=>new Date(t).toLocaleDateString(LOCALE,{day:'numeric',month:'long',year:'numeric'});
  const ago=t=>{ if(!t) return '—'; const s=(Date.now()-t)/1000; return s<300?T('в игре сейчас'):s<3600?Math.floor(s/60)+(' '+T('мин назад')):s<86400?Math.floor(s/3600)+(' '+T('ч назад')):date(t); };
  const pic=p.photo?`<img class="pi-ph" src="${esc(p.photo)}" alt="" referrerpolicy="no-referrer">`:H?`<img class="pi-ph px" src="${PORTS[p.hero]}" alt="">`:'';
  md.innerHTML=`<div class="card pinfo">${pic}<h2 style="color:${colOf(p.id)}">${esc(p.name)}</h2>
    ${p.username?`<a class="pi-un" href="https://t.me/${encodeURIComponent(p.username)}" target="_blank" rel="noopener">@${esc(p.username)}</a>`:''}
    <dl>${p.bm?`<dt>${T("Боевая мощь")}</dt><dd class="pi-bm">${fmt(p.bm)}</dd>`:''}${H?`<dt>${T("Герой")}</dt><dd>${esc(H.name)}</dd>`:''}${p.lvl?`<dt>${T("Уровень")}</dt><dd>${p.lvl}</dd>`:''}${p.best?`<dt>${T("Рекорд")}</dt><dd>${T("зона")} ${p.best}</dd>`:''}
    <dt>${T("Был в игре")}</dt><dd>${ago(p.seen)}</dd><dt>${T("Играет с")}</dt><dd>${date(p.since)}</dd><dt>${T("Сообщений в чате")}</dt><dd>${p.msgs}</dd></dl>
    ${H?piEquip(p):''}
    ${p.me?'':`<div class="pi-btns"><button id="piDm">${T("✉ Написать")}</button><button id="piBlock" class="sec-btn">${p.blocked?T('Разблокировать'):T('⛔ Заблокировать')}</button></div>`}
    <button id="piClose" class="sec-btn">${T("Закрыть")}</button></div>`;
  const close=()=>{ md.hidden=true; };
  const eqBox=md.querySelector('.pi-eq');
  if(eqBox) eqBox.onclick=e=>{ const b=e.target.closest('.slot[data-s]'); if(!b) return; const it=p.eq[b.dataset.s];
    eqBox.querySelectorAll('.slot').forEach(x=>x.classList.toggle('sel',x===b));
    md.querySelector('.pi-it').innerHTML=`<b style="color:${RAR[it.rar].col}">${esc(itemName(it))}</b><small>${RAR[it.rar].name}${T(", ур.")} ${it.lvl} · ${SLOT_RU[it.slot]}</small><ul>${statLines(effSt(it))}</ul>`; };
  $('piClose').onclick=close; md.onclick=e=>{ if(e.target===md){ close(); md.onclick=null; } };
  if(!p.me){
    $('piDm').disabled=p.blocked; $('piDm').onclick=()=>{ close(); chatDm(p.id,p.name.split(' ')[0]); };
    const bb=$('piBlock'); bb.onclick=async()=>{ if(!p.blocked&&!bb.dataset.arm){ bb.dataset.arm=1; bb.textContent=T('Точно заблокировать?'); return; } await chatBlock(p.id,!p.blocked); close(); };
  }
}

function chatInit(){
  chatEl('chatBar').onclick=()=>{ const p=chatEl('chatPanel'); p.hidden=!p.hidden; chatMenuClose();
    if(!p.hidden){ const pr=p.offsetParent||p.parentElement; p.style.bottom=Math.round(pr.getBoundingClientRect().bottom-document.querySelector('.controls').getBoundingClientRect().top+6)+'px'; chatEl('chatList').dataset.key=''; chatPoll(); }
    chatRender(); };   // клавиатуру не открываем — фокус только когда игрок сам нажмёт на поле ввода
  chatEl('chatClose').onclick=()=>{ chatEl('chatPanel').hidden=true; chatMenuClose(); chatRender(); };
  chatEl('chatForm').onsubmit=e=>{ e.preventDefault(); chatSend(); };
  chatEl('chatIn').addEventListener('keydown',e=>e.stopPropagation());
  chatEl('chatList').addEventListener('click',e=>{ const b=e.target.closest('.cn'); if(b){ e.stopPropagation(); chatMenu(b); } else chatMenuClose(); });
  chatEl('chatTabs').addEventListener('click',e=>{ const b=e.target.closest('.ctab'); if(!b) return; CHAT.ch=+b.dataset.ch; CHAT.reply=null; chatMenuClose(); chatRender(); });
  chatEl('chatReply').querySelector('button').onclick=()=>{ CHAT.reply=null; chatRender(); };
  chatEl('chatPanel').addEventListener('click',e=>{ if(!e.target.closest('#chatMenu,.cn')) chatMenuClose(); });
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&CHAT.timer) chatPoll(); });
  chatRender();
}
function chatStart(){ if(!CHAT.timer) chatPoll(); }   // вызывается после входа и загрузки сохранения (main.js)
chatInit();
