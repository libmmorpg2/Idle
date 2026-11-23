// ---- shared chat (artifact db) ----
const CHAT={db:null,user:null,uid:null,docs:[],mine:[],ro:false,sending:false,seen:+(()=>{try{return localStorage.getItem('chatSeen')||0}catch(e){return 0}})(),state:'off'};
const chatEl=id=>document.getElementById(id);
function chatMsgs(){ const out=[]; for(const d of CHAT.docs) for(const m of (d.msgs||[])) if(m&&typeof m.t==='string') out.push({uid:d.id,t:m.t.slice(0,140),ts:+m.ts||0,h:m.h,l:m.l}); return out.sort((a,b)=>a.ts-b.ts).slice(-60); }
async function chatNames(ids){ const r={}; let ps={}; if(CHAT.user&&ids.length){ try{ ps=await CHAT.user.profiles(ids); }catch(e){} } return ps; }
function nameOf(m,ps){ const p=ps[m.uid]; return (p&&p.name)||((HEROES[m.h]&&HEROES[m.h].name)||'Игрок')+(m.l?' '+m.l:''); }
function colOf(m,ps){ const p=ps[m.uid]; return (p&&p.color)||'#c9a25a'; }
async function chatRender(){
  const ms=chatMsgs(); const ids=[...new Set(ms.map(m=>m.uid))]; const ps=await chatNames(ids);
  const last=chatEl('chatLast'); last.textContent='';
  const L=ms[ms.length-1];
  if(L){ const n=document.createElement('span'); n.className='cn'; n.style.color=colOf(L,ps); n.textContent=nameOf(L,ps)+':'; const t=document.createElement('span'); t.textContent=L.t; last.append(n,t); }
  else { const t=document.createElement('span'); t.className='cm'; t.textContent=CHAT.state==='off'?'Чат недоступен в этом окне':'Чат пуст — напиши первым'; last.append(t); }
  const open=!chatEl('chatPanel').hidden;
  if(open && L && L.ts>CHAT.seen){ CHAT.seen=L.ts; try{localStorage.setItem('chatSeen',L.ts)}catch(e){} }
  chatEl('chatDot').hidden=!(L && L.ts>CHAT.seen && L.uid!==CHAT.uid);
  if(!open) return;
  const list=chatEl('chatList'); const atEnd=list.scrollHeight-list.scrollTop-list.clientHeight<30; list.textContent='';
  if(!ms.length){ const e=document.createElement('div'); e.className='empty'; e.textContent=CHAT.state==='off'?'Чат работает только в опубликованной игре':'Сообщений пока нет'; list.append(e); }
  for(const m of ms){ const d=document.createElement('div'); d.className='msg'; const n=document.createElement('span'); n.className='cn'; n.style.color=colOf(m,ps); n.textContent=nameOf(m,ps)+':'; const t=document.createElement('span'); t.textContent=m.t; const tm=document.createElement('span'); tm.className='ct'; tm.textContent=new Date(m.ts).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}); d.append(n,t,tm); list.append(d); }
  if(atEnd||open) list.scrollTop=list.scrollHeight;
  const can=CHAT.state==='on' && CHAT.uid && !CHAT.ro;
  chatEl('chatIn').disabled=!can; chatEl('chatSend').disabled=!can||CHAT.sending;
  chatEl('chatIn').placeholder=can?'Сообщение…':(CHAT.state!=='on'?'Чат недоступен':'Только чтение');
  chatEl('chatState').textContent=CHAT.state==='on'?(can?'':'нет прав писать'):'офлайн';
}
async function chatSend(){
  const inp=chatEl('chatIn'); const t=inp.value.replace(/\s+/g,' ').trim().slice(0,140);
  if(!t||CHAT.sending||!CHAT.uid||CHAT.ro) return;
  CHAT.sending=true; chatRender();
  const ts=Date.now(); const msgs=[...CHAT.mine,{t,ts,h:S.hero,l:S.lvl}].slice(-20);
  try{ await CHAT.db.doc('chat/'+CHAT.uid).set({msgs,last:ts}); CHAT.mine=msgs; inp.value=''; }
  catch(e){ if(e&&e.code==='invalid_argument') CHAT.ro=true; else if(e&&e.code==='quota_exceeded') chatEl('chatState').textContent='чат переполнен'; }
  CHAT.sending=false; chatRender();
}
function chatInit(){
  chatEl('chatBar').onclick=()=>{ const p=chatEl('chatPanel'); p.hidden=!p.hidden; if(!p.hidden){ const pr=p.offsetParent||p.parentElement; p.style.bottom=Math.round(pr.getBoundingClientRect().bottom-document.querySelector('.controls').getBoundingClientRect().top+6)+'px'; } chatRender(); if(!p.hidden && !chatEl('chatIn').disabled) setTimeout(()=>chatEl('chatIn').focus(),0); };
  chatEl('chatClose').onclick=()=>{ chatEl('chatPanel').hidden=true; chatRender(); };
  chatEl('chatForm').onsubmit=e=>{ e.preventDefault(); chatSend(); };
  chatEl('chatIn').addEventListener('keydown',e=>e.stopPropagation());
  chatRender();
  if(!(window.claude&&window.claude.use)) return;
  Promise.all([window.claude.use('db'),window.claude.use('user')]).then(async([db,user])=>{
    if(!db) return; CHAT.db=db; CHAT.user=user; CHAT.state='on';
    try{ CHAT.uid=user?await user.id():null; }catch(e){}
    try{ if(user && user.can && await user.can('data.write')===false) CHAT.ro=true; }catch(e){}
    db.collection('chat').orderBy('last','desc').limit(40).onSnapshot(s=>{ CHAT.docs=s.docs.map(d=>Object.assign({id:d.id},d.data())); const me=CHAT.docs.find(d=>d.id===CHAT.uid); if(me&&!CHAT.sending) CHAT.mine=(me.msgs||[]).slice(-20); chatRender(); }, ()=>{ CHAT.state='off'; chatRender(); });
    chatRender();
  }).catch(()=>{});
}
chatInit();
