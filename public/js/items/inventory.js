function emptyEq(){ return {mage:{},tank:{},asn:{},sam:{}}; }
const BAG_MAX=200;
function stackList(){
  const L=[]; if(S.stones>0) L.push({id:'stone',n:S.stones});
  if(S.inv.scr.n>0) L.push({id:'scr0',n:S.inv.scr.n}); if(S.inv.scr.s>0) L.push({id:'scr1',n:S.inv.scr.s});
  for(const c of Object.keys(HEROES)) for(const k in (S.books[c]||{})) if(S.books[c][k]>0) L.push({id:'bk:'+c+':'+k,n:S.books[c][k],c,k});
  return L;
}
const bagUsed=()=>S.inv.bag.length+stackList().length+ownLoose().length;
function stackInfo(st){
  if(st.id==='stone') return {img:STONE_ICON,name:'Осколок души',col:'#7af0ff',r:2,desc:'Нужен для улучшения характеристик с 5-го уровня во вкладке «Герой». Цена удваивается с каждым уровнем: 1, 2, 4, 8…'};
  if(st.id==='scr0') return {img:scrollIcon(0),name:'Свиток заточки',col:'#ffd27a',r:4,desc:'Заточка вещи: открой вещь и нажми «Заточить». При провале вещь сгорает.'};
  if(st.id==='scr1') return {img:scrollIcon(1),name:'Безопасный свиток',col:'#5ff0ff',r:5,desc:'Заточка вещи без риска: при провале заточка снижается на 1, вещь остаётся.'};
  return {img:bookIcon(st.c,st.k),name:'Книга: '+bookName(st.c,st.k),col:'#f3d27a',r:3,cls:st.c,desc:`Изучает навык «${bookName(st.c,st.k)}» для класса ${HEROES[st.c].name}.`};
}
function openStack(id){
  const st=stackList().find(x=>x.id===id); if(!st) return; const inf=stackInfo(st), md=$('modal');
  let act='';
  if(st.c){ const own=st.c===S.hero, learned=isL(st.c,st.k), need=st.k[0]==='a'?SKS[st.c][+st.k.slice(1)].unlock:PSV[st.c].find(p=>'p'+p.id===st.k).unlock;
    act= learned?`<button disabled>Уже изучено</button>`: !own?`<button disabled>Только для: ${HEROES[st.c].name}</button>`: S.lvl<need?`<button disabled>Нужен уровень ${need}</button>`:`<button id="stUse">Изучить</button>`; }
  md.innerHTML=`<div class="card item-card"><div class="ic"><img src="${inf.img}" alt=""></div><h2 style="color:${inf.col}">${inf.name}</h2><p>В сумке: <b style="color:var(--fg)">×${st.n}</b></p>${inf.cls?`<p class="cls" style="color:${CLS_COL[inf.cls]}">Класс: ${HEROES[inf.cls].name}</p>`:''}<p>${inf.desc}</p><div class="ibtn">${act}<button id="stClose" class="sec-btn">Закрыть</button></div></div>`;
  md.hidden=false; const close=()=>{ md.hidden=true; renderPanel(); };
  $('stClose').onclick=close; md.onclick=e=>{ if(e.target===md) close(); };
  if($('stUse')) $('stUse').onclick=()=>{ learnKey(st.k); close(); };
}
function invInit(){
  S.inv=S.inv||{bag:[],eq:emptyEq(),next:1};
  S.inv.bag=S.inv.bag||[]; S.inv.eq=Object.assign(emptyEq(),S.inv.eq||{}); S.inv.next=S.inv.next||1;
  S.inv.scr=Object.assign({n:0,s:0},S.inv.scr||{});
  if(S.inv.eq.gun){ for(const sl in S.inv.eq.gun){ const it=S.inv.eq.gun[sl]; if(it){ it.cls='asn'; if(!S.inv.eq.asn[sl]) S.inv.eq.asn[sl]=it; else S.inv.bag.push(it); } } delete S.inv.eq.gun; }
  S.inv.bag.forEach(it=>{ if(it.cls==='gun') it.cls='asn'; });
  const fix=it=>{ if(it && it.v!==2){ it.st=rollStats(it.slot,it.rar,it.lvl,it.set); it.v=2; } };
  S.inv.bag.forEach(fix); for(const c in S.inv.eq) for(const s in S.inv.eq[c]) fix(S.inv.eq[c][s]);
}
const EN_MAX=9, EN_STEP=0.10;
const enMul=it=>1+EN_STEP*(it.en||0);
function effSt(it){ const o={}, en=it.en||0; for(const k in it.st){ const v=it.st[k]; o[k]=v+en*Math.max(1,Math.round(v*EN_STEP)); } return o; }
function eqStat(k){ let v=0; const eq=S.inv&&S.inv.eq[S.hero]; if(!eq) return 0; for(const s in eq){ const it=eq[s]; if(it&&it.st[k]) v+=effSt(it)[k]; } return v; }
function rollRar(boss,L){ const w=L?L.rw:RAR.map(r=>r.w*100); const tot=w.reduce((a,b)=>a+b,0); let r=Math.random()*tot, res=0;
  for(let i=w.length-1;i>=0;i--){ if(!w[i]) continue; r-=w[i]; if(r<0){ res=i; break; } }
  let mx=0; w.forEach((v,i)=>{ if(v>0) mx=i; });
  if(!w[res]) res=w.findIndex(v=>v>0);
  return Math.min(mx,res+(boss?1:0)); }
function rollVal(k,rar,lvl,m=1){ return Math.max(1,Math.round(STAT_BASE[k]*GRADE_MUL[rar]*(1+(lvl-1)*0.08)*rnd(0.85,1.15)*m)); }
function rollStats(slot,rar,lvl,set){
  const st={}; const main=SLOT_STAT[slot]; st[main]=rollVal(main,rar,lvl);
  const L=set&&LOCS.find(l=>l.id===set);
  if(L && L.stat!==main && rar>=1) st[L.stat]=rollVal(L.stat,rar,lvl,0.6);
  const extra=rar>=5?3:rar>=4?2:rar>=2?1:0; const pool=Object.keys(STAT_BASE).filter(k=>k!==main&&!st[k]);
  for(let i=0;i<extra;i++){ const k=pool.splice(Math.floor(Math.random()*pool.length),1)[0]; st[k]=rollVal(k,rar,lvl,0.5); }
  return st;
}
function makeItem(cls,slot,rar,lvl,set){
  const st=rollStats(slot,rar,lvl,set);
  return {id:S.inv.next++,cls,slot,rar,lvl,st,set:set||null,n:true,v:2};
}
const sellPrice=it=>Math.floor(eGold(it.lvl)*4*(1+it.rar*it.rar*1.5)*(1+0.3*(it.en||0)));
const SCR_PCT=[0.1,0.01]; // % per kill: normal, safe
function dropStone(e){
  if(Math.random()<stoneChance(S.zone)*(e.boss?BOSS_MULT:1)*(1+petB('luck')/100)){
    S.stones=(S.stones||0)+1;
    floats.push({x:e.x,y:enemyTop(e)-54,text:'Осколок души',col:'#7af0ff',size:10,life:1.6,vy:-18});
    for(let i=0;i<10;i++) parts.push({x:e.x,y:enemyY(e)-6,vx:rnd(-30,30),vy:rnd(-90,-40),life:rnd(.5,.9),max:.9,col:i%2?'#7af0ff':'#3a8aff',s:1.5,g:160});
  }
}
function dropScroll(e){
  for(let k=1;k>=0;k--){ if(Math.random()<SCR_PCT[k]/100*(e.boss?BOSS_MULT:1)*(1+petB('luck')/100)){
    S.inv.scr[k?'s':'n']++;
    floats.push({x:e.x,y:enemyTop(e)-42,text:k?'Безопасный свиток':'Свиток заточки',col:k?'#5ff0ff':'#ffd27a',size:10,life:1.6,vy:-18});
    for(let i=0;i<10;i++) parts.push({x:e.x,y:enemyY(e)-6,vx:rnd(-30,30),vy:rnd(-90,-40),life:rnd(.5,.9),max:.9,col:k?'#5ff0ff':'#ffd27a',s:1.5,g:160});
    if(sheetOpen && S.tab==='bag') renderPanel();
    return; } }
}
function dropBook(e){
  if(Math.random()>=bookPct(S.zone)/100*(e.boss?BOSS_MULT:1)) return;
  const ids=Object.keys(HEROES), c=ids[Math.floor(Math.random()*ids.length)];
  const keys=[...SKS[c].map((s,i)=>'a'+i),...PSV[c].map(p=>'p'+p.id)];
  const want=keys.filter(k=>!isL(c,k)); const pool=want.length?want:keys;
  const key=pool[Math.floor(Math.random()*pool.length)];
  S.books[c][key]=(S.books[c][key]||0)+1;
  banner('Книга навыка!',`${HEROES[c].name}: ${bookName(c,key)}`,2.4);
  floats.push({x:e.x,y:enemyTop(e)-66,text:'Книга: '+bookName(c,key),col:'#f3d27a',size:11,life:2,vy:-16});
  for(let i=0;i<24;i++) parts.push({x:e.x,y:enemyY(e)-6,vx:rnd(-40,40),vy:rnd(-120,-50),life:rnd(.6,1.1),max:1.1,col:i%2?'#f3d27a':CLS_COL[c],s:2,g:160});
  save(); if(sheetOpen && (S.tab==='bag'||S.tab==='skill')) renderPanel();
}
function dropLoot(e){
  dropBook(e);
  dropStone(e);
  dropScroll(e);
  const L=locOf(S.zone);
  let rar=-1; for(const i of allowedRar(L).slice().reverse()){ if(Math.random()<DROP_PCT[i]/100*(e.boss?BOSS_MULT:1)){ rar=i; break; } }
  if(rar<0) return;
  const ids=Object.keys(HEROES);
  const cls=ids[Math.floor(Math.random()*ids.length)];
  const slot=SLOTS[Math.floor(Math.random()*SLOTS.length)];
  const it=makeItem(cls,slot,rar,S.zone,L.id); if(rar>=2) SND.play('loot',rar); prof().i++;
  const label=`${RAR[it.rar].name}: ${itemName(it)}`;
  if(bagUsed()>=BAG_MAX){ const g=sellPrice(it); S.gold+=g; floats.push({x:e.x,y:enemyTop(e)-30,text:`Сумка полна +${fmt(g)}`,col:'#968aa3',size:9,life:1.4,vy:-18}); return; }
  S.inv.bag.push(it);
  floats.push({x:e.x,y:enemyTop(e)-30,text:label,col:RAR[it.rar].col,size:it.rar>=3?11:9,life:1.6,vy:-18});
  for(let i=0;i<(4+it.rar*4);i++) parts.push({x:e.x,y:enemyY(e)-6,vx:rnd(-30,30),vy:rnd(-90,-40),life:rnd(.5,.9),max:.9,col:RAR[it.rar].col,s:1.5,g:160});
  if(sheetOpen && S.tab==='bag') renderPanel();
}
function statLines(st,cmp){
  return Object.keys(STAT_BASE).filter(k=>st[k]||(cmp&&cmp[k])).map(k=>{
    const v=st[k]||0, d=cmp?v-(cmp[k]||0):null;
    const ds=d==null||!d?'':`<i class="${d>0?'up':'down'}">${d>0?'▲':'▼'}${Math.abs(d)}</i>`;
    return `<li><span>${STAT_RU[k]}</span><b>${v?'+'+v:'—'}</b>${ds}</li>`;
  }).join('');
}
