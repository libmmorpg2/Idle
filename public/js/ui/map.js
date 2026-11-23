/* ---------- locations page ---------- */
const BASE_NAMES={
  mage:{weapon:T('Посох'),helm:T('Шляпа'),armor:T('Мантия'),gloves:T('Перчатки'),belt:T('Кушак'),pants:T('Поножи'),boots:T('Сапоги'),cloak:T('Накидка'),amulet:T('Амулет'),ring:T('Кольцо')},
  tank:{weapon:T('Секира'),helm:T('Шлем'),armor:T('Кольчуга'),gloves:T('Рукавицы'),belt:T('Пояс'),pants:T('Поножи'),boots:T('Сапоги'),cloak:T('Накидка'),amulet:T('Знак'),ring:T('Перстень')},
  asn:{weapon:T('Кинжал'),helm:T('Капюшон'),armor:T('Куртка'),gloves:T('Перчатки'),belt:T('Перевязь'),pants:T('Штаны'),boots:T('Сапоги'),cloak:T('Накидка'),amulet:T('Медальон'),ring:T('Кольцо')},
  sam:{weapon:T('Лук'),helm:T('Капюшон'),armor:T('Доспех'),gloves:T('Наручи'),belt:T('Пояс'),pants:T('Штаны'),boots:T('Сапоги'),cloak:T('Накидка'),amulet:T('Амулет'),ring:T('Кольцо')},
};
const GRADE_GEN={mage:[T('ученика'),T('адепта'),T('чародея'),T('колдуна'),T('архимага'),T('вечности')],tank:[T('юнги'),T('хускарла'),T('воина'),T('ярла'),T('конунга'),T('вечности')],asn:[T('вора'),T('тени'),T('убийцы'),T('мастера ядов'),T('легенды'),T('вечности')],sam:[T('новичка'),T('охотника'),T('следопыта'),T('рейнджера'),T('древнего леса'),T('вечности')]};
const GRADE_MUL=[1,1.6,2.4,3.5,5,7];
const gradeName=(c,s,r)=>LANG==="ru"?`${BASE_NAMES[c][s]} ${GRADE_GEN[c][r]}`:`${GRADE_GEN[c][r]} ${BASE_NAMES[c][s]}`;   // в английском прилагательное впереди
function itemName(it){ return (it.en?`+${it.en} `:'')+gradeName(it.cls,it.slot,it.rar); }
function itemNameOld(it){ const L=it.set&&LOCS.find(l=>l.id===it.set); const n=L?`${BASE_NAMES[it.cls][it.slot]} ${L.gen}`:ITEM_NAMES[it.cls][it.slot]; return (it.en?`+${it.en} `:'')+n; }
let locOpen=null;
function paintBanner(cv,L){
  const th=THEMES[L.theme], W=160, H=56; cv.width=W; cv.height=H; const x=cv.getContext('2d');
  const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,th.sky[0]); g.addColorStop(.6,th.sky[1]); g.addColorStop(1,th.sky[2]); x.fillStyle=g; x.fillRect(0,0,W,H);
  const r=seeded(L.from*97+5);
  for(let i=0;i<30;i++){ x.fillStyle=`rgba(255,240,230,${(0.2+r()*0.6).toFixed(2)})`; x.fillRect(Math.floor(r()*W),Math.floor(r()*24),1,1); }
  x.fillStyle=th.moon; x.beginPath(); x.arc(W*0.82,12,5,0,7); x.fill();
  for(let i=0;i<W;i++){ const y=Math.round(28+Math.sin(i/W*Math.PI*4+L.from)*5+Math.sin(i/W*Math.PI*9)*2); x.fillStyle=th.far; x.fillRect(i,y,1,H-y); x.fillStyle=th.far2; x.fillRect(i,y,1,1); }
  x.fillStyle=th.mid; for(let i=0;i<9;i++){ const px=Math.floor(r()*W), h=8+r()*12; for(let y=0;y<h;y++){ const ww=Math.max(1,Math.round(5*y/h)); x.fillRect(px-(ww>>1),44-h+y,ww,1);} }
  x.fillStyle=th.ground; x.fillRect(0,44,W,H-44); x.fillStyle=th.lip; x.fillRect(0,44,W,2);
  L.mobs.slice(0,5).forEach((m,i)=>{ const sp=enemySprite(m,0,false,false); x.drawImage(sp,10+i*22,46-sp.height); });
  { const b=enemySprite(L.boss,0,false,true), bh=Math.min(b.height,26), bw=b.width*bh/b.height; x.save(); x.translate(W-6,0); x.scale(-1,1); x.drawImage(b,0,46-bh,bw,bh); x.restore(); }
}
const DROP_PCT=[0.1,0.001,0.00001,0.000001,0.0000001,0.0000000001]; // % per kill
const BOSS_MULT=1;
const allowedRar=L=>L.rw.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
function fmtPct(p){ let s=p>=1?p.toFixed(1):p.toFixed(12); s=s.replace(/0+$/,'').replace(/\.$/,''); return s.replace('.',','); }
function oneIn(p){ return Math.round(100/p).toLocaleString(LOCALE); }
function fmtSig(p){ if(p>=1) return (+p.toFixed(1)).toString().replace('.',','); const d=Math.min(14,Math.ceil(-Math.log10(p))+1); return p.toFixed(d).replace(/0+$/,'').replace(/\.$/,'').replace('.',','); }
function lootHTML(L,zz){
  const al=allowedRar(L).slice().reverse(), zn=zz||((S.zone>=L.from&&S.zone<=L.to)?S.zone:L.from);
  const ids=Object.keys(HEROES), order=[S.hero,...ids.filter(c=>c!==S.hero)];
  const pCls=()=>1/ids.length;
  const row=(img,name,col,pct,sub)=>`<div class="drow"><img src="${img}" alt=""><span class="dn" style="color:${col}">${name}${sub?`<small>${sub}</small>`:''}</span><b>${fmtSig(pct)}%</b></div>`;
  let h=`<p class="dhint">${T("Зона")} ${zn} ${T("· шанс за одно убийство")}</p>`;
  h+=`<div class="dsec">${T("Ресурсы")}</div><div class="dl">`+
    row(STONE_ICON,T('Осколок души'),'#7af0ff',stoneChance(zn)*100)+
    row(scrollIcon(0),T('Свиток заточки'),'#ffd27a',SCR_PCT[0])+
    row(scrollIcon(1),T('Безопасный свиток'),'#5ff0ff',SCR_PCT[1])+`</div>`;
  h+=`<div class="dsec">${T("Книги навыков")}</div><div class="dl">`;
  for(const c of order){ const keys=[...SKS[c].map((s,i)=>'a'+i),...PSV[c].map(p=>'p'+p.id)]; const un=keys.filter(k=>!isL(c,k)); const pool=un.length?un:keys;
    for(const k of keys){ const inPool=pool.includes(k); h+= inPool? row(bookIcon(c,k),(T('Книга:')+' ')+bookName(c,k),'#f3d27a',bookPct(zn)*pCls(c)/pool.length,HEROES[c].name) : `<div class="drow off"><img src="${bookIcon(c,k)}" alt=""><span class="dn">${T("Книга:")} ${bookName(c,k)}<small>${HEROES[c].name}</small></span><b>${T("изучено")}</b></div>`; } }
  h+=`</div>`;
  for(const c of order){
    h+=`<div class="dsec">${T("Снаряжение ·")} ${HEROES[c].name}${c===S.hero?(' '+T('· ваш класс')):''}</div><div class="dl">`;
    for(const s of SLOTS) for(const r of al) h+=row(itemIcon(c,s,r),gradeName(c,s,r),RAR[r].col,DROP_PCT[r]*pCls(c)/SLOTS.length,RAR[r].name);
    h+=`</div>`;
  }
  return h;
}
function openZoneLoot(zz){
  const z=typeof zz==='number'?zz:S.zone, L=locOf(z), md=$('modal');
  md.innerHTML=`<div class="card loot-card"><h2>${L.name}</h2>${lootHTML(L,z)}<button id="lClose">${T("Закрыть")}</button></div>`;
  md.hidden=false;
  const close=()=>{ md.hidden=true; };
  $('lClose').onclick=close; md.onclick=e=>{ if(e.target===md) close(); };
}
function rarRows(L){ const tot=L.rw.reduce((a,b)=>a+b,0);
  return L.rw.map((w,i)=>{ if(!w) return ''; const pct=w/tot*100;
    return `<div class="rrow"><span class="rn" style="color:${RAR[i].col}">${RAR[i].name}</span><span class="rbar"><i style="width:${Math.max(2,pct)}%;background:${RAR[i].col}"></i></span><b>${pct<1?pct.toFixed(1):pct.toFixed(0)}%</b></div>`; }).join(''); }
let zoneOpen=null;
function zoneDet(z){
  const L=locOf(z), here=z===S.zone, open=z<=S.best, done=z<S.best;
  const st2=here?T('Вы здесь'):done?T('Босс повержен'):open?T('Босс ещё жив'):T('Закрыта');
  return `<div class="lz-det"><div class="lz-h"><b>${T("Зона")} ${z}</b><span class="${here?'here':done?'done':open?'boss':'lock'}">${st2}</span></div>
    <dl><dt>${T("Враги")}</dt><dd>${fmt(eHp(z))} ${T("здоровья ·")} ${fmt(eDmg(z))} ${T("урона")}</dd><dt>${T("Награда")}</dt><dd>${fmt(eGold(z)*st.goldM())} ${T("золота ·")} ${fmt(eXp(z))} ${T("опыта")}</dd><dt>${T("Босс")}</dt><dd>${L.bossName} · ${fmt(eHp(z)*9)} ${T("здоровья")}</dd></dl>
    ${open?'':`<p class="lz-lock">${T("Откроется после победы над боссом зоны")} ${z-1}</p>`}
    <div class="lz-b">${open&&!here?`<button data-zone="${z}">${T("Перейти")}</button>`:''}${open?`<button class="b" data-boss="${z}" ${bossT>0||bossReq?'disabled':''}>${T("Убить босса")}</button>`:''}<button data-zloot="${z}">${T("Добыча")}</button></div></div>`;
}
function mapHTML(){
  const z=S.zone, last=Math.max(50,S.best+10), cur=locOf(z);
  let h=`<div class="lt"><canvas data-ban="${LOCS.indexOf(cur)}" width="160" height="56"></canvas><div class="lt-o"><small>${T("Сейчас")}</small><b>${T("Зона")} ${z}</b><span>${cur.name}</span></div><button data-boss="${z}" ${bossT>0||bossReq?'disabled':''}>${bossT>0?T('Бой идёт'):T('Убить босса')}</button></div>`;
  LOCS.forEach((L,li)=>{ const a=L.from, b=Math.min(L.to,last); if(a>b) return;
    const total=b-a+1, done=Math.max(0,Math.min(b,S.best-1)-a+1), locked=a>S.best;
    h+=`<section class="lc ${locked?'locked':''}"><div class="lc-ban"><canvas data-ban="${li}" width="160" height="56"></canvas><div class="lc-o"><b>${L.name}</b><small>${T("Зоны")} ${a}–${L.to===Infinity?'∞':L.to}</small></div><em>${locked?T('Закрыто'):done+' / '+total}</em></div>
      <div class="lc-g">`;
    for(let k=a;k<=b;k++){ const cls=k===S.zone?'here':k<S.best?'done':k<=S.best?'open':'lock';
      h+=`<button class="lzt ${cls} ${zoneOpen===k?'sel':''}" data-zopen="${k}" aria-label="${T("Зона")} ${k}" aria-expanded="${zoneOpen===k}">${k}</button>`; }
    h+=`</div>${zoneOpen>=a&&zoneOpen<=b?zoneDet(zoneOpen):''}</section>`; });
  return h;
}
function afterMap(){ document.querySelectorAll('canvas[data-ban]').forEach(cv=>paintBanner(cv,LOCS[+cv.dataset.ban])); }
function fightBoss(z){
  if(z>S.best||hero.dead) return;
  if(z!==S.zone) goZone(z); else { setSheet(false); }
  enemies=[]; arrows=[]; rains=[]; bossReq=true; bossT=0; banner(T('Бой с боссом'),locOf(z).bossName,1.4);
}
function goZone(z){
  if(z>S.best) return;
  S.zone=z; S.wave=0; enemies=[]; arrows=[]; rains=[]; fxs=[]; bossT=0;
  if(!hero.dead){ hero.hp=st.maxHp(); setState('run'); }
  layers=null; save(); setSheet(false);
  banner(locOf(z).name,`${T("Зона")} ${z}`,1.6);
}
