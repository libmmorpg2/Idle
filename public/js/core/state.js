/* ---------- state ---------- */
const DEF={pets:{own:{},act:null,v:3},capes:{own:{},act:null},gold:0,souls:0,stones:0,zone:1,wave:0,lvl:1,xp:0,upg:{dmg:0,spd:0,hp:0,crit:0,gold:0},sk:[1,1,1,1,1],hero:'mage',sks:{mage:[1,1,1,1,1],tank:[1,1,1,1,1],asn:[1,1,1,1,1],sam:[1,1,1,1,1]},psv:{mage:{},tank:{},asn:{},sam:{}},learn:{mage:{a0:1},tank:{a0:1},asn:{a0:1},sam:{a0:1}},books:{mage:{},tank:{},asn:{},sam:{}},stay:false,auto:true,fast:false,best:1,last:0,mult:1,tab:'hero'};
let S;
function loadState(data){
  let s=null;
  if(data && data.S) s=data.S;
  else if(data && data.saved) s=data.saved;   // сохранение из PostgreSQL (см. boot в main.js)
  S=Object.assign(JSON.parse(JSON.stringify(DEF)),s||{});
  S.upg=Object.assign({},DEF.upg,(s&&s.upg)||{});
  S.sks=Object.assign({mage:[1,1,1,1,1],tank:[1,1,1,1,1],asn:[1,1,1,1,1],sam:[1,1,1,1,1]},(s&&s.sks)||{});
  S.psv=Object.assign({mage:{},tank:{},asn:{},sam:{}},(s&&s.psv)||{});
  if(s && s.sk && !s.sks) S.sks.mage=s.sk.slice(0,3);
  for(const h in S.sks){ S.sks[h]=(S.sks[h]||[]).slice(0,5); while(S.sks[h].length<5) S.sks[h].push(1); }
  if(!HEROES[S.hero]) S.hero='mage';
  S.pets=Object.assign({own:{},act:null},(s&&s.pets)||{});
  S.capes=Object.assign({own:{},act:null},(s&&s.capes)||{});
  if(S.pets.v!==3){ const MIG={dog:'hound',batling:'bat',firesp:'wisp',golemling:'griffin',cat:'hound',chick:'boar',firefly:'bat',fox:'wolf',owl:'fairy',turtle:'imp',wolf:'direwolf',bunny:'griffin',panther:'jaguar',griffin:'succubus',kitsune:'ancient'}; const o={}; for(const id in S.pets.own) o[MIG[id]||id]=1; S.pets.own=o; if(S.pets.act) S.pets.act=MIG[S.pets.act]||S.pets.act; S.pets.v=3; }
  if(!(s&&s.learn)){ S.learn={}; for(const c of ['mage','tank','asn','sam']){ const L={a0:1}; (S.sks[c]||[]).forEach((l,i)=>{ if(l>1) L['a'+i]=1; }); for(const k in (S.psv[c]||{})) if(S.psv[c][k]>0) L['p'+k]=1; S.learn[c]=L; } }
  S.learn=Object.assign({mage:{a0:1},tank:{a0:1},asn:{a0:1},sam:{a0:1}},S.learn); S.books=Object.assign({mage:{},tank:{},asn:{},sam:{}},(s&&s.books)||{});
  if(S.hero==='gun'||!HEROES[S.hero]) S.hero='tank';
  if(S.books.gun){ for(const k in S.books.gun) if(k[0]==='a') S.books.asn[k]=(S.books.asn[k]||0)+S.books.gun[k]; delete S.books.gun; }
  delete S.sks.gun; delete S.psv.gun; delete S.learn.gun;
  applyHero(); invInit();
}
/* ---------- сохранение на сервер (PostgreSQL), в браузере ничего не хранится ---------- */
const SRV={rev:0,busy:false,dirty:false,dead:false,retry:0,netErr:false};
function srvMsg(text){ if(LOAD.open){ if(text) LOAD.error(text); return; } const b=$('err'); if(!b) return; b.hidden=!text; b.textContent=text||''; }
function save(urgent){ if(!S||SRV.dead) return; S.last=Date.now(); try{ S.bm=calcBM(); }catch(e){}   // БМ видят другие игроки в «Инфо»
  SRV.dirty=true; flushSave(urgent); }
async function flushSave(urgent){
  if(SRV.busy||!SRV.dirty||SRV.dead) return;
  clearTimeout(SRV.retry); SRV.dirty=false; SRV.busy=true;
  const body=JSON.stringify({state:S,rev:SRV.rev});
  try{
    const r=await api('save',{method:'PUT',headers:{'Content-Type':'application/json'},body,keepalive:!!urgent&&body.length<60000});
    if(r.status===401){ SRV.dead=true; srvMsg(T('Сессия истекла. Обновите страницу и войдите снова.')); return; }
    if(r.status===409){ SRV.dead=true; srvMsg(T('Игра открыта в другой вкладке или на другом устройстве. Обновите страницу — здесь прогресс больше не сохраняется.')); return; }
    if(!r.ok) throw new Error('HTTP '+r.status);
    SRV.rev=(await r.json()).rev;
    if(SRV.netErr){ SRV.netErr=false; srvMsg(''); }
  }catch(e){
    SRV.dirty=true; SRV.netErr=true; srvMsg(T('Нет связи с сервером — прогресс не сохранён, повторяю…'));
    SRV.retry=setTimeout(flushSave,3000);
  }finally{ SRV.busy=false; }
  if(SRV.dirty&&!SRV.netErr) flushSave();
}
async function fetchSave(){   // ждёт сервер, пока не ответит: без загрузки нельзя начинать, иначе затрём прогресс
  for(;;){
    try{
      LOAD.set(70,T('Загружаем сохранение…'));
      const r=await api('save');
      if(r.status===401){ location.reload(); await new Promise(()=>{}); }
      if(!r.ok) throw new Error('HTTP '+r.status);
      const j=await r.json(); SRV.rev=j.rev|0; srvMsg(''); return j.state;
    }catch(e){ srvMsg(T('Не удалось загрузить сохранение с сервера, повторяю…')); await new Promise(f=>setTimeout(f,3000)); }
  }
}
