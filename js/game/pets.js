const PETS=[
 {id:'hound',name:'Боевой пёс',rar:0,buff:{gold:5},col:'#ffb070',price:2000},
 {id:'boar',name:'Бронекабан',rar:0,buff:{hp:6},col:'#d8a080',price:2500},
 {id:'bat',name:'Ночная мышь',rar:0,fly:1,buff:{xp:5},col:'#c87aa8',price:3000},
 {id:'fairy',name:'Лесная фея',rar:1,fly:1,buff:{xp:12,regen:0.3},col:'#a8f08a',price:12000},
 {id:'wolf',name:'Волк в латах',rar:1,buff:{crit:3},col:'#c8d0e0',price:14000},
 {id:'imp',name:'Бесёнок',rar:1,fly:1,buff:{dmg:5},col:'#ff7a4a',price:15000},
 {id:'direwolf',name:'Лютоволк',rar:2,buff:{dmg:8,hp:8},col:'#5ff0ff',price:60000},
 {id:'griffin',name:'Грифон',rar:2,buff:{aps:8,gold:10},col:'#ffd070',price:70000},
 {id:'wisp',name:'Огненный дух',rar:2,fly:1,buff:{aps:10},col:'#ffb04a',price:80000},
 {id:'dragon',name:'Кристальный дракон',rar:3,fly:1,buff:{dmg:12,crit:3},col:'#7ad8ff',price:300000},
 {id:'icefairy',name:'Ледяная фея',rar:3,fly:1,buff:{hp:15,regen:0.5},col:'#bff0ff',price:320000},
 {id:'jaguar',name:'Теневой ягуар',rar:3,buff:{aps:12,crit:3},col:'#c87aff',price:350000},
 {id:'succubus',name:'Суккуба',rar:4,fly:1,buff:{dmg:18,aps:8},col:'#ff5aa8',price:1200000},
 {id:'ghostwolf',name:'Призрачный волк',rar:4,map:'direwolf',buff:{dmg:15,crit:5},col:'#8fe8ff',price:1300000},
 {id:'unicorn',name:'Боевой единорог',rar:4,buff:{hp:20,regen:1},col:'#e0b0ff',price:1400000},
 {id:'phoenix',name:'Феникс',rar:5,fly:1,buff:{dmg:25,regen:1.5},col:'#ff7a2a',price:5000000},
 {id:'ancient',name:'Древний дракон',rar:5,fly:1,buff:{dmg:30,crit:5,gold:20},col:'#ff4a2a',price:6000000},
];
const PB_TXT={dmg:['Урон','%'],hp:['Здоровье','%'],aps:['Скорость атаки','%'],crit:['Шанс крита','%'],gold:['Золото','%'],xp:['Опыт','%'],regen:['Регенерация','%/с'],luck:['Удача (трофеи)','%']};
const petDef=()=>S.pets&&S.pets.act?PETS.find(p=>p.id===S.pets.act):null;
const petB=k=>{ const P=petDef(), C=capeDef(); return (P&&P.buff[k]||0)+(C&&C.buff[k]||0); };
const petFlies=P=>!!P.fly;
let pet={x:-40,y:0,t:0,sp:0};
function petDps(){ return 0; }
const petSprCache={};
function petSprite(P,fr){
  const key=P.id+fr; if(petSprCache[key]) return petSprCache[key];
  const rows=PET_MAPS[P.map||P.id][fr].split('|'), pal=PET_PAL[P.id];
  const c=document.createElement('canvas'); c.width=26; c.height=24; const x=c.getContext('2d');
  rows.forEach((row,j)=>{ for(let i=0;i<row.length;i++){ const ch=row[i]; if(ch==='.') continue; x.fillStyle=pal[ch]||'#f0f'; x.fillRect(i,j,1,1); } });
  return petSprCache[key]=c;
}
function petHome(P){ const t=fogT; return petFlies(P)?{x:HX-24+Math.sin(t*1.3)*4,y:GY-32+Math.sin(t*3)*3}:{x:HX-30,y:GY}; }
function updatePet(dt){
  const P=petDef(); if(!P) return; const H=petHome(P);
  if(pet.x<-30){ pet.x=H.x-30; pet.y=H.y; }
  const f=Math.min(1,dt*6); pet.x+=(H.x-pet.x)*f; pet.y+=(H.y-pet.y)*f;
  pet.t-=dt;
  if(pet.t<=0){ pet.t=rnd(0.5,1.1)/(1+P.rar*0.15);
    parts.push({x:pet.x+rnd(-6,6),y:pet.y-rnd(4,16),vx:rnd(-6,6),vy:rnd(-30,-14),life:rnd(.6,1),max:1,col:Math.random()<.5?P.col:'#ffffff',s:1.2,g:0});
    if(!hero.dead && Math.random()<0.35) parts.push({x:HX+rnd(-10,10),y:GY-rnd(4,30),vx:0,vy:rnd(-24,-10),life:.7,max:.7,col:P.col,s:1,g:0});
  }
}
function drawPet(){
  const P=petDef(); if(!P) return;
  const fl=petFlies(P), s=Math.max(1,Math.round(0.85*k))/k, w=26*s, h=24*s;
  const moving=runV>0&&!hero.dead;
  const fr=fl?(Math.floor(fogT*(moving?9:6))%2):(moving?Math.floor(fogT*10)%2:0);
  const bob=fl?0:(moving?-Math.abs(Math.sin(fogT*10*Math.PI/2))*1.5:Math.sin(fogT*2.5)*0.5);
  ctx.fillStyle='rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(pet.x,GY+1,w*(fl?0.18:0.32),fl?1.5:2.5,0,0,7); ctx.fill();
  if(P.rar>=2){ const cy=pet.y-h*0.45, g=ctx.createRadialGradient(pet.x,cy,1,pet.x,cy,h*(0.6+P.rar*0.08));
    const a=['','','33','44','55','66'][P.rar]; g.addColorStop(0,P.col+a); g.addColorStop(1,P.col+'00'); ctx.fillStyle=g; ctx.fillRect(pet.x-h*1.2,cy-h*1.2,h*2.4,h*2.4); }
  ctx.imageSmoothingEnabled=false;
  const yy=fl?pet.y-h*0.55:pet.y-h+bob;
  ctx.drawImage(petSprite(P,fr),Math.round((pet.x-w/2)*k)/k,Math.round(yy*k)/k,w,h);
}
const petIcCache={}; const petIcon=P=>petIcCache[P.id]||(petIcCache[P.id]=petSprite(P,0).toDataURL());
const petBuffList=P=>Object.entries(P.buff).map(([k,v])=>`<li><span>${PB_TXT[k][0]}</span><b>+${v}${PB_TXT[k][1]}</b></li>`).join('');
