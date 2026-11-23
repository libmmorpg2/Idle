/* ---------- capes ---------- */
const CAPE_MAP=["......kkkkkkkk......",".....ktttGgtttk.....","....kttttggttttk....","...ktkmhmggmmMMtk...","....kmhmmmmmmMMk....","....kmhmmmmmmMMk....","...kmhmmmmmmmmMMk...","...kmhmMmmmMmmMMk...","...kmhmmMmmMmmmMMk..","..kmhmmMmmmMmmmMMk..","..kmhmmMmmmMmmmMMk..",".kmhmmMMmmmMmmmmMMk.",".kmhmmMMmmmMmmmmMMk.",".kmhmmmMmmmmMmmmmMMk","kmhmmmMmmmmmMmmmmMMk","kmhmmmMmmmmmMmmmmMMk","tttttttttttttttttttt","kTTkTTkTTkTTkTTkTTkk",".kk.kk.kk.kk.kk.kk..","...................."];
const EMBLEM={
 leaf:["...e.","..ee.",".eEe.",".ee..","e...."],
 flame:["..e..",".ee..",".eEe.","eeEee",".eee."],
 snow:["e.e.e",".eee.","eeEee",".eee.","e.e.e"],
 star:["..e..",".eee.","eeEee",".eee.","e...e"],
 eye:[".....",".eee.","eeEee",".eee.","....."],
 wings:["e...e","ee.ee","eeEee",".eee.","..e.."],
 sun:["e.e.e",".eee.","eeEee",".eee.","e.e.e"],
};
const CAPES=[
 {id:'travel',name:T('Дорожный плащ'),rar:0,buff:{hp:5},m:'#7a5a3a',h:'#a07a52',M:'#4e3820',t:'#8a8a8a',T:'#5a5a5a',g:'#c8c8c8',em:null,price:3000},
 {id:'ranger',name:T('Плащ следопыта'),rar:1,buff:{crit:2,gold:5},m:'#3f7a3a',h:'#5fa35a',M:'#2a5226',t:'#b0b0ba',T:'#73737e',g:'#5fd39b',em:'leaf',price:15000},
 {id:'crimson',name:T('Багровый плащ'),rar:2,buff:{dmg:6},m:'#9a1e22',h:'#c83a3a',M:'#5c1014',t:'#e0b040',T:'#9a6a20',g:'#ff5a3a',em:'flame',price:80000},
 {id:'frost',name:T('Плащ вечной зимы'),rar:3,buff:{hp:15,regen:0.5},m:'#2a6a9a',h:'#4a9ac8',M:'#183e60',t:'#e8f4ff',T:'#8ab0d0',g:'#8fe8ff',em:'snow',price:350000},
 {id:'archmage',name:T('Плащ архимага'),rar:3,buff:{dmg:10,aps:5},m:'#4a2a8a',h:'#7050c0',M:'#2a1458',t:'#e8c050',T:'#a07020',g:'#c46bff',em:'star',price:400000},
 {id:'shadow',name:T('Покров тени'),rar:4,buff:{crit:5,aps:12},m:'#2a2238',h:'#4a3e62',M:'#141020',t:'#b070ff',T:'#6a3aa8',g:'#d58cff',em:'eye',price:1500000},
 {id:'dragonslayer',name:T('Плащ драконоборца'),rar:4,buff:{dmg:15,hp:10},m:'#3a1a1a',h:'#6a2a22',M:'#1a0a0a',t:'#f0c858',T:'#a87420',g:'#ff5a2a',em:'wings',price:1800000},
 {id:'celestial',name:T('Мантия небожителя'),rar:5,buff:{dmg:20,aps:10,gold:15},m:'#e8e4fa',h:'#ffffff',M:'#aaa2d0',t:'#f4d870',T:'#b08830',g:'#5ff0ff',em:'sun',price:7000000},
];
const capeDef=()=>S.capes&&S.capes.act?CAPES.find(c=>c.id===S.capes.act):null;
const capeIcCache={};
function capeIcon(C){
  if(capeIcCache[C.id]) return capeIcCache[C.id];
  const Z=4, N=20, pal={k:'#120a18',m:C.m,h:C.h,M:C.M,t:C.t,T:C.T,g:C.g,G:'#ffffff',e:C.t,E:C.g};
  const src=document.createElement('canvas'); src.width=N*Z; src.height=N*Z; const x=src.getContext('2d');
  const put=(i,j,c)=>{ x.fillStyle=c; x.fillRect(i*Z,j*Z,Z,Z); };
  CAPE_MAP.forEach((row,j)=>{ for(let i=0;i<N;i++){ const ch=row[i]; if(ch!=='.') put(i,j,pal[ch]); } });
  if(C.em) EMBLEM[C.em].forEach((row,j)=>{ for(let i=0;i<5;i++){ const ch=row[i]; if(ch!=='.') put(7+i+1,7+j,pal[ch]); } });
  if(C.rar>=2){ const sp=[[1,2],[18,8],[17,1],[2,19]].slice(0,C.rar-1);
    for(const [i,j] of sp){ put(i,j,'#ffffff'); if(C.rar>=3){ x.globalAlpha=.6; put(i-1,j,C.g); put(i+1,j,C.g); put(i,j-1,C.g); put(i,j+1,C.g); x.globalAlpha=1; } } }
  const out=document.createElement('canvas'); out.width=N*Z+16; out.height=N*Z+16; const o=out.getContext('2d');
  if(C.rar>=3){ o.shadowColor=C.g; o.shadowBlur=C.rar>=5?14:C.rar>=4?11:8; o.drawImage(src,8,8); o.drawImage(src,8,8); o.shadowBlur=0; }
  o.drawImage(src,8,8);
  return capeIcCache[C.id]=out.toDataURL();
}
