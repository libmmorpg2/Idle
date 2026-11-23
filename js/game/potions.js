// ---- potions (банки): +20% for 10 min, stack up to 60 min ----
const POTS=[
  {id:'atk',name:'Зелье силы',desc:'+20% к атаке',col:'#ff5a3a'},
  {id:'def',name:'Зелье стойкости',desc:'+20% к защите: получаемый урон −20%',col:'#4a9aff'},
  {id:'aps',name:'Зелье ярости',desc:'+20% к скорости атаки',col:'#ff8a2a'},
  {id:'run',name:'Зелье ветра',desc:'+20% к скорости бега',col:'#6af0d8'},
  {id:'crit',name:'Зелье меткости',desc:'+20% к шансу крита',col:'#ff5ac8'},
  {id:'xp',name:'Зелье мудрости',desc:'+20% к опыту',col:'#a65cff'},
  {id:'gold',name:'Зелье удачи',desc:'+20% к золоту',col:'#f3c94a'},
];
const POT_DUR=10*60*1000, POT_MAX=60*60*1000;
const potSt=()=>S.pot||(S.pot={own:{},t:{}});
const potLeft=id=>Math.max(0,((potSt().t[id])||0)-Date.now());
const potOn=id=>potLeft(id)>0;
const potM=id=>potOn(id)?1.2:1;
const potPrice=()=>Math.round(200*Math.pow(1.1,Math.max(0,(S.best||1)-1))/10)*10;
const POT_ICON={};
function potIcon(col){ if(POT_ICON[col]) return POT_ICON[col];
  const M=["....kkkk....","....kcck....","....kkkk....",".....kgk....","....kkgkk...","...kgggggk..","..kghoooook.","..khooooook.","..kooooooOk.","..koooooOOk.","...kOOOOOk..","....kkkkk..."];
  const c=document.createElement('canvas'); c.width=12; c.height=12; const x=c.getContext('2d');
  const n=parseInt(col.slice(1),16), dk=`rgb(${(n>>16&255)*0.6|0},${(n>>8&255)*0.6|0},${(n&255)*0.6|0})`;
  const P={k:'#1a0f14',c:'#9a6a32',g:'#cfdcea',h:'#ffffff',o:col,O:dk};
  M.forEach((r,y)=>{ for(let i=0;i<12;i++){ const ch=r[i]; if(ch==='.') continue; x.fillStyle=P[ch]; x.fillRect(i,y,1,1); } });
  return POT_ICON[col]=c.toDataURL(); }
const prof=()=>S.prof||(S.prof={k:0,b:0,g:0,t:0,p:0,i:0});
function fmtTime(s){ s=Math.floor(s); const d=Math.floor(s/86400), hh=Math.floor(s%86400/3600), m=Math.floor(s%3600/60); return d?`${d} д ${hh} ч`:hh?`${hh} ч ${m} мин`:`${m} мин`; }
function potDrink(id){ const s=potSt(); if(!(s.own[id]>0)) return; SND.play('potion'); prof().p++; s.own[id]--; s.t[id]=Math.min(Date.now()+POT_MAX,Math.max(Date.now(),s.t[id]||0)+POT_DUR);
  const P=POTS.find(p=>p.id===id); banner(P.name,P.desc,1.3); for(let i=0;i<18;i++) parts.push({x:HX+rnd(-10,10),y:GY-rnd(0,36),vx:rnd(-15,15),vy:rnd(-70,-20),life:rnd(.5,.9),max:.9,col:P.col,s:1.5,g:0}); save(); renderPanel(); }
function potBuy(id){ const pr=potPrice(); if(S.gold<pr) return; SND.play('buy'); S.gold-=pr; const s=potSt(); s.own[id]=(s.own[id]||0)+1; save(); renderPanel(); }
const fmtMin=ms=>{ const m=Math.ceil(ms/60000); return m>=60?Math.floor(m/60)+' ч'+(m%60?' '+m%60+' мин':''):m+' мин'; };
