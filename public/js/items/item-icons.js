/* ---------- mage gear icons (20x20, tiered by rarity) ---------- */
// k outline, m material, M material shade, h highlight, t trim, T trim shade, g gem, G gem shine, w wood, W wood shade
// tier-gated: 3 = trim from epic+, 4 = gem from legendary+, 5 = gem from mythic
const MAGE_ICON={
 weapon:[
 "...............5....",
 "............4kkk4...",
 "...........kgGggk...",
 "..........kgGgggk3..",
 "..........kgggggk...",
 ".........3ktgggtk...",
 "..........tkkkkkt...",
 ".........ktt..3.t...",
 "........kwWk........",
 ".......kwWk.........",
 "......kwWk..........",
 ".....kttTk..........",
 "....kwWk............",
 "...kwWk.............",
 "..kwWk..............",
 ".kwWk...............",
 "kwWk................",
 "kWk.................",
 "kk..................",
 "...................."],
 helm:[
 ".........5..........",
 "..........kk........",
 ".........kmk........",
 "........kmmk........",
 ".......kmhmk........",
 ".......kmmmk........",
 "......kmhmmmk.......",
 "......kmmmmmk.......",
 ".....kmmhmmmmk......",
 ".....kmmmmmmmk......",
 "....kmmmmmmmmmk.....",
 "...3kttttgttttk3....",
 "...kTttttgttttTk....",
 ".kkmmmmmmmmmmmmmkk..",
 "kmmhmmmmmmmmmmmmmmk.",
 "kMMMMMMMMMMMMMMMMMk.",
 ".kkkkkkkkkkkkkkkkk..",
 "....................",
 "....................",
 "...................."],
 armor:[
 "....................",
 "......kkkkkkk.......",
 "....3kTtgggtTk3.....",
 "...kkmmktktkmmkk....",
 "..kmmmmmktkmmmmmk...",
 ".kmmhmmmktkmmmhmmk..",
 ".kmmmmmmktkmmmmmmk..",
 ".kmkmmmmktkmmmmkmk..",
 ".kmkmmmmktkmmmmkmk..",
 ".kk.kttttgttttk.kk..",
 "....kmmmmtmmmmk.....",
 "...kmmmmmtmmmmmk....",
 "...kmmhmmtmmmhmk....",
 "..kmmmmmmtmmmmmmk...",
 "..kMMMMMMtMMMMMMk...",
 "..kttttttTttttttk...",
 "..kkkkkkkkkkkkkkk...",
 "....................",
 "....................",
 "...................."],
 gloves:[
 "....................",
 "......k.k.k.........",
 ".....kmkmkmk........",
 ".....kmkmkmkk.......",
 ".....kmkmkmkmk......",
 ".....kmhmhmkmk......",
 "...kkkmmmmmmmk......",
 "..kmmkmmmmhmmk......",
 "..kmmmmmmmmmk.......",
 "...kmmmmmmmmk.......",
 "...3kttgttttk3......",
 "....kTTTTTTTk.......",
 ".....kkkkkkk........",
 "....................",
 "....................",
 "....................",
 "....................",
 "....................",
 "....................",
 "...................."],
 belt:[
 "....................",
 "....................",
 "....................",
 "....................",
 "kkkkkkkkkkkkkkkkkkkk",
 "kmmhmmmmkttttkmmhmmk",
 "kmmmmmmmktggtkmmmmmk",
 "kMMMMMMMktgGtkMMMMMk",
 "kMMMMMMMkttttkMMMMMk",
 "kkkkkkkkkkkkkkkkkkkk",
 "...kk.....3...kk....",
 "..kmmk........kwk...",
 ".kmhmmk.......kwk...",
 ".kmmmmk......kgggk..",
 ".kMMMMk......kgGgk..",
 "..kkkk........kkk...",
 "....................",
 "....................",
 "....................",
 "...................."],
 pants:[
 "....................",
 "....................",
 "...kkkkkkkkkkkkk....",
 "...kttttgtttttTk....",
 "...kmmmmhmmmmmmk....",
 "...kmmmmmkmmmmmk....",
 "...kmmmmk.kmmmmk....",
 "...kmmmk...kmmmk....",
 "...kmhmk...kmhmk....",
 "...kmmmk...kmmmk....",
 "...kmmmk...kmmmk....",
 "..3kmmmk...kmmmk3...",
 "..kMMMMk...kMMMMk...",
 "..kttttk...kttttk...",
 "..kkkkkk...kkkkkk...",
 "....................",
 "....................",
 "....................",
 "....................",
 "...................."],
 boots:[
 "....................",
 "....................",
 "..kkkkk....kkkkk....",
 "..kTttk....kTttk....",
 "..kmmmk....kmmmk....",
 "..kmhmk....kmhmk....",
 "..kmmmk....kmmmk....",
 "..kmmmk....kmmmk....",
 "..kmmmkk...kmmmkk...",
 "..kmmmmmk..kmmmmmk..",
 ".3kmmmmmmk3kmmmmmmk.",
 "..kMMMMMMk.kMMMMMMk.",
 "..kttgtttk.kttgtttk.",
 "..kkkkkkkk.kkkkkkkk.",
 "....................",
 "....................",
 "....................",
 "....................",
 "....................",
 "...................."],
 cloak:[
 "....................",
 ".......kkkkk........",
 "......kTgGgTk.......",
 ".....kmmtttmmk......",
 "....kmmmmkmmmmk.....",
 "...kmmhmkMkmmmmk....",
 "...kmmmkMMMkmmmk....",
 "..kmmmmkMMMkmmmmk...",
 "..kmhmkMMMMMkmmmk...",
 "..kmmmkMMMMMkmhmk...",
 ".kmmmmkMMMMMkmmmmk..",
 ".kmmmkMMMMMMMkmmmk..",
 ".kMMMkMMMMMMMkMMMk..",
 "3ktttkkkkkkkkktttk3.",
 ".kkkk.........kkkk..",
 "....................",
 "....................",
 "....................",
 "....................",
 "...................."],
 amulet:[
 "...k...........k....",
 "....k.........k.....",
 ".....t.......t......",
 "......k.....k.......",
 ".......t...t........",
 "........kTk.........",
 ".......kTtTk........",
 "......3kttttk3......",
 ".....kttgggttk......",
 "....ktggGggggtk.....",
 "....ktggggggggtk....",
 "....ktgggggggtk.....",
 ".....ktggggttk......",
 "......kttttTk.......",
 ".......kTTTk........",
 "........k4k.........",
 ".........5..........",
 "....................",
 "....................",
 "...................."],
 ring:[
 "....................",
 "....................",
 "........kkkk........",
 ".......kgGggk.......",
 "......3kggggk3......",
 "......ktggggtk......",
 ".....kttkkkkttk.....",
 "....ktTk....kTtk....",
 "....ktk......ktk....",
 "....ktk......ktk....",
 "....ktk......ktk....",
 "....kttk....kttk....",
 ".....kttkkkkttk.....",
 "......kkTTTTkk......",
 "........kkkk........",
 "....................",
 "....................",
 "....................",
 "....................",
 "...................."],
};
const MAGE_MAT=[
 {m:'#6b5a4a',M:'#45392f',h:'#8c7866'},
 {m:'#3f7a4a',M:'#2a5233',h:'#5fa36a'},
 {m:'#2f4f9a',M:'#1f356a',h:'#4f74c8'},
 {m:'#5a2f8a',M:'#3c1d5e',h:'#8150c0'},
 {m:'#8a2a2a',M:'#5c1a1a',h:'#c04a3a'},
 {m:'#1f5a6e',M:'#123c4a',h:'#2f8aa0'},
];
const TRIM=[['#7a7480','#4e4a55'],['#b0b0ba','#73737e'],['#e0b040','#9a6a20'],['#e8c050','#a07020'],['#f0c858','#a87420'],['#f4d870','#b08830']];
const GEM=['#9aa0a8','#5fd39b','#5aa8ff','#c46bff','#ff9a3a','#5ff0ff'];
const mageIconCache={};
function mageIcon(slot,rar,cls){
  cls=cls||'mage'; const key=cls+slot+rar; if(mageIconCache[key]) return mageIconCache[key];
  const map=CLASS_ICON[cls][slot], Z=4, N=20, P=3, W=N+P*2, mat=MAGE_MAT[rar], tr=TRIM[rar], gem=GEM[rar];
  const plainSlot=slot!=='weapon'&&slot!=='amulet'&&slot!=='ring';
  // 1) char grid with padding and grade rules
  const g=Array.from({length:W},()=>Array(W).fill('.'));
  map.forEach((row,j)=>{ for(let i=0;i<N;i++){ let ch=row[i]; if(!ch||ch==='.') continue;
    if(ch==='3'){ if(rar<3) continue; ch='t'; } else if(ch==='4'){ if(rar<4) continue; ch='g'; } else if(ch==='5'){ if(rar<5) continue; ch='G'; }
    if(rar===0){ if(ch==='t') ch='M'; else if(ch==='T') ch='k'; else if(ch==='g'&&plainSlot) ch='M'; else if(ch==='g') ch='d'; }
    else if(rar===1 && ch==='g' && plainSlot) ch='t';
    g[j+P][i+P]=ch; } });
  const at=(i,j)=>(i<0||j<0||i>=W||j>=W)?'.':g[j][i];
  const empty=c=>c==='.'||c==='k';
  // 2) volume shading
  for(let j=0;j<W;j++) for(let i=0;i<W;i++){ const c=g[j][i];
    if(c==='m'){ if(empty(at(i,j-1))&&empty(at(i-1,j))) g[j][i]='h'; else if(empty(at(i,j+1))||empty(at(i+1,j+1))) g[j][i]='M'; }
    else if(c==='t' && empty(at(i,j+1))) g[j][i]='T'; }
  // 3) grade ornaments
  let seed=(slot.length*31+rar*7+cls.length*13)|0; const rnd2=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const tops=[]; for(let i=0;i<W;i++){ for(let j=0;j<W;j++){ if(g[j][i]!=='.'){ tops.push([i,j]); break; } } }
  if(rar===0){ for(let n=0;n<4;n++){ const [i,j]=tops[Math.floor(rnd2()*tops.length)]||[0,0]; for(let d=1;d<4;d++) if(g[j+d]&&g[j+d][i]==='m') { g[j+d][i]='x'; break; } } } // scratches
  if(rar>=3){ tops.forEach(([i,j],n)=>{ if(n%3===1 && j>1 && at(i,j-1)==='.'){ g[j-1][i]='t'; if(rar>=4 && j>2 && at(i,j-2)==='.') g[j-2][i]='T'; } }); } // spikes
  if(rar>=4){ tops.forEach(([i,j],n)=>{ if(rnd2()<0.45){ const up=rar>=5?2:1+Math.floor(rnd2()*2); for(let d=1;d<=up+1;d++){ if(j-d-1<0) break; if(at(i,j-d-1)==='.') g[j-d-1][i]=d===up+1?'F':'f'; } } }); } // flames / aura flares
  if(rar>=5){ [[1,1],[W-3,1],[1,W-3],[W-3,W-3]].forEach(([i,j])=>{ [[1,0],[0,1],[1,1],[2,1],[1,2]].forEach(([a,b])=>{ if(at(i+a,j+b)==='.') g[j+b][i+a]=(a===1&&b===1)?'C':'c'; }); }); } // crystal shards
  // 4) paint
  const fl=rar>=5?['#5ff0ff','#e8ffff']:['#ff7a2a','#ffe08a'];
  const pal={k:'#120a18',m:mat.m,M:mat.M,h:mat.h,t:tr[0],T:tr[1],g:gem,G:'#ffffff',d:'#4a4650',w:'#7a4e2a',W:'#4e3018',n:'#c8ccd4',N:'#7a8090',x:'#2a2228',f:fl[0],F:fl[1],c:'#5ff0ff',C:'#ffffff'};
  const src=document.createElement('canvas'); src.width=W*Z; src.height=W*Z; const x=src.getContext('2d');
  for(let j=0;j<W;j++) for(let i=0;i<W;i++){ const c=g[j][i]; if(c==='.') continue; x.fillStyle=pal[c]||'#f0f'; x.fillRect(i*Z,j*Z,Z,Z); }
  if(rar>=2){ const sp=[[2,3],[W-3,W-5],[W-4,2],[3,W-4]].slice(0,rar-1); const sc=rar>=5?'#c8ffff':'#ffffff';
    for(const [i,j] of sp){ if(at(i,j)!=='.') continue; x.fillStyle=sc; x.fillRect(i*Z,j*Z,Z,Z); if(rar>=3){ x.globalAlpha=.6; x.fillStyle=gem; [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>x.fillRect((i+a)*Z,(j+b)*Z,Z,Z)); x.globalAlpha=1; } } }
  const out=document.createElement('canvas'); out.width=W*Z+8; out.height=W*Z+8; const o=out.getContext('2d');
  o.imageSmoothingEnabled=false;
  if(rar>=2){ o.shadowColor=gem; o.shadowBlur=[0,0,5,8,11,15][rar]; o.drawImage(src,4,4); if(rar>=4) o.drawImage(src,4,4); o.shadowBlur=0; }
  o.drawImage(src,4,4);
  return mageIconCache[key]=out.toDataURL();
}
const GUN_ICON={
 weapon:["....................","....................","....................","...............5....",".....kkkkkkkkkkkkkk.","....kknnnnnnnnnnnnnk","....ktNNNNNNNNNNNNk.","...kttttkkkkkkkkkk..","...ktgtk3...........","...kttttk.k.........","..kwwkkk.kk.........","..kwWWk.k...........",".kwwWk..............",".kwW4k..............","kwwWk...............","kwWWk...............",".kkk................","....................","....................","...................."],
 helm:["....................","....................","....................","......kkkkkkk.......",".....kmmmhmmmk......","....kmmmmkmmmmk.....","....kmmmhmmmmmk.....","....kmmmmmmmmmk.....","...3kttttgttttk3....",".kkkTTTTTTTTTTTkkk..","kmmhmmmmmmmmmmmmmmk.",".kMMMMMMMMMMMMMMMk..","..kkkkkkkkkkkkkkk...","....................","....................","....................","....................","....................","....................","...................."],
 armor:["....................","......kk....kk......",".....kmk....kmk.....","....kmmk....kmmk....","...kmmhk....kmmmk...","...kmmmtk..ktmmmk...","...kmmmmtkktmmmmk...","...kmmmmtgtgmmmmk...","...kmmhmkttkmmhmk...","...kmmmmk..kmmmmk...","...kmmmmk..kmmmmk...","..3kMMMMk..kMMMMk3..","...kttttk..kttttk...","...kkkkkk..kkkkkk...","....................","....................","....................","....................","....................","...................."],
 belt:["kk..................","kmk.................",".kmnk...............","..kmnk..............","...kmnk.............","....kmnk............",".....kmnk...........","......kmnk..........",".......kmnk.........","........kmnk........","....kkkkkkttkkkkkkkk","....kmmhmktgtkmmhmmk","....kMMMMkttkMMMMMMk","....kkkkkkkkkkkkkkkk",".........3..........","....................","....................","....................","....................","...................."],
 boots:["....................","....................","...kkkkk...kkkkk....","...kTtTk...kTtTk....","...kmmmk...kmmmk....","...kmhmk...kmhmk....","...kmmmk...kmmmk....","...kmmmk...kmmmk....","...kmmmkk..kmmmkk...","...kmmmmmk.kmmmmmk..","..3kmmmmmmkkmmmmmmk.","...kMMMMMMkkMMMMMMk.","...kkkkkkkkkkkkkkkk.","..nnk......nnk......","...n........n.......","....................","....................","....................","....................","...................."],
 cloak:[".....kkk...kkk......","....kmmk...kmmk.....","...kmmmtk.ktmmmk....","..kmmmmtkgktmmmmk...","..kmhmmmktkmmmhmk...","..kmmmmmktkmmmmmk...",".kmmkmmmktkmmmkmmk..",".kmmkmmmktkmmmkmmk..",".kmk.kmmktkmmk.kmk..",".kk..kmmktkmmk..kk..",".....kmmktkmmk......",".....kmhktkmhk......","....3kMMktkMMk3.....",".....kttkkkttk......",".....kkk...kkk......","....................","....................","....................","....................","...................."],
 amulet:["...k...........k....","....k.........k.....",".....k.......k......","......k.....k.......",".......k...k........",".........t..........","........ktk.........","...kkkkktgtkkkkk....","....kttttgttttk.....",".....kttgGgttk......","......kttgttk.......",".....ktttkttk.......","....kttk...kttk.....","....kk.......kk.....",".........4..........",".........5..........","....................","....................","....................","...................."],
};
const SAM_ICON={
 weapon:[".....kk.............","......kwk...........","......kwWk....5.....",".......kwk.n........",".......kwk..n.......","........kwkn........","........ktt.........","........kgt.....3...","........ktt.........","........kwkn........",".......kwk..n.......",".......kwk.n........","......kwWk..........","......kwk...........",".....kk.............","....................","....................","....................","....................","...................."],
 helm:["..3k..........k3....","...ktk......ktk.....","....ktk....ktk......",".....kttkkttk.......","......kkgGkk........",".....kmmmmmmk.......","....kmmhmmmmmk......","...kmmmmmmmmmmk.....","..kttttttttttttk....",".kmmkmmmmmmmmkmmk...","kmmmkmmmmmmmmkmmmk..","kMMk.kkkkkkkk.kMMk..",".kk............kk...","....................","....................","....................","....................","....................","....................","...................."],
 armor:["....kkk....kkk......","...kmmmk..kmmmk.....","..kmhmmmkkmmmhmk....","..kmmmmttttmmmmk....","..kmmmktggtkmmmk....","..kttttttttttttk....","..kmmmmmmmmmmmmk....","..kMMMMMMMMMMMMk....","..kttttttttttttk....","..kmmhmmmmmmhmmk....","..kMMMMMMMMMMMMk....",".3kttttttttttttk3...","..kmmmkmmmmkmmmk....","..kMMMkMMMMkMMMk....","..kkkkkkkkkkkkkk....","....................","....................","....................","....................","...................."],
 belt:["....................","....................","....................","kkkkkkkkkkkkkkkkkkkk","kmmmmmmmkttkmmmmmmmk","kmmhmmmktgtkmmmhmmk.","kMMMMMMMkttkMMMMMMMk","kkkkkkkkktkkkkkkkkkk","........kmmk........",".......kmmmmk.......",".......kmk.kmk......","......kmk...kmk.....","......kMk...kMk.....",".......kk...kk......",".........3..........","....................","....................","....................","....................","...................."],
 pants:["...kkkkkkkkkkkk.....","...kttttgttttTk.....","...kmmmmmmmmmmk.....","..kmmhmmkmmmhmmk....","..kmmmmk.kmmmmmk....",".kmmmmmk.kmmmmmmk...",".kmmkmmk.kmmkmmmk...",".kmmkmmk.kmmkmmmk...","kmmmkmmk.kmmkmmmmk..","kMMMkMMk.kMMkMMMMk..","kttttttk.kttttttttk.","kkkkkkkk.kkkkkkkkkk.","3..................3","....................","....................","....................","....................","....................","....................","...................."],
 cloak:["......kkkkkk........","....kkmtggtmkk......","..kkmmmktkmmmmkk....",".kmmmmmktkmmmmmmk...","kmmhmmmktkmmmmhmmk..","kmmmmmmktkmmmmmmmk..","kMMMkmmktkmmkMMMMk..",".kkkkmmktkmmkkkkk...","....kmmktkmmk.......","....kmhktkmhk.......","...3kMMktkMMk3......","....kttktkttk.......","....kkkkkkkkk.......","....................","....................","....................","....................","....................","....................","...................."],
 amulet:["........kk..........",".......kttk.........","......kt..tk........",".......kttk.........","......kkkkkk........",".....kmmmmmmk.......",".....kmtttttk.......",".....kmmgGmmk.......",".....kmmggmmk.......",".....kmmmmmmk.......",".....kmhmmmmk.......",".....kMMMMMMk.......","....3ktttttTk3......",".....kkkkkkkk.......","........4...........","........5...........","....................","....................","....................","...................."],
};
GUN_ICON.gloves=MAGE_ICON.gloves; GUN_ICON.pants=MAGE_ICON.pants; GUN_ICON.ring=MAGE_ICON.ring;
SAM_ICON.gloves=MAGE_ICON.gloves; SAM_ICON.boots=MAGE_ICON.boots; SAM_ICON.ring=MAGE_ICON.ring;
const TANK_ICON={weapon:["....................", "..kkkkkkkkkkkkkk....", ".khhnnnnnnnnnnnNk...", ".knnnnnnttnnnnnNk...", ".knnnnnt4gtnnnnNk...", ".knnnnnnttnnnnnNk...", ".kNNNNNNNNNNNNNNk...", "..kkkkkkwWkkkkkk....", "........kwWk........", "........kwWk........", ".......3ktTk3.......", "........kwWk........", "........kwWk........", "........kwWk........", "........kwWk........", "........ktTk........", "........kwWk........", "........kTTk........", ".........kk.........", "...................."],helm:[".........3..........", "........kttk........", "......kkkkkkkk......", ".....kmhmmmmmMk.....", "....kmhmmmmmmmMk....", "....kmhmmmmmmmMk....", "....kmmmtttttmMk....", "....kkkkkkkkkkkk....", "....kmmmmkkmmmMk....", "....kmhmmkkmmmMk....", "....kmmmmkkmmmMk....", "....kmmmmmmmmmMk....", "....ktttt4tttttk....", ".....kkkkkkkkkk.....", "....................", "....................", "....................", "....................", "....................", "...................."],armor:["....................", "..kkkk.......kkkk...", ".kmhmmkkkkkkkmmmMk..", ".kmmmmkmmhmmkmmmMk..", ".kmmmMkmmmmmkMmmMk..", "..kkkkmmmtmmmkkkk...", "....kmhmmtmmmMk.....", "....kmmmmtmmmMk.....", "....kmmmm4mmmMk.....", "....ktttttttttk.....", "....kmmmmmmmmMk.....", "....kmMmMmMmMMk.....", ".....kkkkkkkkk......", "....................", "....................", "....................", "....................", "....................", "....................", "...................."],gloves:MAGE_ICON.gloves,belt:SAM_ICON.belt,pants:SAM_ICON.pants,boots:GUN_ICON.boots,cloak:SAM_ICON.cloak,amulet:MAGE_ICON.amulet,ring:MAGE_ICON.ring};
const ASN_ICON={weapon:["..........k.........", ".........knk........", ".........knNk.......", ".........knNk.......", ".........knNk.......", ".........knNk.......", ".........knNk.......", ".........kn5k.......", ".........kn4k.......", ".......kkktkkk......", ".......kTtgttTk.....", "........kkwkk.......", ".........kwk........", ".........kWk........", ".........kwk........", "........3ktk3.......", ".........kk.........", "....................", "....................", "...................."],helm:["....................", "........kkkk........", "......kkmmmmkk......", ".....kmmhmmmmMk.....", "....kmmhmmmmmMMk....", "....kmhmkkkkkkMk....", "....kmmkkgkkgkMk....", "....kmmkkkkkkkMk....", "....kmmttttttttMk...", "...kmmmmmmmmmmMMk...", "..kmmhmmmmmmmmMMMk..", "..kkkkkkkkkkkkkkkk..", "....................", "....................", "....................", "....................", "....................", "....................", "....................", "...................."],armor:GUN_ICON.armor,gloves:MAGE_ICON.gloves,belt:GUN_ICON.belt,pants:MAGE_ICON.pants,boots:GUN_ICON.boots,cloak:GUN_ICON.cloak,amulet:GUN_ICON.amulet,ring:MAGE_ICON.ring};
const CLASS_ICON={mage:MAGE_ICON,tank:TANK_ICON,asn:ASN_ICON,sam:SAM_ICON};

const iconCache={};
function itemIcon(cls,slot,rar){
  if(CLASS_ICON[cls]) return mageIcon(slot,rar,cls);
  const key=cls+slot+rar; if(iconCache[key]) return iconCache[key];
  const map=ICONS[slot==='weapon'?'weapon_'+cls:slot];
  const c=document.createElement('canvas'); c.width=12; c.height=12; const x=c.getContext('2d');
  map.forEach((row,y)=>{ for(let i=0;i<12;i++){ const ch=row[i]; if(ch==='.'||!ch) continue; x.fillStyle=ch==='o'?RAR[Math.min(rar,5)].col:CLS_COL[cls]; x.fillRect(i,y,1,1);} });
  return iconCache[key]=c.toDataURL();
}
