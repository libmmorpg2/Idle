// ---- GRAM: баланс, магазин за GRAM, паки, пополнение переводом TON ----
const GRAM={balance:0,prices:null,topup:null,bought:[],busy:false,icon:''};
const GRAM_MAP=["............","...######...","..#oo##oo#..",".#oooooooo#.","############",".#oooooooo#.","..#oooooo#..","...#oooo#...","....#oo#....",".....##.....","............","............"];
const gramIcon=()=>GRAM.icon||(GRAM.icon=pixIcon(GRAM_MAP,'#1c5fc8','#7fdcff'));
const gramPrice=item=>GRAM.prices&&GRAM.prices[item];
const gramTag=n=>`<img class="gri" src="${gramIcon()}" alt="">${fmt(n)}`;

/* ---------- паки: содержимое выдаёт игра, цену и списание проверяет сервер ---------- */
const ALL_POTS=()=>Object.fromEntries(POTS.map(p=>[p.id,1]));
const PACKS=[
  {id:'starter',name:T('Стартовый пак героя'),col:'#5fd39b',once:true,gold:3000,stones:10,scr:5,safe:2,pots:{atk:2,xp:2,gold:2},pet:'fairy',items:[]},
  {id:'epic',name:T('Эпический пак'),col:'#c46bff',gold:10000,stones:30,scr:10,safe:5,potsAll:3,cape:'frost',items:[3,3]},
  {id:'legendary',name:T('Легендарный пак'),col:'#f3a43a',gold:30000,stones:80,scr:20,safe:15,potsAll:5,pet:'succubus',items:[4,4,3],books:2},
];
const packGold=P=>Math.round(eGold(Math.max(1,S.best||1))*P.gold);   // золото растёт вместе с рекордной зоной
function packPots(P){ const o=P.pots?{...P.pots}:{}; if(P.potsAll) POTS.forEach(p=>o[p.id]=(o[p.id]||0)+P.potsAll); return o; }
function packLines(P){
  const L=[], pot=packPots(P), pc=Object.values(pot).reduce((a,b)=>a+b,0);
  L.push([`<span class="coin"></span>`,`${fmt(packGold(P))} ${T('золота')}`]);
  L.push([`<img src="${STONE_ICON}" alt="">`,`${P.stones} ${T('осколков души')}`]);
  L.push([`<img src="${scrollIcon(false)}" alt="">`,`${P.scr} ${T('свитков заточки')}`]);
  L.push([`<img src="${scrollIcon(true)}" alt="">`,`${P.safe} ${T('безопасных свитков')}`]);
  if(pc) L.push([`<img src="${potIcon(POTS[0].col)}" alt="">`,`${pc} ${T('зелий')}`]);
  const cnt={}; P.items.forEach(r=>cnt[r]=(cnt[r]||0)+1);
  Object.keys(cnt).sort((a,b)=>b-a).forEach(r=>L.push([`<i class="rsq" style="--rc:${RAR[r].col}"></i>`,`<b style="color:${RAR[r].col}">${cnt[r]} × ${RAR[r].name}</b> ${T('вещь для героя')}`]));
  if(P.pet){ const d=PETS.find(x=>x.id===P.pet); L.push([`<img src="${petIcon(d)}" alt="">`,`${T('Питомец')} <b style="color:${RAR[d.rar].col}">${d.name}</b>`]); }
  if(P.cape){ const d=CAPES.find(x=>x.id===P.cape); L.push([`<img src="${capeIcon(d)}" alt="">`,`${T('Плащ')} <b style="color:${RAR[d.rar].col}">${d.name}</b>`]); }
  if(P.books) L.push([`<img src="${bookIcon(S.hero,'a1')}" alt="">`,`${P.books} × 5 ${T('книг неизученных навыков')}`]);
  return L;
}
const packSpace=P=>P.items.length;   // сколько мест в сумке нужно
function grantPack(P){
  const got=[]; S.gold+=packGold(P); S.stones=(S.stones||0)+P.stones;
  S.inv.scr.n+=P.scr; S.inv.scr.s+=P.safe;
  const pot=packPots(P), ps=potSt(); for(const id in pot) ps.own[id]=(ps.own[id]||0)+pot[id];
  const slots=SLOTS.slice().sort(()=>Math.random()-.5), lvl=Math.max(1,S.best||1);
  P.items.forEach((r,i)=>{ const it=makeItem(S.hero,slots[i%slots.length],r,lvl); S.inv.bag.push(it); got.push(it); prof().i++; });
  for(const [k,id] of [['pet',P.pet],['cape',P.cape]]){ if(!id) continue; const so=KIND[k].st(); if(so.own[id]) S.stones+=20; else so.own[id]=1; }
  if(P.books){ const c=S.hero, keys=[...SKS[c].map((_,i)=>'a'+i),...PSV[c].map(p=>'p'+p.id)].filter(k=>!isL(c,k)).sort(()=>Math.random()-.5).slice(0,P.books);
    if(!keys.length) S.stones+=20; keys.forEach(k=>{ S.books[c][k]=(S.books[c][k]||0)+5; }); }
  return got;
}
function grantItem(item){
  const [k,id]=item.split(':');
  if(k==='give'){ const a=item.split(':').slice(2), n=+a[a.length-1]||1;   // подарок от администрации
    if(id==='gold'){ S.gold+=n; return `${fmt(n)} ${T('золота')}`; }
    if(id==='stones'){ S.stones=(S.stones||0)+n; return `${fmt(n)} ${T('осколков души')}`; }
    if(id==='scr'){ S.inv.scr.n+=n; return `${n} ${T('свитков заточки')}`; }
    if(id==='safe'){ S.inv.scr.s+=n; return `${n} ${T('безопасных свитков')}`; }
    if(id==='pot'){ const s=potSt(); s.own[a[0]]=(s.own[a[0]]||0)+n; const p=POTS.find(x=>x.id===a[0]); return p?`${p.name} ×${n}`:''; }
    if(id==='item'){ const [cls,slot,rar,lvl]=a; if(!HEROES[cls]||!SLOT_RU[slot]) return; const it=makeItem(cls,slot,+rar,+lvl); S.inv.bag.push(it); return itemName(it); }
    return; }
  if(k==='pack'){ const P=PACKS.find(p=>p.id===id); if(P) grantPack(P); return P&&P.name; }
  if(k==='pot'){ const s=potSt(); s.own[id]=(s.own[id]||0)+1; const p=POTS.find(x=>x.id===id); return p&&p.name; }
  if(k==='pet'||k==='cape'){ const so=KIND[k].st(), d=KIND[k].list().find(x=>x.id===id); if(!d) return; if(so.own[id]) S.stones+=20; else so.own[id]=1; return d.name; }
}
async function saveNow(){ save(true); for(let i=0;i<50&&(SRV.busy||SRV.dirty)&&!SRV.dead;i++) await new Promise(r=>setTimeout(r,200)); return !SRV.dirty&&!SRV.dead; }
async function gramAck(ids){ if(ids.length&&await saveNow()) api('gram/ack',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})}).catch(()=>{}); }

/* ---------- баланс ---------- */
async function gramLoad(){
  try{ const r=await api('gram'); if(!r.ok) return; const j=await r.json();
    GRAM.balance=j.balance; GRAM.prices=j.prices; GRAM.topup=j.topup; GRAM.bought=j.bought;
    if(j.ungranted&&j.ungranted.length){ const got=j.ungranted.map(u=>grantItem(u.item)).filter(Boolean), gift=j.ungranted.every(u=>u.gift);
      SND.play('buy'); banner(gift?T('Подарок от администрации'):T('Покупки выданы'),got.length===1?got[0]:got.length+' '+T('шт.'),2.2); gramAck(j.ungranted.map(u=>u.id)); renderPanel(); }
  }catch(e){}
  gramHud(); if(S.tab==='shop'&&sheetOpen) renderPanel();
}
function gramHud(){ $('gramBal').textContent=fmt(GRAM.balance); $('gramIco').src=gramIcon(); }

/* ---------- покупка ---------- */
async function gramBuy(item){
  const price=gramPrice(item); if(!price||GRAM.busy) return;
  if(GRAM.balance<price){ gramTopupModal(); return; }
  const [k,id]=item.split(':'), P=k==='pack'&&PACKS.find(p=>p.id===id);
  if(P&&bagUsed()+packSpace(P)>BAG_MAX){ banner(T('Сумка полна'),T('Освободи место'),1.4); return; }
  if((k==='pet'||k==='cape')&&bagUsed()>=BAG_MAX){ banner(T('Сумка полна'),T('Освободи место'),1.4); return; }
  GRAM.busy=true; renderPanel();
  try{
    const r=await api('gram/buy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({item})}); const j=await r.json().catch(()=>({}));
    if(r.status===402){ GRAM.balance=j.balance; gramTopupModal(); }
    else if(r.status===409){ GRAM.bought.push(item); banner(T('Уже куплено'),'',1.4); }
    else if(r.ok){ GRAM.balance=j.balance; if(P&&P.once) GRAM.bought.push(item);
      const name=grantItem(item); SND.play('buy'); banner(P?T('Пак открыт!'):T('Покупка'),name||'',1.8); gramAck([j.id]); }
    else banner(T('Не получилось'),T('Попробуй ещё раз'),1.4);
  }catch(e){ banner(T('Нет связи с сервером'),'',1.4); }
  GRAM.busy=false; gramHud(); renderPanel();
}

/* ---------- пополнение за TON ---------- */
// комментарий к переводу в формате TON (BOC с одной ячейкой: 32 нулевых бита + текст), с контрольной суммой crc32c
const CRC32C=(()=>{ const t=new Uint32Array(256); for(let i=0;i<256;i++){ let c=i; for(let k=0;k<8;k++) c=c&1?(c>>>1)^0x82F63B78:c>>>1; t[i]=c>>>0; } return t; })();
function crc32c(b){ let c=0xFFFFFFFF; for(const x of b) c=CRC32C[(c^x)&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
function tonComment(text){
  const data=[0,0,0,0,...new TextEncoder().encode(text)]; if(data.length>127) throw new Error('comment too long');
  const cell=[0,data.length*2,...data];
  const boc=[0xb5,0xee,0x9c,0x72,0x41,0x01,0x01,0x01,0x00,cell.length,0x00,...cell];
  const c=crc32c(boc); boc.push(c&255,(c>>>8)&255,(c>>>16)&255,(c>>>24)&255);
  return btoa(String.fromCharCode(...boc));
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function gramTopupModal(msg){
  const md=$('modal');
  if(!GRAM.topup){ md.innerHTML=`<div class="card gtop"><h2>${T('Пополнить GRAM')}</h2><p>${T('Пополнение пока недоступно — скоро включим.')}</p><button id="gtClose" class="sec-btn">${T('Закрыть')}</button></div>`; }
  else md.innerHTML=`<div class="card gtop"><h2>${T('Пополнить GRAM')}</h2>
    <p class="gtbal">${T('Баланс')}: <b>${gramTag(GRAM.balance)}</b></p>
    <p>${T('Оплата переводом TON с вашего кошелька (Telegram Wallet, Tonkeeper и др.). GRAM придут после подтверждения в сети — обычно до минуты.')}</p>
    <div class="gtpk">${GRAM.topup.map(p=>`<button type="button" data-gtop="${p.id}"${GRAM.busy?' disabled':''}><b>${gramTag(p.gram)}</b><span><i class="ton-ic"></i>${p.ton} TON</span>${p.bonus?`<em>+${p.bonus}%</em>`:''}</button>`).join('')}</div>
    <p class="gtmsg" id="gtMsg">${msg||''}</p>
    <button id="gtClose" class="sec-btn">${T('Закрыть')}</button></div>`;
  md.hidden=false; const close=()=>{ md.hidden=true; md.onclick=null; };
  $('gtClose').onclick=close; md.onclick=e=>{ if(e.target===md) close(); const b=e.target.closest('[data-gtop]'); if(b&&!b.disabled) gramTopup(b.dataset.gtop); };
}
function gtMsg(t,err){ const m=$('gtMsg'); if(m){ m.textContent=t; m.classList.toggle('err',!!err); } }
async function gramTopup(pkg){
  if(GRAM.busy) return; GRAM.busy=true; document.querySelectorAll('[data-gtop]').forEach(b=>b.disabled=true);
  try{
    gtMsg(T('Подключаем кошелёк…'));
    if(!TON.ui) await tonLoad(); if(!TON.ui) throw new Error(T('Не удалось загрузить TON Connect'));
    if(!TON.ui.wallet){ TON.ui.openModal(); for(let i=0;i<240&&!TON.ui.wallet;i++) await sleep(500); if(!TON.ui.wallet) throw new Error(T('Кошелёк не подключён')); }
    const r=await api('gram/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({package:pkg})});
    if(!r.ok) throw new Error(r.status===429?T('Слишком много заказов, подождите'):T('Не удалось создать заказ'));
    const o=await r.json();
    gtMsg(T('Подтвердите перевод в кошельке…'));
    try{ await TON.ui.sendTransaction({validUntil:o.validUntil,messages:[{address:o.address,amount:o.amount,payload:tonComment(o.comment)}]}); }
    catch(e){ throw new Error(T('Платёж отменён')); }
    gtMsg(T('Перевод отправлен. Ждём подтверждения в сети TON…'));
    for(let i=0;i<150;i++){ await sleep(4000);
      const s=await api('gram/order/'+o.id).then(x=>x.json()).catch(()=>null);
      if(s&&s.status==='paid'){ GRAM.balance=s.balance; gramHud(); SND.play('buy'); banner(T('GRAM зачислены'),`+${fmt(o.gram)} GRAM`,2); gtMsg(`✓ +${o.gram} GRAM`); return; }
    }
    gtMsg(T('Оплата ещё не дошла. GRAM зачислятся автоматически, как только сеть подтвердит перевод.'));
  }catch(e){ gtMsg(e.message||T('Ошибка'),true); }
  finally{ GRAM.busy=false; document.querySelectorAll('[data-gtop]').forEach(b=>b.disabled=false); if(S.tab==='shop'&&sheetOpen) renderPanel(); }
}
$('gramChip').addEventListener('click',e=>{ e.stopPropagation(); gramTopupModal(); });
