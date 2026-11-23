/* ---------- HUD nav (pixel art) ---------- */
const NAV_ART={
 battle:{map:["nN................Nn",
".nN..............Nn.",
"..nN............Nn..",
"...nN..........Nn...",
"....nN........Nn....",
".....nN......Nn.....",
"......nN....Nn......",
".......nN..Nn.......",
"........nNNn........",
".........hh.........",
"........NnnN........",
"....t..Nn..nN..t....",
".....tNn....nNt.....",
"......t......t......",
".....w.t....t.w.....",
"....w...t..t...w....",
"...w............w...",
"..g..............g..",
".g................g.",
"...................."],pal:{n:'#e6eaf2',N:'#8a90a0',h:'#ffffff',t:'#e8b84a',w:'#7a3e1e',g:'#ff4a5a'},glow:'#ff6a5a'},
 hero:{map:["..........rr........",".........rrR........","........rrR.........","......kkkkkk........",".....knnnnnnk.......","....knnhnnnnnk......","....knnnnnnnnk......","...knnnnnnnnnnk.....","...knnhnnnnnnnk.....","...kttttttttttk.....","...knkkkkkkkknk.....","...knkgkkkkgknk.....","...knnkkkkkknnk.....","...knnnnkknnnnk.....","...kNNNNkkNNNNk.....","....kNNNNNNNNk......",".....kttttttk.......","......kkkkkk........","....................","...................."],
   pal:{k:'#120a18',n:'#c8ccd8',N:'#7a8090',h:'#ffffff',t:'#e0b040',r:'#d0323a',R:'#7a1a20',g:'#ffd24a'},glow:'#ffd24a'},
 skill:{map:["....................","....................","...kkkk......kkkk...","..kppppkk..kkppppk..",".kpppppppkkpppppppk.",".kpPPPppppkppppPPpk.",".kppppppppkpppppppk.",".kpPPPPpppkpp5gpppk.",".kppppppppkpgGgpppk.",".kpPPPpppkppp5ppppk.",".kppppppppkpppppppk.",".kpPPPppppkpppPPppk.",".kpppppkkkkkkpppppk.",".kkkkkk.kmmk.kkkkkk.","kmmmmmmmmMMmmmmmmmmk",".kMMMMMMMMMMMMMMMMk.","..kkkkkkkkkkkkkkkk..","....................","....................","...................."],
   pal:{k:'#120a18',p:'#ecdcb0',P:'#b89a68',m:'#6a2f8a',M:'#3f1a5a',g:'#c46bff',G:'#ffffff','5':'#e8b0ff'},glow:'#c46bff'},
 bag:{map:["....................",".......kkkkkk.......","......kmk..kmk......","......kk....kk......","...kkkkkkkkkkkkkk...","..kmmmhhmmmmmmmmmk..","..kmhmmmmmmmmmmmmk..","..kttttttttttttttk..","..kmmmmmmktkmmmmmk..","..kmmmmmktgtkmmmmk..","..kmmmmmmktkmmmmmk..","..kmmhmmmmmmmmmmmk..","..kmmmmmmmmmmmmmmk..","..kMmmmmmmmmmmmmMk..","..kMMMMMMMMMMMMMMk..","...kkkkkkkkkkkkkk...","....................","....................","....................","...................."],
   pal:{k:'#120a18',m:'#9a6234',M:'#5e3a1c',h:'#c88a4e',t:'#e0b040',g:'#5aa8ff'},glow:'#ffb04a'},
 map:{map:["....................", "....................", "..kkkkkkkkkkkkkkkk..", "..kppppkPPPPkppppk..", "..kbbppkPPgPkpprrk..", "..kbbbpkPgggkprpPk..", "..kpbbpkPPgPkrpppk..", "..kppprkrPPPkpppPk..", "..kpprpkPrPPkppppk..", "..kprppkPPrPkppppk..", "..kppppkPPPrkrpppk..", "..kpPppkPPPPkprpPk..", "..kppppkPPPPkpXpXk..", "..kppppkPPPPkppXpk..", "..kppppkPPPPkpXpXk..", "..kkkkkkkkkkkkkkkk..", "....................", "....................", "....................", "...................."],pal:{k:'#120a18',p:'#ecdcb0',P:'#c8b088',b:'#4a8ad8',g:'#4aa860',r:'#d0323a',X:'#d0323a'},glow:'#e0b040'},
 profile:{map:["....................", "..kkkkkkkkkkkkkkkk..", "..kFfffffffffffffk..", "..kfbbbbbbbbbbbbfk..", "..kfbbbboooobbbbfk..", "..kfbbbossssobbbfk..", "..kfbbbossssobbbfk..", "..kfbbossssssobbfk..", "..kfbbossssssobbfk..", "..kfbbbossssobbbfk..", "..kfbbbboooobbbbfk..", "..kfbbbbboobbbbbfk..", "..kfbbbooccoobbbfk..", "..kfbboccccccobbfk..", "..kfboccccccccobfk..", "..kfoccccccccccofk..", "..kfoccccccccccofk..", "..kffffffffffffffk..", "..kkkkkkkkkkkkkkkk..", "...................."],pal:{k:'#120a18',f:'#c9a25a',F:'#fff0c0',b:'#2a1d3a',s:'#f0c9a0',c:'#6a3fb0',o:'#0d0812'},glow:'#c9a25a'},
 shop:{map:["....................", "....................", "........kkkk........", ".......kMttMk.......", "........kttk........", ".......kmmmmk.......", "......kmhmmmMk......", ".....kmhmmmmmMk.....", "....kmhmmggmmmMk....", "...kmhmmgGggmmmMk...", "...kmhmmgggGmmmMk...", "...kmmmmmggmmmmMk...", "...kmmmmmmmmmmMMk...", "....kmmmmmmmmMMk....", ".....kkkkkkkkkk.....", "....................", "....................", "....................", "....................", "...................."],pal:{k:'#120a18',m:'#7a3fb0',M:'#45206a',h:'#b07ae0',t:'#e0b040',g:'#f3c94a',G:'#fff2b0'},glow:'#f3b94a'},
 reborn:{map:["....................",".........kk.........","........kGgk........",".......kGggGk.......","......kGgggggk......",".....kGgggggggk.....","....kGggggggggdk....","...kGgggggggggddk...","...kgggggGgggdddk...","...kggggggggddddk...","....kgggggggdddk....",".....kggggggddk.....","......kgggggdk......",".......kgggdk.......","........kgdk........",".........kk.........","....................","....................","....................","...................."],
   pal:{k:'#120a18',g:'#9a5cff',G:'#efe0ff',d:'#4a2290'},glow:'#b45cff'},
};
function navArt(id){
  const A=NAV_ART[id], Z=4, N=20; const c=document.createElement('canvas'); c.width=N*Z; c.height=N*Z; const x=c.getContext('2d');
  A.map.forEach((row,j)=>{ for(let i=0;i<N;i++){ const ch=row[i]; if(!ch||ch==='.') continue; x.fillStyle=A.pal[ch]||'#120a18'; x.fillRect(i*Z,j*Z,Z,Z);} });
  return c.toDataURL();
}
function pixTexture(){ // stone plate
  const c=document.createElement('canvas'); c.width=32; c.height=32; const x=c.getContext('2d'); const r=seeded(42);
  const pal=['#19131f','#1c1623','#16111b','#201928','#1a1420'];
  for(let j=0;j<32;j++) for(let i=0;i<32;i++){ x.fillStyle=pal[Math.floor(r()*pal.length)]; x.fillRect(i,j,1,1); }
  x.fillStyle='#120d16'; for(let i=0;i<32;i++){ if(r()<.5) x.fillRect(i,15,1,1); } for(let j=0;j<16;j++) x.fillRect(11,j,1,1); for(let j=16;j<32;j++) x.fillRect(26,j,1,1);
  x.fillStyle='#2a2232'; for(let i=0;i<32;i++){ if(r()<.4) x.fillRect(i,16,1,1); }
  return c.toDataURL();
}
function trimStrip(){ // gold rail with diamond studs
  const c=document.createElement('canvas'); c.width=12; c.height=7; const x=c.getContext('2d');
  x.fillStyle='#000'; x.fillRect(0,0,12,1); x.fillRect(0,6,12,1);
  x.fillStyle='#7a5c34'; x.fillRect(0,1,12,5); x.fillStyle='#c9a25a'; x.fillRect(0,2,12,1); x.fillStyle='#e8c878'; x.fillRect(0,2,12,1);
  x.fillStyle='#5a4226'; x.fillRect(0,5,12,1);
  x.fillStyle='#120a18'; x.fillRect(5,1,2,5); x.fillRect(4,2,4,3);
  x.fillStyle='#b45cff'; x.fillRect(5,2,2,3); x.fillStyle='#e8d0ff'; x.fillRect(5,2,1,1);
  return c.toDataURL();
}
(function(){
  document.querySelectorAll('img[data-na]').forEach(im=>im.src=navArt(im.dataset.na));
  const nav=document.querySelector('.nav'); nav.style.setProperty('--stone',`url(${pixTexture()})`); nav.style.setProperty('--trim',`url(${trimStrip()})`);
})();
