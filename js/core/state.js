/* ---------- state ---------- */
const DEF={pets:{own:{},act:null,v:3},capes:{own:{},act:null},gold:0,souls:0,stones:0,zone:1,wave:0,lvl:1,xp:0,upg:{dmg:0,spd:0,hp:0,crit:0,gold:0},sk:[1,1,1,1,1],hero:'mage',sks:{mage:[1,1,1,1,1],tank:[1,1,1,1,1],asn:[1,1,1,1,1],sam:[1,1,1,1,1]},psv:{mage:{},tank:{},asn:{},sam:{}},learn:{mage:{a0:1},tank:{a0:1},asn:{a0:1},sam:{a0:1}},books:{mage:{},tank:{},asn:{},sam:{}},stay:false,auto:true,fast:false,best:1,last:0,mult:1,tab:'hero'};
let S;
function loadState(data){
  let s=null;
  if(data && data.S) s=data.S;
  else { try{ s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); }catch(e){} }
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
function save(){ S.last=Date.now(); try{ localStorage.setItem(SAVE_KEY,JSON.stringify(S)); }catch(e){} }
