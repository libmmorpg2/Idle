/* ---------- ambient life ---------- */
const AMB=[
 {spawn:[['firefly',1.4],['leaf',0.8]],critter:'bat',props:'mush',grass:'#2e2048',grass2:'#4a3270',glow:'#7af0c8'},
 {spawn:[['ember',2.6],['ash',2.2]],critter:'crow',props:'embers',grass:'#2e2828',grass2:'#4a3e3a',glow:'#ff8a3a'},
 {spawn:[['mote',1.8],['star',0.1]],critter:'owl',props:'runes',grass:'#1c2a52',grass2:'#2e4478',glow:'#8fc1ff'},
 {spawn:[['wisp',2.0],['spark',1.4]],critter:'bat',props:'crystals',grass:'#2c1240',grass2:'#4a2068',glow:'#d39bff',lightning:true},
 {spawn:[['rain',16],['bubble',1.4],['bfly',0.6]],critter:'crow',props:'puddles',grass:'#2e0c12',grass2:'#4a1a1e',glow:'#ff5a4a'},
];
let amb=[], critters=[], ambAcc={}, flashT=0, nextBolt=8, nextCrit=3, skyBolt=null;
const glowCache={};
function glowSpr(col){ if(glowCache[col]) return glowCache[col]; const c=document.createElement('canvas'); c.width=c.height=32; const x=c.getContext('2d');
  const g=x.createRadialGradient(16,16,0,16,16,16); g.addColorStop(0,col+'dd'); g.addColorStop(0.3,col+'55'); g.addColorStop(1,col+'00'); x.fillStyle=g; x.fillRect(0,0,32,32); return glowCache[col]=c; }
const ambTheme=()=>AMB[THEMES.indexOf(themeOf(S.zone))]||AMB[0];
function ambNew(kind){
  const X=rnd(-10,WW+40);
  switch(kind){
    case 'firefly': return {k:kind,x:X,y:GY-rnd(6,95),vx:rnd(-6,6),vy:rnd(-4,4),life:rnd(4,8),max:8,d:rnd(.5,1.05),ph:rnd(0,7),col:'#c8ff6a',front:Math.random()<.3};
    case 'bfly': return {k:'firefly',x:X,y:GY-rnd(6,80),vx:rnd(-6,6),vy:rnd(-4,4),life:rnd(4,8),max:8,d:rnd(.5,1.05),ph:rnd(0,7),col:'#ff6a4a',front:Math.random()<.3};
    case 'leaf': return {k:kind,x:rnd(0,WW+60),y:rnd(-10,GY-120),vx:rnd(-18,-8),vy:rnd(10,18),life:12,max:12,d:1,ph:rnd(0,7),col:['#6a3f9a','#8a5ab8','#4a8a5a'][Math.floor(Math.random()*3)],front:Math.random()<.5};
    case 'ember': return {k:kind,x:X,y:GY+rnd(-2,24),vx:rnd(-8,8),vy:rnd(-32,-14),life:rnd(1.8,3.6),max:3.6,d:rnd(.7,1.1),ph:rnd(0,7),col:Math.random()<.5?'#ff8a3a':'#ffcf6a',front:Math.random()<.4};
    case 'ash': return {k:kind,x:rnd(0,WW+40),y:rnd(-10,GY-60),vx:rnd(-6,2),vy:rnd(5,11),life:14,max:14,d:rnd(.4,1),ph:rnd(0,7),col:'#b0a8a0',front:false};
    case 'mote': return {k:kind,x:X,y:GY-rnd(4,130),vx:rnd(-4,4),vy:rnd(-9,-3),life:rnd(4,8),max:8,d:rnd(.4,1),ph:rnd(0,7),col:'#8fc1ff',front:Math.random()<.3};
    case 'star': return {k:kind,x:rnd(WW*0.3,WW+20),y:rnd(8,Math.max(30,GY-150)),vx:-rnd(140,200),vy:rnd(50,80),life:.8,max:.8,d:0,col:'#ffffff'};
    case 'wisp': return {k:kind,x:X,y:GY+rnd(-2,16),vx:rnd(-5,5),vy:rnd(-22,-10),life:rnd(2,4),max:4,d:rnd(.6,1.05),ph:rnd(0,7),col:Math.random()<.6?'#c87aff':'#43d6a8',front:Math.random()<.35};
    case 'spark': return {k:kind,x:X,y:GY-rnd(0,70),vx:0,vy:-4,life:.7,max:.7,d:1,ph:0,col:'#f0d8ff',front:false};
    case 'rain': return {k:kind,x:rnd(0,WW+80),y:rnd(-20,GY-40),vx:-45,vy:rnd(240,300),life:2,max:2,d:1,gy:GY+rnd(0,30),col:'rgba(255,150,150,.32)',front:Math.random()<.5};
    case 'bubble': return {k:kind,x:X,y:GY+rnd(3,32),vx:0,vy:0,life:rnd(.8,1.4),max:1.4,d:1,col:'#c8505a',front:true};
  }
}
function updateAmb(dt){
  const A=ambTheme();
  for(const [kind,rate] of A.spawn){ ambAcc[kind]=(ambAcc[kind]||0)+rate*dt; while(ambAcc[kind]>=1){ ambAcc[kind]--; if(amb.length<140){ const o=ambNew(kind); if(o) amb.push(o); } } }
  for(const p of amb){
    p.life-=dt; p.x-=runV*dt*p.d;
    if(p.k==='firefly'||p.k==='mote'){ p.vx+=Math.sin(fogT*1.3+p.ph)*8*dt; p.vy+=Math.cos(fogT*1.1+p.ph*1.7)*8*dt; p.vx*=0.98; p.vy*=0.98; }
    if(p.k==='leaf'||p.k==='ash') p.vx+=Math.sin(fogT*2+p.ph)*14*dt;
    if(p.k==='ember'||p.k==='wisp') p.vx+=Math.sin(fogT*3+p.ph)*20*dt;
    p.x+=p.vx*dt; p.y+=p.vy*dt;
    if((p.k==='leaf'||p.k==='ash') && p.y>GY+rnd(0,24)){ p.vy=0; p.vx=0; p.life=Math.min(p.life,1.2); p.k+='_g'; }
    if(p.k==='rain' && p.y>p.gy){ p.life=0; if(Math.random()<.5) parts.push({x:p.x,y:p.gy,vx:rnd(-20,20),vy:rnd(-40,-15),life:.2,max:.2,col:'rgba(255,170,170,.5)',s:1,g:300}); }
  }
  amb=amb.filter(p=>p.life>0 && p.x>-40 && p.y<WH+10);
  // critters across the sky
  nextCrit-=dt;
  if(nextCrit<=0){ nextCrit=rnd(5,11); const dir=Math.random()<.65?-1:1, n=A.critter==='crow'?Math.floor(rnd(3,6)):A.critter==='bat'?Math.floor(rnd(1,4)):1, y0=rnd(30,Math.max(50,GY-110));
    for(let i=0;i<n;i++) critters.push({kind:A.critter,x:dir<0?WW+20+i*rnd(8,16):-20-i*rnd(8,16),y:y0+rnd(-10,10)+i*3,vx:dir*rnd(28,45)*(A.critter==='bat'?1.3:1),ph:rnd(0,7),dir}); }
  for(const c of critters){ c.x+=c.vx*dt-runV*dt*0.2; c.y+=Math.sin(fogT*(c.kind==='bat'?6:2)+c.ph)*(c.kind==='bat'?14:4)*dt; }
  critters=critters.filter(c=>c.x>-60&&c.x<WW+60);
  // lightning
  if(A.lightning){ nextBolt-=dt; if(nextBolt<=0){ nextBolt=rnd(7,14); flashT=0.28; const bx=rnd(WW*0.15,WW*0.85); const pts=[[bx,0]]; let yy=0, xx=bx; while(yy<GY-70){ yy+=rnd(8,16); xx+=rnd(-9,9); pts.push([xx,yy]); } skyBolt=pts; } }
  flashT=Math.max(0,flashT-dt);
}
function drawBoltSky(){ if(!skyBolt) return; ctx.save(); ctx.strokeStyle=`rgba(240,220,255,${Math.min(1,flashT*4).toFixed(2)})`; ctx.lineWidth=1.5; ctx.beginPath(); skyBolt.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.stroke(); ctx.restore(); }
function drawAmb(front){
  ctx.save();
  for(const p of amb){
    if(!!p.front!==!!front && p.k!=='star') continue; if(p.k==='star'&&front) continue;
    const fa=Math.min(1,p.life/0.6, (p.max-p.life)/0.4+0.05);
    switch(p.k){
      case 'firefly': case 'mote': { const bl=p.k==='firefly'?(Math.sin(fogT*3+p.ph)+1)/2:0.6+0.4*Math.sin(fogT*2+p.ph); const a=fa*bl;
        ctx.globalAlpha=a*0.9; ctx.drawImage(glowSpr(p.col),p.x-6,p.y-6,12,12); ctx.globalAlpha=a; ctx.fillStyle='#ffffff'; ctx.fillRect(p.x-0.5,p.y-0.5,1,1); break; }
      case 'ember': case 'wisp': { ctx.globalAlpha=fa*0.7; ctx.drawImage(glowSpr(p.col),p.x-4,p.y-4,8,8); ctx.globalAlpha=fa; ctx.fillStyle=p.col; ctx.fillRect(p.x-0.5,p.y-0.5,1,p.k==='wisp'?2:1); break; }
      case 'leaf': case 'leaf_g': { ctx.globalAlpha=fa; ctx.fillStyle=p.col; const fl=Math.sin(fogT*5+p.ph)>0; ctx.fillRect(p.x,p.y,fl?2:1,fl?1:2); break; }
      case 'ash': case 'ash_g': ctx.globalAlpha=fa*0.55; ctx.fillStyle=p.col; ctx.fillRect(p.x,p.y,1,1); break;
      case 'star': { const a=Math.min(1,p.life/0.3); ctx.globalAlpha=a; const g=ctx.createLinearGradient(p.x,p.y,p.x-p.vx*0.12,p.y-p.vy*0.12); g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(1,'rgba(255,255,255,0)'); ctx.strokeStyle=g; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*0.12,p.y-p.vy*0.12); ctx.stroke(); break; }
      case 'spark': { const a=Math.sin(p.life/p.max*Math.PI); ctx.globalAlpha=a; ctx.fillStyle=p.col; ctx.fillRect(p.x-1.5,p.y,3,0.8); ctx.fillRect(p.x-0.4,p.y-1.1,0.8,3); break; }
      case 'rain': ctx.globalAlpha=1; ctx.fillStyle=p.col; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(0.16); ctx.fillRect(0,-5,0.8,6); ctx.restore(); break;
      case 'bubble': { const pr=1-p.life/p.max, r=0.8+pr*2.2; ctx.globalAlpha=0.7*(1-pr*0.6); ctx.strokeStyle=p.col; ctx.lineWidth=0.7; ctx.beginPath(); ctx.arc(p.x,p.y-r,r,0,7); ctx.stroke(); ctx.fillStyle='rgba(255,200,200,.6)'; ctx.fillRect(p.x-r*0.4,p.y-r*1.5,0.8,0.8); break; }
    }
  }
  ctx.restore();
}
function drawCritters(){
  if(!critters.length) return; const th=themeOf(S.zone); ctx.save(); ctx.fillStyle=hexMix(th.far,'#000000',0.35);
  for(const c of critters){ const f=Math.floor(fogT*(c.kind==='bat'?14:c.kind==='owl'?5:8)+c.ph)%2, x=Math.round(c.x), y=Math.round(c.y);
    ctx.fillRect(x-1,y,3,1.5);
    if(c.kind==='owl'){ ctx.fillRect(x-1,y-1,2,1); }
    if(f){ ctx.fillRect(x-3,y-2,2,1); ctx.fillRect(x-4,y-3,1,1); ctx.fillRect(x+2,y-2,2,1); ctx.fillRect(x+4,y-3,1,1); }
    else { ctx.fillRect(x-3,y+1,2,1); ctx.fillRect(x-4,y+1,1,1); ctx.fillRect(x+2,y+1,2,1); ctx.fillRect(x+4,y+1,1,1); }
    if(c.kind==='bat'){ ctx.fillRect(x-0.5,y-1,0.6,1); ctx.fillRect(x+0.9,y-1,0.6,1); } }
  ctx.restore();
}
function drawProps(){
  if(!layers||!layers.props) return; const A=ambTheme(), off=((scroll%TW)+TW)%TW;
  ctx.save(); ctx.imageSmoothingEnabled=false;
  for(const p of layers.props){
    for(const base of [0,TW,-TW]){
      const x=Math.round(p.x-off+base); if(x<-20||x>WW+20) continue; const y=Math.round(p.y), s=p.s, pulse=0.55+0.45*Math.sin(fogT*2+p.ph);
      switch(p.k){
        case 'mush': { ctx.globalAlpha=0.5*pulse; ctx.drawImage(glowSpr(A.glow),x-8*s,y-5-8*s,16*s,16*s); ctx.globalAlpha=1;
          ctx.fillStyle='#cfc4d8'; ctx.fillRect(x,y-3*s,1,3*s); ctx.fillStyle=A.glow; ctx.fillRect(x-1.5*s,y-4*s,3*s+1,1.5*s); ctx.fillStyle='#ffffff'; ctx.fillRect(x-0.5*s,y-4*s,1,0.8);
          ctx.fillStyle='#cfc4d8'; ctx.fillRect(x+3*s,y-2*s,1,2*s); ctx.fillStyle=A.glow; ctx.fillRect(x+2*s,y-3*s,2*s+1,1.2*s); break; }
        case 'embers': { ctx.globalAlpha=0.55*pulse; ctx.drawImage(glowSpr(A.glow),x-7*s,y-6*s,14*s,10*s); ctx.globalAlpha=1;
          ctx.fillStyle='#3a2a22'; ctx.fillRect(x-3*s,y-1,6*s,1.5); ctx.fillStyle=pulse>0.6?'#ffcf6a':'#ff6a2a'; ctx.fillRect(x-1*s,y-1.2,1.2,1); ctx.fillRect(x+1.5*s,y-1,1,1);
          if(Math.random()<0.02) amb.push({k:'ember',x,y:y-2,vx:rnd(-4,4),vy:rnd(-25,-12),life:rnd(1,2),max:2,d:1,ph:rnd(0,7),col:'#ffb04a',front:false}); break; }
        case 'runes': { ctx.fillStyle='#232b48'; ctx.fillRect(x-2*s,y-7*s,4*s,7*s); ctx.fillStyle='#34406a'; ctx.fillRect(x-2*s,y-7*s,4*s,1); ctx.fillRect(x-1*s,y-8*s,2*s,1);
          ctx.globalAlpha=0.6*pulse; ctx.drawImage(glowSpr(A.glow),x-6*s,y-10*s,12*s,12*s); ctx.globalAlpha=0.5+0.5*pulse; ctx.fillStyle=A.glow; ctx.fillRect(x-0.5,y-5.5*s,1,3*s); ctx.fillRect(x-1.2*s,y-4.5*s,2.4*s,0.8); break; }
        case 'crystals': { ctx.globalAlpha=0.55*pulse; ctx.drawImage(glowSpr(A.glow),x-9*s,y-14*s,18*s,18*s); ctx.globalAlpha=1;
          const sh=(cx,h,w,c)=>{ for(let yy=0;yy<h;yy++){ const ww=Math.max(1,w*(yy/h)); ctx.fillStyle=c; ctx.fillRect(cx-ww/2,y-h+yy,ww,1);} };
          sh(x,9*s,3*s,'#6a2aa8'); sh(x+2.5*s,6*s,2.5*s,'#4a1a80'); sh(x-2.2*s,5*s,2*s,'#8a46c8'); ctx.fillStyle='#f0d8ff'; ctx.globalAlpha=pulse; ctx.fillRect(x-0.3,y-8*s,0.8,2*s);
          if(Math.random()<0.015) amb.push({k:'spark',x:x+rnd(-3,3),y:y-rnd(2,9),vx:0,vy:-4,life:.7,max:.7,d:1,ph:0,col:'#f0d8ff',front:false}); break; }
        case 'puddles': { ctx.fillStyle='#2a060c'; ctx.beginPath(); ctx.ellipse(x,y+1,9*s,1.6*s,0,0,7); ctx.fill();
          ctx.fillStyle='rgba(255,120,120,.35)'; const sh=Math.sin(fogT*1.5+p.ph)*4*s; ctx.fillRect(x-3*s+sh,y+0.5,4*s,0.6);
          ctx.strokeStyle=`rgba(255,140,140,${(0.35*(1-((fogT*0.8+p.ph)%1))).toFixed(2)})`; const rr=((fogT*0.8+p.ph)%1)*7*s; ctx.lineWidth=0.5; ctx.beginPath(); ctx.ellipse(x+2*s,y+1,rr,rr*0.2,0,0,7); ctx.stroke();
          ctx.fillStyle='#3a1418'; const sw=Math.sin(fogT*1.6+p.ph)*0.8; ctx.fillRect(x-7*s+sw,y-7*s,0.8,7*s); ctx.fillRect(x-5.5*s-sw,y-5*s,0.8,5*s); ctx.fillStyle='#5a2020'; ctx.fillRect(x-7.3*s+sw,y-8.5*s,1.4,2*s); break; }
      }
    }
  }
  ctx.restore();
}
function drawGrass(){
  if(!layers||!layers.grass) return; const A=ambTheme(), off=((scroll%TW)+TW)%TW;
  ctx.save();
  for(const g of layers.grass){
    for(const base of [0,TW]){
      const x=g.x-off+base; if(x<-4||x>WW+4) continue;
      const sw=Math.sin(fogT*2.2+g.ph+x*0.03)*0.9;
      ctx.fillStyle=g.c?A.grass2:A.grass;
      ctx.fillRect(Math.round(x),GY+2-g.h*0.5,1,g.h*0.5+1); ctx.fillRect(Math.round(x+sw*0.6),GY+2-g.h,1,g.h*0.5);
      if(g.h>4.5){ ctx.fillRect(Math.round(x+1+sw),GY+2-g.h*0.8,1,g.h*0.4); }
    }
  }
  ctx.restore();
}
