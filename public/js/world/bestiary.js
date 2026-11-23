/* ---------- pixel enemies ---------- */
/* ---------- bestiary ---------- */
// sprites face RIGHT (they are flipped when drawn). k outline, a main, b light, d dark, e eye, w bone/white, r accent
const MON={
 slime:{name:'Слизень',mv:'hop',pal:{a:'#5fbf5a',b:'#b4f08a',e:'#fff3b0'},map:["................","................","................","................","......kkkk......","....kkaaaakk....","...kaaaaabbak...","..kaaaaaaabbak..","..kaaaaaaaabak..",".kaaaeeaaaeeaak.",".kaaaekaaaekaak.",".kaaaaaaaaaaaak.",".kaaaakkkaaaaak.",".kaaaaaaaaaaaak.","..kkaaaaaaaaakk.","...kkkkkkkkkkk.."]},
 mushroom:{name:'Мухомор',mv:'walk',pal:{r:'#d0423a',w:'#f3e6d0',b:'#e6d3b0',e:'#2a1a1a'},map:["................","................",".....kkkkkk.....","...kkrrwrrrkk...","..krrwwrrrwrrk..",".krrrrrrrwwrrrk.",".kwwrrrrrrrrwrk.",".kkkkkkkkkkkkkk.","....kbbbbbbk....","....kbbebbek....","....kbbbbbbk....","....kbbkkbbk....","....kbbbbbbk....",".....kbbbbk.....","....kk....kk....","................"]},
 bat:{name:'Нетопырь',mv:'fly',pal:{a:'#6a3fa8',b:'#a77be0',e:'#fff3b0'},map:["................","................","k..............k","kk....k..k....kk","kak...kkkk...kak","kaak.kaaaak.kaak","kaaakaaaaabkaaak","kaaaaaaeaaeaaaak","kaaaaaaaaaaaaaak",".kaaaaakkaaaaak.","..kaaaaaaaaaak..","...kak.kk.kak...","....k......k....","................","................","................"]},
 skeleton:{name:'Скелет',mv:'walk',pal:{w:'#e8e2cf',d:'#8f8878',e:'#ff5a3a'},map:["................","......kkkk......",".....kwwwwk.....",".....kwewek.....",".....kwwwwk.....","......kwdk......",".....kkwwkk.....","....kw.ww.wk....","....kwkwwkwk....",".....kwwwwk.....","......kwwk......","......kddk......",".....kw..wk.....",".....kw..wk.....","....kww..wwk....","................"]},
 wolf:{name:'Пепельный волк',mv:'walk',pal:{a:'#6b6f80',b:'#a3a8b8',d:'#43465a',e:'#ffd23a'},map:["................","................","................","................","............kk..","...........kbak.","...kkkkkkkkaaaak","..kaaaaaaaaaeaak",".kaaaaaaaaaaaaak","kdaaaaaaaaaaakk.",".kaaaaaaaaaaak..","..kaaddddddak...","..kak.kak.kak...","..kk..kk..kk....","................","................"]},
 wisp:{name:'Блуждающий огонь',mv:'fly',pal:{a:'#ff9a3a',b:'#ffd27a',e:'#ffffff'},map:["................","................",".......k........","......kbk.......",".....kbbk.......","....kbbbbk......","...kbbaabbk.....","...kbaaaabk.....","..kbaaeaeabk....","..kbaaaaaabk....","..kbaaaaaabk....","...kbaaaabk.....","....kkbbkk......","......kk........","................","................"]},
 ghost:{name:'Призрак',mv:'float',pal:{a:'#d9d0e3',b:'#ffffff',e:'#5aa8ff'},map:["................",".....kkkkkk.....","....kaaaabbk....","...kaaaaaabbk...","..kaaaaaaaaabk..","..kaaeeaaeeaak..","..kaaekaaekaak..","..kaaaaaaaaaak..","..kaaaakkaaaak..","..kaaaaaaaaaak..","..kaaaaaaaaaak..","..kaaaaaaaaaak..","..kakaakaakaak..","..k.kk.kk.kk.k..","................","................"]},
 eye:{name:'Око бездны',mv:'fly',pal:{w:'#f2efe6',r:'#c23b3b',e:'#1a0d10',d:'#b9b0a0'},map:["................",".....kkkkkk.....","...kkwwwwwwkk...","..kwwwwwwwwwwk..","..kwwwwrrrrwwk..",".kwwwwrreerrwwk.",".kwwwwreeeerwwk.",".kwwwwrreerrwwk.","..kwwwwrrrrwwk..","..kdwwwwwwwwdk..","...kkddwwddkk...",".....kkkkkk.....",".....k.kk.k.....","....k..k...k....","................","................"]},
 golem:{name:'Лунный голем',mv:'walk',pal:{a:'#7d7a8c',b:'#a9a6b8',d:'#55526a',e:'#8fd8ff'},map:["................","....kkkkkkkk....","...kaaaabbaak...","...kaaeaaaeak...","...kaaaaaaaak...",".kkkkaaaaaakkkk.","kbaakaaaaaakaaak","kaaakaabbaakaaak","kaaakaaaaaakaaak","kkkkaaaaaaaakkkk","...kddaaaaddk...","...kaak..kaak...","..kaaak..kaaak..","..kkkkk..kkkkk..","................","................"]},
 imp:{name:'Бес',mv:'walk',pal:{a:'#c23b3b',b:'#ff6b5a',d:'#7a1e22',e:'#ffe23a'},map:["................","...k......k.....","...kk....kk.....","....kaaaaak.....","...kaaaaabak....","...kaeaaeaak....","...kaaaaaaak....","...kakkkkkak....","....kaaaak......","..kkaaaaaakk....",".kaakaaaakaak...","..k.kddddk.k....","....kak.kak.....","....kk..kk......","................","................"]},
 spider:{name:'Паук теней',mv:'walk',pal:{a:'#3c2f4a',b:'#6a5480',e:'#ff3a5a'},map:["................","................","................","................",".....kkkkkk.....","....kaabbaak....","...kaaaaaaaak...","k.kaaaaaaaaaak.k",".kkaaaeaaeaaakk.","k.kaaaaaaaaaak.k",".k.kkkkkkkkkk.k.","k...k.k..k.k...k","...k..k..k..k...","................","................","................"]},
 wraith:{name:'Тень',mv:'float',pal:{a:'#3a2a5a',b:'#5a4a80',e:'#d58cff'},map:["................",".....kkkkk......","....kaaaabk.....","...kaakkkabk....","...kakekekak....","...kakkkkkak....","...kaaaaaaak....","..kaaaaaaaabk...","..kaaaaaaaaak...",".kaaaaaaaaaaak..",".kaaaaaaaaaaak..",".kakaakaakaak...",".k.kk.kk.kk.k...","................","................","................"]},
 leech:{name:'Кровопийца',mv:'hop',pal:{a:'#7a2a3a',b:'#b04a5a',e:'#ffd2a6'},map:["................","................","................","................","................","................","................","....kkkkkkk.....","...kaabaabak....","..kaaaaaaaaak...",".kaaaaaaaaaaek..",".kaaaaaaaaaaak..","..kaaaaaaaaak...","...kkkkkkkkk....","................","................"]},
 goblin:{name:'Болотный гоблин',mv:'walk',pal:{a:'#6a9a3a',b:'#9acd5a',d:'#6a4a2a',w:'#f3e6d0',e:'#ffe23a'},map:["................",".....kkkkk......","....kaaaabk.....","..kkaeaaeakk....","..kaaaaaaaak....","....kawwak......","....kkkkkk......","...kddddddk.....","..kakddddkak....","...kddddddk.....","....kd..dk......","....kk..kk......","................","................","................","................"]},
 toad:{name:'Ядовитая жаба',mv:'hop',pal:{a:'#3f7a5a',b:'#7ac08a',r:'#e0b03a',e:'#ffe23a'},map:["................","................","................","................","................","....kk...kk.....","...kekk.kkek....","..kaaaaaaaaak...",".kaaaaarraaaak..",".kaabaaaaaaaak..","kaaaaaaaaaaaaak.","kaaarraaaarraak.",".kkaakkkkkaakk..","..kk.......kk...","................","................"]},
};

Object.assign(MON,{
 treant:{name:'Лесной страж',mv:'walk',pal:{a:'#5a7a3a',b:'#8ab05a',d:'#5a3a20',e:'#ffe23a'},map:["....kk...kk.....","...kddk.kddk....","....kdkkdk......","...kkaaaakk.....","..kaaabbaaak....","..kaeaaaeaak....","..kaaakkaaak....","..kaaaaaaaak....","...kaaaaaak.....","...kaakkaak.....","..kdak..kadk....","..kdk....kdk....","..kk......kk...."]},
 beetle:{name:'Жук-рогач',mv:'walk',pal:{a:'#2a6a5a',b:'#5ac0a0',e:'#ffe23a'},map:["......kkkk......","....kkbaaakk....","...kbbaaaaaak...","..kaaaaaaaaaak..","..kaakaaaaaaakk.","..kaakaaaaaaaeak","..kaakaaaaaaaak.","...kkkkkkkkkkk..","...k.k..k..k.k..","..k..k..k..k..k."]},
 snake:{name:'Гадюка',mv:'walk',pal:{a:'#6a8a2a',b:'#a0c050',r:'#e0303a',e:'#ffe23a'},map:["..........kkk...",".........kaaek..",".........kaaaak.","....kkk..kaakrr.","...kaaak.kaak...","..kakkkak.kak...","..kak..kaakak...","...kaaaaaaak....","....kkkkkkk....."]},
 rabbit:{name:'Рогатый заяц',mv:'hop',pal:{a:'#c8b8a8',b:'#ffffff',r:'#e07a8a',e:'#2a1a1a'},map:["........k..k....",".......kak.kak..",".......kak.kak..","......kaaaaaak..","......kaeaaeak..","......kaaaaaak..","....kkkaarraak..","...kaaaaaaaak...","...kaaaaaaaak...","...kaaaaaaaak...","....kkkkkkkk...."]},
 zombie:{name:'Упырь',mv:'walk',pal:{a:'#7a9a6a',d:'#4a3a5a',e:'#ff3a3a'},map:["......kkkk......",".....kaaaak.....",".....keaeak.....",".....kaaaak.....","......kddk......","..kkkkddddkkkk..",".kaaakddddkaaak.","......kddddk....","......kddddk....","......kddddk....",".......kddk.....","......kd..dk....","......kd..dk....",".....kkk..kkk..."]},
 salamander:{name:'Саламандра',mv:'walk',pal:{a:'#c0442a',b:'#ff9a3a',r:'#ffe08a',e:'#ffffff'},map:["...........kkk..","..........kaaek.",".kk...kkkkaaaak.","krrk.kaaaaaaak..",".kraakbbbbbaak..","..kaaaaaaaaak...","...kak.kak.kak..","...kk..kk..kk..."]},
 crab:{name:'Болотный краб',mv:'walk',pal:{a:'#b0442a',b:'#e07a4a',e:'#ffffff'},map:["..kk........kk..",".kaak......kaak.",".kak..kkkk..kak.","..kkkkaaaakkkk..","....kaeaaeak....","...kaaaaaaaak...","...kbbbbbbbbk...","....kkkkkkkk....","...k.k....k.k...","..k..k....k..k.."]},
 knight:{name:'Павший рыцарь',mv:'walk',pal:{a:'#3a4a8a',b:'#5a74c0',w:'#c8ccd8',d:'#4a4a5a'},map:["......kkkk......",".....kwwwwk.....",".....kwkkwk.....",".....kwwwwk.....","...kkkaaaakkk...","..kwwkaaaakwwk..","..kwwkabbakwwk..","..kk.kaaaak.kk..",".....kaaaak.....",".....kddddk.....",".....kd..dk.....",".....kd..dk.....","....kkk..kkk...."]},
 moth:{name:'Лунная моль',mv:'fly',pal:{a:'#8fa8e0',b:'#e1eaff',d:'#3a4a8a'},map:[".kk..........kk.","kaak..k..k..kaak","kabak..kk..kabak","kaabak.kk.kabaak","kaaabkkddkkbaaak",".kaaaakddkaaaak.","..kaaakddkaaak..","..kaak.kk.kaak..","...kk......kk..."]},
 jelly:{name:'Звёздная медуза',mv:'float',pal:{a:'#5ac8e0',b:'#c8f8ff',e:'#1a2a4a'},map:[".....kkkkkk.....","....kbbaaaak....","...kbaaaaaaak...","...kaaeaaeaak...","...kaaaaaaaak...","...kkkkkkkkkk...","....kak.kak.k...","....k.k.k.k.k...","...k..k.k..k....","....k..k..k.....","...k...k...k...."]},
 cultist:{name:'Культист',mv:'walk',pal:{a:'#3a1a4a',r:'#c0322f',e:'#ffe23a'},map:["......kkkk......",".....kaaaak.....","....kaakkaak....","....kakeekak....","....kaakkaak....","...kaaaaaaaak...","...kaaarraaak...","..kaaaarraaaak..","..kaaaaaaaaaak..","..kaaaaaaaaaak..","..kaaaaaaaaaak..","...kkkkkkkkkk..."]},
 worm:{name:'Трупный червь',mv:'hop',pal:{a:'#c08a8a',e:'#2a0a0a'},map:["...........kk...","..........kaek..","..........kaak..","....kkkk..kak...","...kaaaak.kak...","..kakkkkakaak...","..kak...kaak....","...k.....kk....."]},
 mosquito:{name:'Кровосос',mv:'fly',pal:{a:'#7a2a2a',b:'#e0d0c8',r:'#ff4a4a',e:'#ffe23a'},map:["...kk.....kk....","..kbbk...kbbk...","...kbbk.kbbk....","....kkkkkk......","...kaaeaak.kk...","..kaaaaaaakkrk..","...kaaaaak..kr..","....kkkkk.......","....k.k.k.......","...k..k..k......"]},
 croc:{name:'Топяной крокодил',mv:'walk',pal:{a:'#3a6a3a',b:'#7aa060',w:'#f0e8d0',e:'#ffe23a'},map:["..........kkkk..",".kkkkkkkkkaaeak.","kaaaaaaaaaaaaaak","kbbbbbbbbbkwkwk.","kaaaaaaaaaaaaak.",".kak.kak..kak...",".kk..kk...kk...."]},
});
MON.fireslime={name:'Огненный слизень',mv:'hop',pal:{a:'#d0442a',b:'#ffb04a',e:'#fff3b0'},map:MON.slime.map};
MON.icebat={name:'Ледяной нетопырь',mv:'fly',pal:{a:'#5a9ad0',b:'#c8ecff',e:'#ffffff'},map:MON.bat.map};
MON.hound={name:'Теневая гончая',mv:'walk',pal:{a:'#3a2a4a',b:'#6a4a8a',d:'#1a1024',e:'#ff3a5a'},map:MON.wolf.map};
MON.voidwisp={name:'Огонь бездны',mv:'fly',pal:{a:'#8a3ad0',b:'#e0b0ff',e:'#ffffff'},map:MON.wisp.map};
MON.bogslime={name:'Болотная жижа',mv:'hop',pal:{a:'#5a6a2a',b:'#9aa04a',e:'#ffe23a'},map:MON.slime.map};
const CROWN=["..k..k..k..","..kgkgkgk..",".kgggggggk.",".kkkkkkkkk."];
const sprCache={};
function monFrames(type){ const m=MON[type]; if(m._f) return m._f;
  let f1=m.map.map(r=>r.padEnd(16,'.').slice(0,16));
  while(f1.length<16) f1.unshift('................');
  if(m.mv!=='fly'){ while(!/[^.]/.test(f1[f1.length-1])) { f1.pop(); f1.unshift('................'); } }
  let f2=f1.slice();
  if(m.mv==='walk'){ // shuffle the two lowest drawn rows for a step
    const rows=f1.map((r,i)=>/[^.]/.test(r)?i:-1).filter(i=>i>=0); const a=rows[rows.length-1], b=rows[rows.length-2];
    f2=f1.slice(); f2[a]='.'+f1[a].slice(0,15); if(b!=null) f2[b]=f1[b].slice(1)+'.'; }
  return m._f=[f1,f2];
}
function hexMix(a,b,t){ const p=h=>{ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); };
  const A=p(a),B=p(b); return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join(''); }
function enemySprite(type,frame,white,boss,blink){
  const key=type+frame+(white?'w':'')+(boss?'B':'')+(blink?'z':'');
  if(sprCache[key]) return sprCache[key];
  const m=MON[type], rows=monFrames(type)[frame];
  const c=document.createElement('canvas'); c.width=16; c.height=boss?20:16;
  const x=c.getContext('2d'); const oy=boss?4:0;
  const pal=Object.assign({k:'#0a0406',a:'#888',b:'#bbb',d:'#555',e:'#fff',w:'#eee',r:'#c33',g:'#f3b94a'},m.pal);
  if(boss){ pal.k='#1a0508'; }
  const out=c2=>c2==null||c2==='.'||c2==='k';
  rows.forEach((row,y)=>{ for(let i=0;i<16;i++){ const ch=row[i]; if(ch==='.'||!ch) continue;
    let col=pal[ch]||pal.a;
    if(!white && ch!=='k'){
      if(ch==='e'){ if(blink) col=hexMix(pal.a,'#000000',0.45); }
      else { const up=rows[y-1]&&rows[y-1][i], dn=rows[y+1]&&rows[y+1][i], rt=row[i+1], lf=row[i-1];
        if(out(up)) col=hexMix(col,'#ffffff',0.24);
        else if(out(dn)) col=hexMix(col,'#000000',0.3);
        else if(out(lf)) col=hexMix(col,'#000000',0.14);
        else if(out(rt)) col=hexMix(col,'#ffffff',0.1); }
    }
    x.fillStyle=white?'#ffffff':col; x.fillRect(i,y+oy,1,1);} });
  if(boss){ CROWN.forEach((row,y)=>{ for(let i=0;i<row.length;i++){ const ch=row[i]; if(ch==='.') continue; x.fillStyle=white?'#fff':(ch==='g'?'#f3b94a':'#3a2410'); x.fillRect(i+2,y,1,1);} }); }
  return sprCache[key]=c;
}
const monColCache={};
function monColors(type){ if(monColCache[type]) return monColCache[type];
  const c=enemySprite(type,0,false,false), d=c.getContext('2d').getImageData(0,0,c.width,c.height).data, out=[];
  for(let i=0;i<d.length;i+=4){ if(d[i+3]<200) continue; const v=d[i]+d[i+1]+d[i+2]; if(v<70) continue; out.push('#'+[d[i],d[i+1],d[i+2]].map(n=>n.toString(16).padStart(2,'0')).join('')); }
  return monColCache[type]=out.length?out:['#ffffff']; }
const monIconCache={};
function monIcon(type,boss){ const k=type+(boss?'B':''); if(monIconCache[k]) return monIconCache[k];
  return monIconCache[k]=enemySprite(type,0,false,boss).toDataURL(); }
