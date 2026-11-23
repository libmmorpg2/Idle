// ---- друзья и реферальная ссылка (профиль → «Друзья») ----
let PTAB='set';                       // вкладка профиля: set — настройки, friends — друзья
const FRND={data:null,loading:null,claiming:false};
function friendsLoad(){
  if(FRND.loading) return FRND.loading;
  FRND.loading=api('friends').then(r=>r.ok?r.json():null).then(d=>{ if(d) FRND.data=d; }).catch(()=>{})
    .finally(()=>{ FRND.loading=null; friendsDot(); friendsRender(); });
  return FRND.loading;
}
function friendsDot(){ const on=!!(FRND.data&&FRND.data.pending>0); const d=$('dot-profile'); if(d) d.hidden=!on; const t=document.querySelector('[data-ptab="friends"] i'); if(t) t.hidden=!on; }
function friendsRender(){
  const box=$('friendsBox'); if(!box) return; const d=FRND.data;
  if(!d){ box.innerHTML=`<p class="note fr-load">${T('Загрузка…')}</p>`; return; }
  const st=`<img class="stn" src="${STONE_ICON}" alt="">`;
  const row=f=>`<div class="fr-row"><img class="fr-pic" src="${f.hero&&PORTS[f.hero]?PORTS[f.hero]:PORTS.mage}" alt="">
    <span class="fr-nm"><b>${esc(f.name)}</b><small>${f.lvl?`${T('Ур.')} ${f.lvl}`:T('ещё не играл')}${f.bm?` · ${T('БМ')} ${fmt(f.bm)}`:''}</small></span>
    <em class="${f.goal?'ok':''}">${f.goal?`✓ ${d.goal} ${T('ур.')}`:`${T('до')} ${d.goal} ${T('ур.')}`}</em></div>`;
  box.innerHTML=`<div class="frame fr-inv"><div class="ftitle">${T('Пригласи друзей')}</div>
      <p class="note">${T('Отправь другу свою ссылку. Когда он впервые зайдёт в игру, вы оба получите осколки души:')}</p>
      <ul class="fr-rw">
        <li><b>${st}+${d.reward.join}</b><span>${T('тебе — за каждого друга')}</span></li>
        <li><b>${st}+${d.reward.lvl10}</b><span>${T('тебе — когда друг достигнет {n} уровня').replace('{n}',d.goal)}</span></li>
        <li><b>${st}+${d.reward.welcome}</b><span>${T('другу — за вход по твоей ссылке')}</span></li></ul>
      <div class="fr-link"><input id="frLink" readonly value="${esc(d.link)}" aria-label="${T('Твоя ссылка')}"><button type="button" id="frCopy">${T('Копировать')}</button></div>
      <button type="button" class="fr-share" id="frShare">👥 ${T('Пригласить друга')}</button></div>
    <div class="frame fr-rew"><div class="ftitle">${T('Награды')}</div>
      <div class="fr-sum"><span>${T('Получено всего')}<b>${st}${d.total-d.pending}</b></span><span>${T('Можно забрать')}<b class="${d.pending?'hot':''}">${st}${d.pending}</b></span></div>
      <button type="button" id="frClaim" class="fr-claim"${d.pending&&!FRND.claiming?'':' disabled'}>${d.pending?`${T('Забрать')} +${d.pending}`:T('Нет новых наград')}</button></div>
    <div class="frame fr-list"><div class="ftitle">${T('Друзья')} · ${d.friends.length}</div>
      ${d.friends.length?d.friends.map(row).join(''):`<p class="note">${T('Пока никого — отправь ссылку другу!')}</p>`}</div>
    ${d.invitedBy?`<p class="note fr-by">${T('Тебя пригласил(а)')} <b>${esc(d.invitedBy)}</b></p>`:''}`;
}
function friendsShareText(){ return T('Залетай в Rampage — idle RPG прямо в Telegram! ⚔️'); }
async function friendsCopy(btn){
  const v=FRND.data&&FRND.data.link; if(!v) return;
  try{ await navigator.clipboard.writeText(v); }catch(e){ const i=$('frLink'); i.select(); try{ document.execCommand('copy'); }catch(_){} }
  btn.textContent=T('Скопировано ✓'); setTimeout(()=>{ if(btn.isConnected) btn.textContent=T('Копировать'); },1800);
}
async function friendsShare(){
  const link=FRND.data&&FRND.data.link; if(!link) return; const text=friendsShareText();
  const url=`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
  if(TG&&TG.openTelegramLink){ TG.openTelegramLink(url); return; }
  if(navigator.share){ try{ await navigator.share({title:'Rampage',text,url:link}); return; }catch(e){ if(e&&e.name==='AbortError') return; } }
  window.open(url,'_blank','noopener');
}
async function friendsClaim(){
  if(FRND.claiming) return; FRND.claiming=true; friendsRender();
  try{ const r=await api('friends/claim',{method:'POST'}); const j=r.ok?await r.json():{stones:0};
    if(j.stones>0){ S.stones=(S.stones||0)+j.stones; SND.play('buy'); banner(T('Награда за друзей'),`+${j.stones} ${T('осколков души')}`,1.8); save(); renderPanel(); } }
  catch(e){}
  FRND.claiming=false; await friendsLoad();
}
$('list').addEventListener('click',e=>{
  const pt=e.target.closest('[data-ptab]'); if(pt){ PTAB=pt.dataset.ptab; renderPanel(); return; }
  if(e.target.closest('#frCopy')) return friendsCopy(e.target.closest('#frCopy'));
  if(e.target.closest('#frShare')) return friendsShare();
  if(e.target.closest('#frClaim')) return friendsClaim();
});
