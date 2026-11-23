let bagFilter='all';
const LEFT_SLOTS=['helm','amulet','armor','cloak','belt'], RIGHT_SLOTS=['weapon','gloves','ring','pants','boots'];
const STAT_SHORT={dmg:T('Урон'),hp:T('Жизнь'),spd:T('Скор.'),crit:T('Крит'),gold:T('Удача')};
function slotBtn(s){ const it=S.inv.eq[S.hero][s];
  return it?`<button class="slot r${it.rar}" data-eq="${s}" aria-label="${SLOT_RU[s]}"><img src="${itemIcon(it.cls,s,it.rar)}" alt=""><i class="lv">${it.lvl}</i>${it.en?`<i class="enb">+${it.en}</i>`:''}</button>`
           :`<button class="slot ghost" disabled aria-label="${SLOT_RU[s]}"><img src="${itemIcon(S.hero,s,0)}" alt=""></button>`; }
function calcBM(){
  const b=buff.power; buff.power=0;
  const dps=st.atk()*st.aps()*(1+st.crit()*(st.critM()-1)); buff.power=b;
  const skl=(S.sk||[]).reduce((a,l,i)=>a+(SK[i]&&S.lvl>=SK[i].unlock?l:0),0);
  return Math.round(dps*4+st.maxHp()*0.6+skl*15+pv('dodge')*20+(pv('regen')+petB('regen'))*40+pv('ls')*25+pv('cdr')*15);
}
function bmIfEquip(it){ const eq=S.inv.eq[S.hero], old=eq[it.slot]; eq[it.slot]=it; const v=calcBM(); if(old) eq[it.slot]=old; else delete eq[it.slot]; return v; }
function gearPower(){ return Math.round(Object.keys(STAT_BASE).reduce((a,k)=>a+eqStat(k)*(20/STAT_BASE[k]),0)/10); }
function booksHTML(){
  const rows=[];
  for(const c of Object.keys(HEROES)) for(const k in (S.books[c]||{})) if(S.books[c][k]>0) rows.push([c,k,S.books[c][k]]);
  if(!rows.length) return `<p class="note bknote">${T("Книг навыков пока нет. Они изредка падают с монстров.")}</p>`;
  rows.sort((a,b)=>(b[0]===S.hero)-(a[0]===S.hero));
  return `<div class="books">${rows.map(([c,k,n])=>`<div class="book ${c!==S.hero?'other':''}"><img src="${bookIcon(c,k)}" alt=""><span><b>${bookName(c,k)}</b><small style="color:${CLS_COL[c]}">${HEROES[c].name}${isL(c,k)?(' '+T('· уже изучен')):''}</small></span><em>×${n}</em></div>`).join('')}</div>`;
}
function bagHTML(){
  let h=`<div class="frame"><div class="ftitle">${T("Экипировка")}</div><div class="paper"><div class="pcol">${LEFT_SLOTS.map(slotBtn).join('')}</div>
    <div class="pmid"><div class="pstage"><canvas id="preview"></canvas></div><b class="pname">${HD.name}</b><span class="ppow">${T("БМ")} <b>${fmt(calcBM())}</b> ${T("· снаряжение")} <b>${gearPower()}</b></span></div>
    <div class="pcol">${RIGHT_SLOTS.map(slotBtn).join('')}</div></div>
    <div class="pextra">${xslot('cape')}${xslot('pet')}</div>
    <div class="gstats">${Object.keys(STAT_BASE).map(k=>`<div><span>${STAT_SHORT[k]}</span><b>+${eqStat(k)}</b></div>`).join('')}</div></div>`;
  const items=S.inv.bag.filter(it=>bagFilter==='all'||it.cls===S.hero).sort((a,b)=>(b.cls===S.hero)-(a.cls===S.hero)||b.rar-a.rar||b.lvl-a.lvl);
  const cnt=S.inv.bag.filter(it=>it.rar===0).length;
  const stk=stackList().filter(st=>bagFilter==='all'||!st.c||st.c===S.hero);
  h+=`<div class="frame" style="margin-top:18px"><div class="ftitle">${T("Сумка")} ${bagUsed()}/${BAG_MAX}</div>
    <div class="btools"><div class="chips"><button class="chip ${bagFilter==='all'?'on':''}" data-f="all">${T("Все")}</button><button class="chip ${bagFilter==='mine'?'on':''}" data-f="mine">${T("Мои")}</button></div>${cnt?`<button class="mini" id="sellCommon">${T("Продать обычные ·")} ${cnt}</button>`:''}</div><div class="bag">`;
  const cells=[...ownLoose().map(([k,d])=>`<button class="item r${d.rar}" data-own="${k}:${d.id}" title="${d.name}"><img src="${KIND[k].icon(d)}" alt=""><span class="cl" style="background:${k==='pet'?'#3f8a6c':'#8a5a2a'}">${KIND[k].tag}</span></button>`),...stk.map(st=>{ const inf=stackInfo(st); return `<button class="item stack r${inf.r} ${st.c&&st.c!==S.hero?'other':''}" data-st="${st.id}" title="${inf.name}"><img src="${inf.img}" alt="">${st.c?`<span class="cl" style="background:${CLS_COL[st.c]}">${CLS_AB[st.c]}</span>`:''}<i class="cnt">${st.n>999?fmt(st.n):st.n}</i></button>`; }),
    ...items.map(it=>`<button class="item r${it.rar} ${it.cls!==S.hero?'other':''} ${it.n?'new':''}" data-it="${it.id}"><img src="${itemIcon(it.cls,it.slot,it.rar)}" alt=""><span class="cl" style="background:${CLS_COL[it.cls]}">${CLS_AB[it.cls]}</span><i class="lv">${it.lvl}</i>${it.en?`<i class="enb">+${it.en}</i>`:''}</button>`)];
  for(let i=0;i<BAG_MAX;i++) h+=cells[i]||`<div class="cell"></div>`;
  h+=`</div></div>`;
  return h;
}
function drawPreview(){
  const c=$('preview'); if(!c||!imgReady) return;
  const D=window.devicePixelRatio||1, W=Math.max(48,Math.round(c.getBoundingClientRect().width*D));
  if(c.width!==W){ c.width=W; c.height=W; }
  const x=c.getContext('2d'); x.clearRect(0,0,W,W); x.imageSmoothingEnabled=false;
  const a=FR.idle; const [fx,fy,fw,fh,ax,bot]=a[Math.floor(performance.now()/1000*HD.idle)%a.length];
  const H=FR.idle[0][5]+1, z=Math.max(1,Math.floor(W*0.62/H)), base=Math.round(W*0.9);
  x.fillStyle='rgba(0,0,0,.45)'; x.fillRect(Math.round(W/2-8*z),base-z,16*z,2*z); x.fillRect(Math.round(W/2-6*z),base-2*z,12*z,4*z);
  x.drawImage(img,fx,fy,fw,fh,Math.round(W/2-ax*z),base-(bot+1)*z,fw*z,fh*z);
}

const NAVI={
  shop:['....##..##..','...#oo##oo#.','...#oo##oo#.','....##..##..','.##......##.','#oo#....#oo#','#oo#.##.#oo#','.##.#oo#.##.','...#oooo#...','..#oooooo#..','..#oooooo#..','...######...'],
  map:['############','#..o....#..#','#.ooo..##..#','#..o..#....#','#....#..oo.#','#...#..oooo#','#..#....oo.#','#.#........#','############','............','............','............'],
  battle:["o..........o",".o........o.","..o......o..","...o....o...","....o..o....",".....oo.....",".....oo.....","....#..#....","...#....#...",".##......##.",".#........#.","............"],
  hero:["............","....####....","...######...","..########..","..#oo##oo#..","..########..","..#......#..","..#......#..","............","............","............","............"],
  skill:[".......##...","......##....",".....##.....","....##......","...######...","......##....",".....##.....","....##......","...##.......","..##........","............","............"],
  bag:["....####....","...#....#...","...#....#...",".##########.",".#oooooooo#.",".##########.",".##########.",".####oo####.",".##########.",".##########.","..########..","............"],
  reborn:["............","...######...","..#oo#####..",".##########.","############",".##########.","..########..","...######...","....####....",".....##.....","............","............"],
};
function pixIcon(map,main,acc){ const c=document.createElement('canvas'); c.width=12; c.height=12; const x=c.getContext('2d');
  map.forEach((row,y)=>{ for(let i=0;i<12;i++){ const ch=row[i]; if(!ch||ch==='.') continue; x.fillStyle=ch==='o'?acc:main; x.fillRect(i,y,1,1);} }); return c.toDataURL(); }
document.querySelectorAll('img[data-ni]').forEach(im=>{ im.src=pixIcon(NAVI[im.dataset.ni],'#d8c39a','#b45cff'); });
const SCROLL_MAP=["....................","....................","..kkkkkkkkkkkkkkk...",".kpppppppppppppppk..",".kpPkkkkkkkkkkkPpk..","..kpppppppppppppk...","..kppkkkkkkkkpppk...","..kpppppppppppppk...","..kppkkkkkkkpppppk..","..kpppppprrrpppppk..","..kppkkkkrgrkkpppk..","..kpppppprrrpppppk..","..kpppppppRpppppk...","..kppkkkkkRkkkppk...","..kpppppppRpppppk...",".kpPkkkkkkkkkkkPpk..",".kpppppppppppppppk..","..kkkkkkkkkkkkkkk...","....................","...................."];
const scrollCache={};
function scrollIcon(safe){ if(scrollCache[safe]) return scrollCache[safe];
  const Z=4,N=20, pal={k:'#120a18',p:'#ecdcb0',P:'#b89a68',r:safe?'#2f8aa0':'#c0322f',R:safe?'#1f5a6e':'#7a1a1a',g:safe?'#c8ffff':'#ffd27a'};
  const c=document.createElement('canvas'); c.width=N*Z+16; c.height=N*Z+16; const x=c.getContext('2d');
  const s=document.createElement('canvas'); s.width=N*Z; s.height=N*Z; const y=s.getContext('2d');
  SCROLL_MAP.forEach((row,j)=>{ for(let i=0;i<N;i++){ const ch=row[i]; if(ch==='.') continue; y.fillStyle=pal[ch]; y.fillRect(i*Z,j*Z,Z,Z);} });
  x.shadowColor=safe?'#5ff0ff':'#ffb04a'; x.shadowBlur=10; x.drawImage(s,8,8); x.shadowBlur=0; x.drawImage(s,8,8);
  return scrollCache[safe]=c.toDataURL(); }
const enChance=n=>Math.max(0,0.9-0.1*n);
function enchant(it,equipped,safe){
  const n=it.en||0, key=safe?'s':'n';
  if(n>=EN_MAX || S.inv.scr[key]<=0) return null;
  S.inv.scr[key]--;
  if(Math.random()<enChance(n)){ it.en=n+1; save(); SND.play('enchOk'); return 'ok'; }
  SND.play('enchBad');
  if(safe){ it.en=Math.max(0,n-1); save(); return 'down'; }
  if(equipped){ const eq=S.inv.eq[S.hero]; if(eq[it.slot]===it) delete eq[it.slot]; } else S.inv.bag=S.inv.bag.filter(x=>x.id!==it.id);
  hero.hp=Math.min(hero.hp,st.maxHp()); save(); return 'burn';
}
function openItem(it,equipped,msg){
  it.n=false;
  const mine=it.cls===S.hero, cur=S.inv.eq[S.hero][it.slot];
  const cmp=(!equipped && mine && cur)?effSt(cur):null;
  const n=it.en||0, ch=enChance(n), maxed=n>=EN_MAX;
  const MSG={ok:['ok',`${T("Успех! Теперь +")}${n}`],down:['down',`${T("Неудача. Заточка снижена до +")}${n}`]};
  const md=$('modal');
  md.innerHTML=`<div class="card item-card" style="border-color:${RAR[it.rar].col}">
    <div class="ic"><img src="${itemIcon(it.cls,it.slot,it.rar)}" alt=""></div>
    <h2 style="color:${RAR[it.rar].col}">${itemName(it)}</h2>
    <p>${RAR[it.rar].name} · ${SLOT_RU[it.slot]} ${T("· ур.")} ${it.lvl}</p>${it.set?`<p class="cls" style="color:var(--trim-l)">${T("Комплект:")} ${LOCS.find(l=>l.id===it.set).name}</p>`:''}
    <p class="cls" style="color:${CLS_COL[it.cls]}">${T("Класс:")} ${HEROES[it.cls].name}</p>
    ${msg&&MSG[msg]?`<p class="enres ${MSG[msg][0]}">${MSG[msg][1]}</p>`:''}
    <ul class="ist">${statLines(effSt(it),cmp)}</ul>
    <div class="enbox"><div class="enhead"><b>${T("Заточка +")}${n}</b><span>${maxed?T('Максимум'):`${T("Шанс на +")}${n+1}: <i>${Math.round(ch*100)}%</i>`}</span></div>
      <div class="enbar">${Array.from({length:EN_MAX},(_,k)=>`<i class="${k<n?'on':''}"></i>`).join('')}</div>
      <small>${T("Каждая заточка: +")}${Math.round(EN_STEP*100)}${T("% к каждому параметру (минимум +1)")}</small>
      ${maxed?'':`<div class="enbtns"><button id="enN" ${S.inv.scr.n?'':'disabled'}><img src="${scrollIcon(0)}" alt="">${T("Заточить")}<small>×${S.inv.scr.n} ${T("· сгорит при провале")}</small></button><button id="enS" class="safe" ${S.inv.scr.s?'':'disabled'}><img src="${scrollIcon(1)}" alt="">${T("Безопасно")}<small>×${S.inv.scr.s} ${T("· −1 при провале")}</small></button></div>`}
    </div>
    ${cmp?`<p class="cmpn">${T("Сравнение с надетым:")} ${itemName(cur)}</p>`:''}
    ${(!equipped && mine)?(()=>{ const d=bmIfEquip(it)-calcBM(); return `<p class="bmd ${d>0?'up':d<0?'down':''}">${T("БМ если надеть:")} <b>${d>0?'▲ +':d<0?'▼ −':''}${fmt(Math.abs(d))}</b></p>`; })():''}
    <div class="ibtn">
      ${equipped?`<button id="iAct">${T("Снять")}</button>`:mine?`<button id="iAct">${T("Надеть")}</button>`:`<button id="iAct" disabled>${T("Только для:")} ${HEROES[it.cls].name}</button>`}
      ${equipped?'':`<button id="iSell" class="sec-btn">${T("Продать ·")} ${fmt(sellPrice(it))}</button>`}
      <button id="iClose" class="sec-btn">${T("Закрыть")}</button>
    </div></div>`;
  md.hidden=false;
  const close=()=>{ md.hidden=true; renderPanel(); };
  $('iClose').onclick=close;
  md.onclick=e=>{ if(e.target===md) close(); };
  const act=$('iAct');
  if(!act.disabled) act.onclick=()=>{
    const eq=S.inv.eq[S.hero];
    if(equipped){ if(bagUsed()>=BAG_MAX){ act.textContent=T('Сумка полна'); return; } delete eq[it.slot]; S.inv.bag.push(it); }
    else { if(it.cls!==S.hero) return; S.inv.bag=S.inv.bag.filter(x=>x.id!==it.id); if(eq[it.slot]) S.inv.bag.push(eq[it.slot]); eq[it.slot]=it; }
    hero.hp=Math.min(hero.hp,st.maxHp()); save(); close();
  };
  if($('iSell')) $('iSell').onclick=()=>{ S.gold+=sellPrice(it); S.inv.bag=S.inv.bag.filter(x=>x.id!==it.id); save(); close(); };
  const doEn=safe=>{ const r=enchant(it,equipped,safe); if(!r) return;
    if(r==='burn'){ md.innerHTML=`<div class="card item-card burn"><div class="ic"><img src="${itemIcon(it.cls,it.slot,it.rar)}" alt=""></div><h2>${T("Вещь сгорела")}</h2><p>${itemName(it)} ${T("не выдержала заточку +")}${(it.en||0)+1} ${T("и рассыпалась в пепел.")}</p><button id="iClose2">${T("Закрыть")}</button></div>`; $('iClose2').onclick=close; return; }
    openItem(it,equipped,r); };
  if($('enN')) $('enN').onclick=()=>doEn(false);
  if($('enS')) $('enS').onclick=()=>doEn(true);
}
