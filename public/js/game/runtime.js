/* ---------- runtime ---------- */
const pxs=()=>Math.max(1,Math.round(k))/k;
const hpx=()=>Math.max(1,Math.round(k*(HD.sc||1)))/k;   // hero art pixel, per-hero size   // one art pixel in world units, snapped to whole device pixels
let fxs=[], rings=[], hitStop=0;
const hero={state:'run',anim:'run',t:0,dur:1,loop:true,fps:12,hp:100,cd:0,hitAt:0,hitDone:false,cast:-1,flash:0,deadT:0,dead:false};
let bossReq=false;
let enemies=[], parts=[], floats=[], arrows=[], rains=[], scroll=0, shake=0, bossT=0, skCd=[0,0,0,0,0], bannerT=0, runV=0, fogT=0;
const range=()=>HD.melee?36:Math.min(WW-HX-30,175);

function setAnim(name,{loop=false,dur=0.6,fps=10}={}){ hero.anim=name; hero.t=0; hero.loop=loop; hero.dur=dur; hero.fps=fps; }
function setState(s){
  hero.state=s;
  if(s==='run') setAnim('run',{loop:true,fps:HD.run});
  else if(s==='idle') setAnim('idle',{loop:true,fps:HD.idle});
  else if(s==='dead'){ if(FR.death) setAnim('death',{dur:1.1}); else setAnim('idle',{loop:true,fps:HD.idle}); for(let i=0;i<40;i++) parts.push({x:HX+rnd(-16,16),y:GY-rnd(0,32),vx:rnd(-20,20),vy:rnd(-70,-10),life:rnd(.6,1.2),max:1.2,col:i%3?HD.death[0]:HD.death[1],s:3,g:0}); }
}
const busy=()=>hero.state==='atk'||hero.state==='skill'||hero.state==='hurt';
function banner(text,sub,t=1.8){ const b=$('banner'); b.innerHTML=text+(sub?`<small>${sub}</small>`:''); b.classList.add('show'); bannerT=t; }

function spawnPack(){
  const z=S.zone, startX=Math.max(WW,HX+range())+30;
  const L=locOf(z);
  if(bossReq){ bossReq=false;
    const type=L.boss;
    enemies.push({type,x:startX+20,hp:eHp(z)*9,max:eHp(z)*9,dmg:eDmg(z)*2.4,gold:eGold(z)*12,xp:eXp(z)*8,boss:true,scale:2.6,atkT:1,flash:0,bob:Math.random()*6,dead:false,dt:0,spd:18,ph:Math.random()*6,bl:rnd(1,4),sq:0});
    bossT=30; SND.play('boss'); return;
  }
  let n=1+(Math.random()<0.4?1:0)+(z>2&&Math.random()<0.25?1:0);
  for(let i=0;i<n;i++){
    const type=L.mobs[Math.floor(Math.random()*L.mobs.length)], mv=MON[type].mv, hp=eHp(z)*rnd(.9,1.1);
    const elite=Math.random()<0.1; enemies.push({type,elite,x:startX+i*40,hp:hp*(elite?3:1),max:hp*(elite?3:1),dmg:eDmg(z)*(elite?1.5:1),gold:eGold(z)*(elite?4:1),xp:eXp(z)*(elite?3:1),boss:false,scale:(mv==='fly'?1.3:1.5)*(elite?1.3:1),atkT:rnd(.6,1.2),flash:0,bob:Math.random()*6,dead:false,dt:0,spd:mv==='fly'?34:mv==='hop'?22:26,ph:Math.random()*6,bl:rnd(1,4),sq:0});
  }
}
function front(){ let f=null; for(const e of enemies){ if(!e.dead && (!f||e.x<f.x)) f=e; } return f; }
function alive(){ return enemies.filter(e=>!e.dead && e.x<WW+10); }
function enemyY(e){ return MON[e.type].mv==='fly'? GY-30-Math.sin(e.bob*2)*2 : GY; }
function enemyTop(e){ return enemyY(e)-(e.boss?20:16)*e.scale-(MON[e.type].mv==='float'?3:0); }
