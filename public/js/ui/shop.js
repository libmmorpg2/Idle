/* ---------- shop / owned things ---------- */
const KIND={pet:{list:()=>PETS,st:()=>S.pets,icon:P=>petIcon(P),slot:T('Питомец'),put:T('Призвать'),take:T('Отозвать'),tag:T('ПИТ')},
            cape:{list:()=>CAPES,st:()=>S.capes,icon:C=>capeIcon(C),slot:T('Плащ'),put:T('Надеть'),take:T('Снять'),tag:T('ПЛЩ')}};
function ownLoose(){ const out=[]; for(const k in KIND){ const st=KIND[k].st(); if(!st) continue; for(const d of KIND[k].list()) if(st.own[d.id]&&st.act!==d.id) out.push([k,d]); } return out; }
let shopTab='pack';
function gramBtn(item,dis){ const pr=gramPrice(item); return `<button class="pbtn pbuy gbuy" data-gbuy="${item}" ${pr==null||GRAM.busy||dis?'disabled':''}>${pr==null?'…':gramTag(pr)}</button>`; }
function shopHTML(){
  const tab=(id,label)=>`<button class="chip ${shopTab===id?'on':''}" data-shop="${id}">${label}</button>`;
  const head=`<div class="gbar"><span>${T("Баланс")}</span><b>${gramTag(GRAM.balance)} GRAM</b><button type="button" class="gadd" data-gtopup="1">+ ${T("Пополнить")}</button></div>
    <div class="chips shoptabs">${tab('pack',T('Паки'))}${tab('pet',T('Питомцы'))}${tab('cape',T('Плащи'))}${tab('pot',T('Зелья'))}</div>`;
  if(shopTab==='pack'){
    return head+`<div class="packs">`+PACKS.map(P=>{ const item='pack:'+P.id, done=P.once&&GRAM.bought.includes(item);
      return `<div class="pack" style="--pk:${P.col}"><div class="pk-h"><b>${P.name}</b>${P.once?`<small>${T("один раз")}</small>`:''}</div>
        <ul>${packLines(P).map(([ic,t])=>`<li><span class="pk-i">${ic}</span><span>${t}</span></li>`).join('')}</ul>
        ${done?`<button class="pbtn on" disabled>${T("Куплено")}</button>`:gramBtn(item)}</div>`; }).join('')+`</div>`;
  }
  if(shopTab==='pot'){ const s=potSt();
    return head+`<div class="shopintro"><b>${T("Зелья")}</b><span>${T("Каждое зелье усиливает героя на 10 минут. Выпей ещё одно, чтобы продлить время, максимум до часа. Иногда зелья выпадают с боссов.")}</span></div><div class="pots">`+
    POTS.map(p=>{ const left=potLeft(p.id), n=s.own[p.id]||0;
      return `<div class="potr ${left?'on':''}"><div class="poti" style="--pc:${p.col}"><img src="${potIcon(p.col)}" alt=""></div><div class="info"><h3>${p.name}${n?`<span>×${n}</span>`:''}</h3><p>${p.desc}${left?`<br><em>${T("Действует ещё")} ${fmtMin(left)}</em>`:''}</p></div>
        <div class="potb">${gramBtn('pot:'+p.id)}<button class="pbtn" data-potdrink="${p.id}" ${n?'':'disabled'}>${T("Выпить")}</button></div></div>`; }).join('')+`</div>`; }
  const K=KIND[shopTab], st=K.st(), isPet=shopTab==='pet';
  let h=head+`
    <div class="shopintro"><b>${isPet?T('Питомцы'):T('Плащи')}</b><span>${isPet?T('Боевые спутники в снаряжении: бегают или летают рядом с героем и усиливают его, но сами не сражаются.'):T('Плащи подходят любому классу и дают бонусы герою.')} ${T("Покупка попадает в сумку — надень её в слот «")}${K.slot}».</span></div><div class="pets">`;
  for(const P of K.list()){
    const has=!!st.own[P.id], act=st.act===P.id;
    h+=`<div class="petc r${P.rar} ${act?'act':''}"><div class="pimg ${isPet?'':'cimg'}" style="--pc:${P.col||P.g}"><img src="${K.icon(P)}" alt=""></div>
      <b style="color:${RAR[P.rar].col}">${P.name}</b><small>${RAR[P.rar].name} · ${isPet?(P.fly?T('летает'):T('бегает')):T('все классы')}</small>
      <ul>${petBuffList(P)}</ul>
      ${act?`<button class="pbtn on" data-own="${shopTab}:${P.id}">${T("Надето")}</button>`:has?`<button class="pbtn" data-own="${shopTab}:${P.id}">${T("В сумке")}</button>`:gramBtn(shopTab+':'+P.id)}
    </div>`;
  }
  return h+`</div>`;
}
function ownModal(k,id){
  const K=KIND[k], d=K.list().find(x=>x.id===id), so=K.st(); if(!d||!so.own[id]) return; const md=$('modal'), on=so.act===id;
  md.innerHTML=`<div class="card item-card"><div class="ic"><img src="${K.icon(d)}" alt=""></div><h2 style="color:${RAR[d.rar].col}">${d.name}</h2>
    <p>${RAR[d.rar].name} · ${k==='pet'?(d.fly?T('летающий питомец'):T('бегающий питомец')):T('плащ · все классы')}</p>
    <ul class="ownb">${petBuffList(d)}</ul>
    <p>${on?`${T("Надето в слоте «")}${K.slot}».`:`${T("Лежит в сумке.")}${so.act?(' '+T('Текущий предмет из слота вернётся в сумку.')):''}`}</p>
    <div class="ibtn"><button id="owAct">${on?K.take:K.put}</button><button id="owClose" class="sec-btn">${T("Закрыть")}</button></div></div>`;
  md.hidden=false; const close=()=>{ md.hidden=true; renderPanel(); };
  $('owClose').onclick=close; md.onclick=e=>{ if(e.target===md) close(); };
  $('owAct').onclick=()=>{
    if(on){ if(bagUsed()>=BAG_MAX){ banner(T('Сумка полна'),T('Некуда снять'),1.4); return; } so.act=null; }
    else { so.act=id; if(k==='pet') pet.x=-40; }
    hero.hp=Math.min(hero.hp,st.maxHp()); save(); close(); };
}
function xslot(k){ const K=KIND[k], d=K.st().act?K.list().find(x=>x.id===K.st().act):null;
  return `<div class="xs"><span>${K.slot}</span>${d?`<button class="slot r${d.rar}" data-own="${k}:${d.id}" aria-label="${K.slot}"><img src="${K.icon(d)}" alt=""></button>`:`<button class="slot ghost" disabled aria-label="${K.slot}"><img src="${K.icon(K.list()[0])}" alt=""></button>`}<small>${d?d.name:T('Пусто — купи в магазине')}</small></div>`; }
