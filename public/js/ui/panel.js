/* ---------- panel ---------- */
function bulk(costFn,level,max){
  const m=S.mult; let n=0,t=0,l=level;
  while((m===0||n<m) && (max==null||l<max)){
    const c=costFn(l); if(m===0 && t+c>S.gold) break; t+=c; n++; l++;
    if(m===0 && n>500) break;
  }
  return [n,t];
}
const SK_BOOKS=5, SK_CH=0.30;
function skillTry(key,gold,ok){ const c=S.hero; if(S.gold<gold||bookN(c,key)<SK_BOOKS) return;
  S.gold-=gold; S.books[c][key]-=SK_BOOKS;
  if(Math.random()<SK_CH){ ok(); banner(T('Навык улучшен'),bookName(c,key),1.4); } else banner(T('Неудача'),`${SK_BOOKS} ${T("книг потрачено, навык не улучшен")}`,1.6);
  buildSkillButtons(); renderPanel(); save(); }
const upBtn=(id,data,key)=>`<button class="buy" id="${id}" ${data}><small></small><span class="c"><span class="coin"></span><span class="v"></span></span><span class="c bkc"><img class="bk" src="${bookIcon(S.hero,key)}" alt=""><span class="bv"></span></span></button>`;
function learnBtn(key,locked){ const n=bookN(S.hero,key);
  return `<button class="buy learn" data-learn="${key}" ${n&&!locked?'':'disabled'}><small>${locked?T('рано'):T('изучить')}</small><span class="c"><img class="bk" src="${bookIcon(S.hero,key)}" alt="">${n}/1</span></button>`; }
function renderPanel(){
  if(S.tab==='reborn') S.tab='hero';
  const list=$('list'); const tab=S.tab;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===(sheetOpen?tab:'battle')));
  $('sheetTitle').textContent={hero:T('Улучшения'),skill:T('Умения'),bag:T('Сумка'),map:T('Локации'),shop:T('Магазин'),profile:T('Профиль')}[tab]||T('Герой');
  $('mult').style.visibility=(tab==='bag'||tab==='map'||tab==='shop'||tab==='profile')?'hidden':'visible';
  document.querySelectorAll('#mult button').forEach(b=>b.classList.toggle('on',+b.dataset.m===S.mult));
  let h='', sec='';
  if(tab==='hero'){
    const bm=calcBM();
    h+=`<div class="bmcard"><span>${T("Боевая мощь")}</span><b>${fmt(bm)}</b><div class="bmrow"><i>${T("Урон")} <em>${fmt(st.atk())}</em></i><i>${T("Скор.")} <em>${(()=>{const b=buff.power;buff.power=0;const v=st.aps();buff.power=b;return v.toFixed(2);})()}</em></i><i>${T("Крит")} <em>${Math.round(st.crit()*100)}%</em></i><i>${T("Здоровье")} <em>${fmt(st.maxHp())}</em></i></div></div>`;
    h+=`<button class="pk-open" data-picker="1"><img src="${PORTS[S.hero]}" alt=""><span><b>${HD.name}</b><small>${HEROES_ROLE[S.hero]||''} ${T("· сменить героя")}</small></span><em>›</em></button><div class="sec">${T("Улучшения")}</div>`;
    UPG.forEach(u=>{
      const lv=S.upg[u.id];
      h+=`<div class="row"><div class="tag">${u.tag}</div><div class="info"><h3>${nm(u.name)}<span>${T("ур.")} ${lv}</span></h3><p>${u.info()}</p></div>
      <button class="buy" id="buy-${u.id}" data-u="${u.id}"><small></small><span class="c"><span class="coin"></span><span class="v"></span></span><span class="c st"><img class="stn" src="${STONE_ICON}" alt=""><span class="sv"></span></span><span class="c sl"><span class="gem"></span><span class="slv"></span></span></button></div>`;
    });
  } else if(tab==='skill'){
    h+=`<div class="sec">${T("Активные умения")}</div>`;
    SK.forEach((s,i)=>{
      const lv=S.sk[i], locked=S.lvl<s.unlock, key='a'+i, ln=isL(S.hero,key);
      h+=`<div class="row ${ln?'':'nolearn'}"><div class="tag"><canvas id="ti${i}"></canvas></div><div class="info"><h3>${s.name}<span>${ln?(T('ур.')+' ')+lv:T('не изучен')}</span></h3><p>${!ln?`${s.info(lv)}<br><em class="needbk">${T("Нужна книга «")}${s.name}»${locked?` ${T("· с ур.")} ${s.unlock}`:''}</em>`:locked?`${T("Откроется на уровне")} ${s.unlock}`:s.info(lv)+` ${T("· перезарядка")} ${+(s.cd*(1-pv('cdr')/100)).toFixed(1)} ${T("с")}`}</p></div>
      ${ln?upBtn('bsk-'+i,`data-s="${i}"`,key):learnBtn(key,locked)}</div>`;
    });
    h+=`<div class="sec">${T("Пассивные навыки")}</div>`;
    PSV[S.hero].forEach(p=>{
      const lv=S.psv[S.hero][p.id]||0, locked=S.lvl<p.unlock, c=PSV_COL[p.ic], key='p'+p.id, ln=isL(S.hero,key);
      h+=`<div class="row ${locked||!ln?'plock':''} ${ln?'':'nolearn'}"><div class="tag psv"><img src="${pixIcon(PSV_ICON[p.ic],c[0],c[1])}" alt=""></div><div class="info"><h3>${p.name}<span>${ln?`${T("ур.")} ${lv}/${p.max}`:T('не изучен')}</span></h3><p>${!ln?`${T("За уровень +")}${p.per}${p.unit}<br><em class="needbk">${T("Нужна книга «")}${p.name}»${locked?` ${T("· с ур.")} ${p.unlock}`:''}</em>`:locked?`${T("Откроется на уровне")} ${p.unlock}`:`${T("Сейчас")} <b>+${+(lv*p.per).toFixed(1)}${p.unit}</b> ${T("· за уровень +")}${p.per}`}</p></div>
      ${ln?upBtn('bps-'+p.id,`data-p="${p.id}"`,key):learnBtn(key,locked)}</div>`;
    });
  } else if(tab==='bag'){
    h+=bagHTML();
  } else if(tab==='shop'){
    h+=shopHTML();
  } else if(tab==='map'){
    h+=mapHTML();
  } else {
  }
  if(tab==='profile'){
    h+=`<div class="ptabs"><button type="button" data-ptab="set" class="${PTAB==='set'?'on':''}">⚙ ${T("Настройки")}</button><button type="button" data-ptab="friends" class="${PTAB==='friends'?'on':''}">👥 ${T("Друзья")}<i ${FRND.data&&FRND.data.pending?'':'hidden'}></i></button></div>`;
    if(PTAB==='friends') h+=`<div id="friendsBox"></div>`;
    else {
    const sc=S.snd||{sfx:true,mus:true};
    h+=`<div class="frame snd"><div class="ftitle">${T("Звук")}</div>
      <div class="farmtog"><span><b>${T("Звуки")}</b><small>${T("Удары, выстрелы, заклинания, добыча")}</small></span><button class="sw ${sc.sfx?'on':''}" data-snd="sfx" role="switch" aria-checked="${!!sc.sfx}" aria-label="${T("Звуки")}"><i></i></button></div>
      <div class="farmtog"><span><b>${T("Музыка")}</b><small>${T("Спокойная тема в зонах, боевая в бою с боссом")}</small></span><button class="sw ${sc.mus?'on':''}" data-snd="mus" role="switch" aria-checked="${!!sc.mus}" aria-label="${T("Музыка")}"><i></i></button></div></div>`;
    h+=`<div class="frame ton"><div class="ftitle">${T("TON-кошелёк")}</div><div class="tonbox" id="tonBox"></div></div>`;
    if(AUTH.user&&AUTH.user.admin) h+=`<a class="adm-link" href="/admin">🛠 ${T("Админ-панель")}</a>`;
    h+=`<div class="frame lang"><div class="ftitle">${T("Язык")}</div><div class="langs">${LANGS.map(l=>`<button type="button" data-lang="${l.id}" class="${l.id===LANG?'on':''}"><span>${l.flag}</span>${l.name}</button>`).join('')}</div></div>`;
      }
  }
  list.innerHTML=h;
  if(tab==='map') afterMap();
  if(tab==='skill' && imgReady) SK.forEach((s,i)=>frameThumb($('ti'+i),s.who,s.icon[0],s.icon[1]));
  if(tab==='profile'){ if(PTAB==='friends'){ friendsRender(); friendsLoad(); } else tonMount(); }
  panelTick();
}
function panelTick(){
  if(S.tab==='hero') UPG.forEach(u=>{
    const b=$('buy-'+u.id); if(!b) return; const lv=S.upg[u.id];
    if(u.max!=null && lv>=u.max){ b.disabled=true; b.querySelector('small').textContent=T('МАКС'); b.querySelector('.v').textContent='—'; b.querySelector('.sv').textContent='—'; return; }
    const [n,g,s,so]=bulkU(u); const soN=n?so:soulCostU(lv);
    const sl=b.querySelector('.c.sl'); sl.hidden=!soN; b.querySelector('.slv').textContent=soN; sl.classList.toggle('lack',soN>S.souls);
    b.querySelector('small').textContent='+'+(n||1)+(' '+T('ур.'));
    b.querySelector('.v').textContent=fmt(n?g:upCost(u,lv));
    const sN=n?s:stoneCost(lv); b.querySelector('.c.st').hidden=!sN;
    const sv=b.querySelector('.sv'); sv.textContent=fmt(n?s:stoneCost(lv)); sv.parentNode.classList.toggle('lack',(n?s:stoneCost(lv))>S.stones);
    b.querySelector('.v').parentNode.classList.toggle('lack',(n?g:upCost(u,lv))>S.gold);
    b.disabled=!(n&&S.gold>=g&&S.stones>=s&&S.souls>=so);
  });
  const skBtn=(b,key,gold,locked,maxed)=>{
    if(maxed){ b.disabled=true; b.querySelector('small').textContent=T('МАКС'); b.querySelector('.v').textContent='—'; b.querySelector('.bv').textContent='—'; return; }
    const bn=bookN(S.hero,key);
    b.querySelector('small').textContent=locked?T('закрыто'):`${T("шанс")} ${Math.round(SK_CH*100)}%`;
    b.querySelector('.v').textContent=fmt(gold); b.querySelector('.v').parentNode.classList.toggle('lack',gold>S.gold);
    b.querySelector('.bv').textContent=`${bn}/${SK_BOOKS}`; b.querySelector('.bkc').classList.toggle('lack',bn<SK_BOOKS);
    b.disabled=locked||S.gold<gold||bn<SK_BOOKS; };
  if(S.tab==='skill') PSV[S.hero].forEach(p=>{ const b=$('bps-'+p.id); if(!b) return; const lv=S.psv[S.hero][p.id]||0; skBtn(b,'p'+p.id,psCost(p,lv),S.lvl<p.unlock,lv>=p.max); });
  if(S.tab==='skill') SK.forEach((s,i)=>{ const b=$('bsk-'+i); if(!b) return; skBtn(b,'a'+i,skCost(i,S.sk[i]),S.lvl<s.unlock,false); });
}
$('list').addEventListener('click',ev=>{
  const ch=ev.target.closest('.char'); if(ch){ switchHero(ch.dataset.hero); return; }
  if(ev.target.closest('[data-picker]')){ openPicker(); return; }
  const det=ev.target.closest('[data-det]'); if(det){ locOpen=locOpen===det.dataset.det?'':det.dataset.det; renderPanel(); return; }
  const go=ev.target.closest('[data-go]'); if(go){ const L=LOCS[+go.dataset.go]; goZone(Math.min(L.to,S.best)); return; }
  const zc=ev.target.closest('[data-zone]'); if(zc){ goZone(+zc.dataset.zone); return; }
  const zo=ev.target.closest('[data-zopen]'); if(zo){ const z=+zo.dataset.zopen; zoneOpen=zoneOpen===z?null:z; renderPanel(); return; }
  const zb=ev.target.closest('[data-boss]'); if(zb){ fightBoss(+zb.dataset.boss); return; }
  const zl=ev.target.closest('[data-zloot]'); if(zl){ openZoneLoot(+zl.dataset.zloot); return; }
  if(ev.target.closest('#stayTog')){ S.stay=!S.stay; save(); renderPanel(); return; }
  const sh=ev.target.closest('[data-shop]'); if(sh){ shopTab=sh.dataset.shop; renderPanel(); return; }
  const gb=ev.target.closest('[data-gbuy]'); if(gb){ if(!gb.disabled) gramBuy(gb.dataset.gbuy); return; }
  if(ev.target.closest('[data-gtopup]')){ gramTopupModal(); return; }
  const pd=ev.target.closest('[data-potdrink]'); if(pd){ potDrink(pd.dataset.potdrink); return; }
  const chip=ev.target.closest('.chip[data-f]'); if(chip){ bagFilter=chip.dataset.f; renderPanel(); return; }
  const ow=ev.target.closest('[data-own]'); if(ow){ const [k,i]=ow.dataset.own.split(':'); ownModal(k,i); return; }
  const stb=ev.target.closest('.item.stack'); if(stb){ openStack(stb.dataset.st); return; }
  const itb=ev.target.closest('.item'); if(itb){ const it=S.inv.bag.find(x=>x.id==itb.dataset.it); if(it) openItem(it,false); return; }
  const sl=ev.target.closest('.slot[data-eq]'); if(sl){ const it=S.inv.eq[S.hero][sl.dataset.eq]; if(it) openItem(it,true); return; }
  if(ev.target.id==='sellCommon'){ let g=0; S.inv.bag=S.inv.bag.filter(x=>{ if(x.rar===0){ g+=sellPrice(x); return false; } return true; }); S.gold+=g; renderPanel(); save(); return; }
  const sd=ev.target.closest('[data-snd]'); if(sd){ const c=S.snd||(S.snd={sfx:true,mus:true}); c[sd.dataset.snd]=!c[sd.dataset.snd]; SND.apply(); sndBtnSync(); save(); renderPanel(); return; }
  const b=ev.target.closest('.buy'); if(!b||b.disabled) return; SND.play('buy');
  if(b.dataset.u){ const u=UPG.find(x=>x.id===b.dataset.u); const [n,g,s,so]=bulkU(u); if(n&&S.gold>=g&&S.stones>=s&&S.souls>=so){S.gold-=g;S.stones-=s;S.souls-=so;S.upg[u.id]+=n;} }
  if(b.dataset.learn){ learnKey(b.dataset.learn); return; }
  if(b.dataset.p){ const p=PSV[S.hero].find(x=>x.id===b.dataset.p); const L=S.psv[S.hero]; const lv=L[p.id]||0; if(lv<p.max) skillTry('p'+p.id,psCost(p,lv),()=>{ L[p.id]=lv+1; }); return; }
  if(b.dataset.s){ const i=+b.dataset.s; skillTry('a'+i,skCost(i,S.sk[i]),()=>{ S.sk[i]++; }); return; }
  renderPanel(); save();
});
let sheetOpen=false;
function setSheet(open){ sheetOpen=open; const sh=$('sheet'); sh.classList.toggle('open',open); sh.setAttribute('aria-hidden',String(!open)); try{ sh.inert=!open; }catch(e){} renderPanel(); }
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  const tab=t.dataset.tab;
  if(tab==='battle' || (sheetOpen && S.tab===tab)) { setSheet(false); return; }
  S.tab=tab; if(tab==='map') zoneOpen=S.zone; $('list').scrollTop=0; setSheet(true);
});
$('sheetClose').onclick=()=>setSheet(false);
$('cv').addEventListener('click',()=>{ if(sheetOpen) setSheet(false); });
$('potBar').addEventListener('click',()=>{ shopTab='pot'; S.tab='shop'; $('list').scrollTop=0; setSheet(true); });
(()=>{ let y0=null; const h=$('sheetHead');
  h.addEventListener('touchstart',e=>{ y0=e.touches[0].clientY; },{passive:true});
  h.addEventListener('touchmove',e=>{ if(y0==null) return; const dy=Math.max(0,e.touches[0].clientY-y0); $('sheet').style.transform=`translateY(${dy}px)`; },{passive:true});
  h.addEventListener('touchend',e=>{ if(y0==null) return; const dy=(e.changedTouches[0].clientY-y0); $('sheet').style.transform=''; y0=null; if(dy>60) setSheet(false); });
})();
document.querySelectorAll('#mult button').forEach(b=>b.onclick=()=>{S.mult=+b.dataset.m;renderPanel();});
function syncToggles(){
  $('tgAuto').classList.toggle('on',S.auto); $('tgAuto').setAttribute('aria-pressed',S.auto);
  $('tgFast').classList.toggle('on',S.fast); $('tgFast').setAttribute('aria-pressed',S.fast);
}
$('tgAuto').onclick=()=>{S.auto=!S.auto;syncToggles();save();};
$('tgFast').onclick=()=>{S.fast=!S.fast;syncToggles();save();};

function newGame(){
  const keep={auto:S.auto,fast:S.fast};
  S=Object.assign(JSON.parse(JSON.stringify(DEF)),keep); S.inv=null; applyHero(); invInit();
  enemies=[]; arrows=[]; rains=[]; fxs=[]; parts=[]; floats=[]; buff.power=0; buff.guard=0; buff.shield=0; buff.shieldT=0; bossT=0; skCd=[0,0,0,0,0];
  hero.dead=false; hero.hp=st.maxHp(); setState('run'); layers=null;
  $('pic').style.backgroundImage=`url(${HUDP[S.hero]})`;
  buildSkillButtons(); setSheet(false); banner(T('Новая игра'),T('Путь начинается заново'),2); save(); openPicker(true);
}
function switchHero(id){
  if(!HEROES[id] || id===S.hero) return;
  S.hero=id; applyHero();
  skCd=[0,0,0,0,0]; buff.power=0; arrows=[]; rains=[]; fxs=[];
  if(!hero.dead) setState('run');
  $('pic').style.backgroundImage=`url(${HUDP[S.hero]})`;
  banner(HD.name,T('вступает в бой'),1.4); buildSkillButtons(); renderPanel(); save();
}
