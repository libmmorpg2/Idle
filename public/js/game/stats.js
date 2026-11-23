/* ---------- balance ---------- */
const buff={power:0,guard:0,shield:0,shieldT:0};
const soulM=()=>1;
function pv(k){ let v=0; const L=PSV[S.hero]||[], lv=(S.psv&&S.psv[S.hero])||{}, ln=(S.learn&&S.learn[S.hero])||{}; for(const p of L) if(p.id===k && ln['p'+p.id]) v+=(lv[p.id]||0)*p.per; return v; }
const isL=(c,key)=>!!(S.learn&&S.learn[c]&&S.learn[c][key]);
const bookN=(c,key)=>(S.books&&S.books[c]&&S.books[c][key])||0;
const bookPct=z=>0.000005*z;               // percent per kill
function bookName(c,key){ if(key[0]==='a') return SKS[c][+key.slice(1)].name; const p=PSV[c].find(x=>x.id===key.slice(1)); return p?p.name:key; }
const BOOK_MAP=["............",".##########.",".#oooooooo#.",".#o######o#.",".#o#oooo#o#.",".#o#o##o#o#.",".#o#oooo#o#.",".#o######o#.",".#oooooooo#.",".##########.","..o######o..","............"];
const GLYPH={
 boom:[".....#......","..#..#..#...","...#.#.#....","....ooo.....","#..ooooo..#.",".##ooooo##..","#..ooooo..#.","....ooo.....","...#.#.#....","..#..#..#...",".....#......","............"],
 tri:["............",".##.........","#oo#........","#oo#..##....",".##..#oo#...","....#oo#.##.",".....##.#oo#","........#oo#",".........##.","............","............","............"],
 up:[".....##.....","....#oo#....","...#oooo#...","..#oooooo#..",".####oo####.","....#oo#....","....#oo#....","....#oo#....","....#oo#....","....####....","............","............"],
 bolt:["......####..",".....#oo#...","....#oo#....","...#oo#.....","..#oooooo#..","....#oo#....","...#oo#.....","..#oo#......",".#oo#.......",".###........","............","............"],
 shield:["############","#oooooooooo#","#oo######oo#","#oo#oooo#oo#","#oo#oooo#oo#",".#o#oooo#o#.",".#oo####oo#.","..#oooooo#..","...#oooo#...","....#oo#....",".....##.....","............"],
 bullets:["............",".##..##..##.","#oo##oo##oo#","#oo##oo##oo#","#oo##oo##oo#","#oo##oo##oo#","############","#oo##oo##oo#","############","............","............","............"],
 pierce:["............","........#...","........##..","#.#.....#o#.",".#.#####ooo#","#.#ooooooooo",".#.#####ooo#","#.#.....#o#.","........##..","........#...","............","............"],
 fire:[".....#......","....#o#.....","....#o#.#...","...#oo##o#..","..#ooo#oo#..","..#oooooo#..",".#oo##ooo#..",".#o#oo#oo#..",".#o#oo#oo#..","..#oooooo#..","...######...","............"],
 cross:["............","#o.......o#.",".#o.....o#..","..#o...o#...","...#o.o#....","....#o#.....","....#o#.....","...#o.o#....","..#o...o#...",".#o.....o#..","#o.......o#.","............"],
 star:[".....##.....",".....##.....","....#oo#....","#####oo#####",".#oooooooo#.","..#oooooo#..","...#oooo#...","..#oo##oo#..",".#o#....#o#.",".##......##.","............","............"],
 rain:["#...#...#...","#...#...#...","#...#...#...","#...#...#...","o...o...o...","#...#...#...","#...#...#...","#o#.#o#.#o#.",".o...o...o..","............","............","............"],
};
const ACT_GLYPH={mage:['boom','tri','up','bolt','shield'],tank:['shield','boom','up','star','hp'],asn:['cross','pierce','fire','bullets','star'],sam:['star','shield','rain','pierce','hp']};
const COVER=['#6a2a8a','#2a4a9a','#9a3a2a','#2a7a5a','#8a6a1a','#3a2a6a','#1a6a7a','#7a1a3a','#4a5a1a'];
const CLS_OFF={mage:0,tank:2,asn:4,sam:6};
const bookIcCache={};
function bookGlyph(c,key){ if(key[0]==='a'){ const g=ACT_GLYPH[c][+key.slice(1)]; return GLYPH[g]||PSV_ICON[g]; } const p=PSV[c].find(x=>x.id===key.slice(1)); return PSV_ICON[p?p.ic:'dmg']; }
function bookIcon(c,key){ key=key||'a0'; const ck=c+key; if(bookIcCache[ck]) return bookIcCache[ck];
  const keys=[...SKS[c].map((s,i)=>'a'+i),...PSV[c].map(p=>'p'+p.id)], idx=Math.max(0,keys.indexOf(key));
  const cov=COVER[(idx+CLS_OFF[c])%COVER.length];
  const N=22, Z=3, cv=document.createElement('canvas'); cv.width=N*Z; cv.height=N*Z; const x=cv.getContext('2d');
  const px=(i,j,col)=>{ x.fillStyle=col; x.fillRect(i*Z,j*Z,Z,Z); };
  const dark=(h,f)=>{ const n=parseInt(h.slice(1),16); const r=(n>>16)&255,g=(n>>8)&255,b=n&255; return `rgb(${r*f|0},${g*f|0},${b*f|0})`; };
  for(let j=1;j<=19;j++) for(let i=1;i<=20;i++){
    const edge=i===1||i===20||j===1||j===19;
    if(j===19 && i>=3 && i<=19) continue;
    px(i,j,edge?'#120a18':(i<=3?dark(cov,.55):cov)); }
  for(let i=3;i<=19;i++){ px(i,19,'#e8dcc0'); px(i,20,'#120a18'); } px(2,19,'#120a18'); px(20,19,'#120a18');
  for(let i=4;i<=19;i++){ px(i,2,'#c9a25a'); px(i,17,'#c9a25a'); }
  px(4,3,'#f3d27a'); px(19,3,'#f3d27a'); px(4,16,'#f3d27a'); px(19,16,'#f3d27a');
  const g=bookGlyph(c,key);
  g.forEach((row,j)=>{ for(let i=0;i<12;i++){ const ch=row[i]; if(!ch||ch==='.') continue; px(6+i+1,4+j+1,'rgba(0,0,0,.55)'); } });
  g.forEach((row,j)=>{ for(let i=0;i<12;i++){ const ch=row[i]; if(!ch||ch==='.') continue; px(6+i,4+j,ch==='o'?'#ffffff':'#f3d27a'); } });
  for(let j=18;j<=21;j++){ px(16,j,CLS_COL[c]); px(17,j,CLS_COL[c]); } x.clearRect(16*Z,21*Z+Z/2,2*Z,Z/2);
  return bookIcCache[ck]=cv.toDataURL(); }
function learnKey(key){ const c=S.hero; if(isL(c,key)||bookN(c,key)<1) return; S.books[c][key]--; S.learn[c][key]=1; banner(T('Навык изучен'),bookName(c,key),1.6); buildSkillButtons(); renderPanel(); save(); }
