/* ---------- drawing ---------- */
function drawTiled(c,off){
  let x=-((off%TW)+TW)%TW;
  for(;x<WW;x+=TW) ctx.drawImage(c,Math.round(x*k)/k,0);
}
function heroFrame(){
  const a=FR[hero.anim]; const n=a.length;
  const i=hero.loop? Math.floor(hero.t*hero.fps)%n : Math.min(n-1,Math.floor(hero.t/hero.dur*n));
  return a[i];
}
const snap=v=>Math.round(v*k)/k;
function drawHero(){
  const [fx,fy,fw,fh,ax,bot]=heroFrame(); const s=hpx(), u=s*(HD.art||1);
  const dx=snap(HX-ax*s), dy=snap(GY-(bot+1)*s+s);
  ctx.fillStyle='rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(HX,GY,9*u,2*u,0,0,7); ctx.fill();
  if(buff.power>0){ const g=ctx.createRadialGradient(HX,GY-14*u,4,HX,GY-14*u,22*u); g.addColorStop(0,'rgba(180,76,255,.35)'); g.addColorStop(1,'rgba(180,76,255,0)'); ctx.fillStyle=g; ctx.fillRect(HX-22*u,GY-36*u,44*u,40*u); }
  if(buff.shield>0){ ctx.save(); ctx.strokeStyle='rgba(196,107,255,.7)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(HX,GY-15*u,15*u,21*u,0,0,7); ctx.stroke(); ctx.fillStyle='rgba(180,92,255,.08)'; ctx.fill(); ctx.restore(); }
  ctx.imageSmoothingEnabled=false;
  ctx.save();
  if(hero.dead && !FR.death) ctx.globalAlpha=Math.max(0,(hero.deadT-2)/1);
  ctx.drawImage(img,fx,fy,fw,fh,dx,dy,fw*s,fh*s);
  if(hero.flash>0 && !hero.dead){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=0.6; ctx.drawImage(img,fx,fy,fw,fh,dx,dy,fw*s,fh*s); }
  ctx.restore();
  if(hero.anim==='beam'){ const n=FR.beam.length, bi=Math.min(n-1,Math.floor(hero.t/hero.dur*n)); const W=[0,0,0,0,0,0,0,0,0,15,4,1,1][bi]||0;
    if(W){ const bx=HX+144*s, cy=GY-26.5*s, th=W*s; ctx.save(); ctx.fillStyle='#afef5a'; ctx.fillRect(bx,cy-th/2,WW-bx+20,th);
      if(W>3){ ctx.fillStyle='#e1ff8d'; ctx.fillRect(bx,cy-1.5*s,WW-bx+20,3*s); }
      ctx.restore(); } }
}
function drawBolt(a){
  if(a.delay>0) return;
  if(a.kind==='pet'){ ctx.save(); ctx.globalCompositeOperation='lighter'; a.trail.forEach((p,i)=>{ ctx.globalAlpha=0.5*(1-i/a.trail.length); ctx.fillStyle=a.col; ctx.fillRect(p.x-1,p.y-1,2.5,2.5); }); ctx.globalAlpha=1; ctx.fillStyle=a.col; ctx.beginPath(); ctx.arc(a.x,a.y,2.6,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.fillRect(a.x-0.8,a.y-0.8,1.6,1.6); ctx.restore(); return; }
  const s=pxs(), q=v=>Math.round(v/s)*s;
  if(a.kind==='arrow'){
    { const g=ctx.createLinearGradient(a.x-26,a.y,a.x,a.y); g.addColorStop(0,'rgba(200,255,216,0)'); g.addColorStop(1,a.big?'rgba(255,240,180,.7)':'rgba(200,255,216,.45)'); ctx.fillStyle=g; ctx.fillRect(a.x-26,a.y-(a.big?1.2:0.6),24,a.big?2.4:1.2); }
    const [fx,fy,fw,fh,ax,bot]=FR.arrow[0]; const z=(a.big?1.5:1)*hpx()/s;
    if(a.big){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=0.5; ctx.fillStyle='#ffd0d6'; ctx.fillRect(q(a.x)-40*s,q(a.y)-s,36*s,2*s); ctx.restore(); }
    ctx.imageSmoothingEnabled=false; ctx.drawImage(img,fx,fy,fw,fh,q(a.x)-ax*s*z,q(a.y)-bot*s*z,fw*s*z,fh*s*z);
    return;
  }
  if(a.kind==='knife' && FR.knife){ const [fx,fy,fw,fh,ax,bot]=FR.knife[0]; const z=hpx()/s; ctx.save(); ctx.globalAlpha=0.35; ctx.fillStyle='#dfe4ee'; ctx.fillRect(a.x-12,a.y-0.5,9,1); ctx.restore(); ctx.imageSmoothingEnabled=false; ctx.drawImage(img,fx,fy,fw,fh,q(a.x)-ax*s*z,q(a.y)-bot*s*z,fw*s*z,fh*s*z); return; }
  if(a.kind==='knife'){
    ctx.save(); ctx.translate(a.x,a.y); ctx.fillStyle='#7af0a8'; ctx.globalAlpha=0.35; ctx.fillRect(-9,-0.5,7,1); ctx.globalAlpha=1;
    ctx.fillStyle='#e8ecf4'; ctx.fillRect(-2,-0.7,5,1.4); ctx.fillStyle='#ffffff'; ctx.fillRect(2.5,-0.4,1,0.8); ctx.fillStyle='#c8a040'; ctx.fillRect(-3,-1.2,1,2.4); ctx.fillStyle='#3a2a4a'; ctx.fillRect(-5,-0.6,2,1.2); ctx.restore(); return; }
  if(a.kind==='bullet'){
    const L=a.big?7:4, T=a.big?2:1;
    ctx.globalAlpha=0.45; ctx.fillStyle='#ff7a2e'; ctx.fillRect(q(a.x)-(L+6)*s,q(a.y)-T*s/2,(L+6)*s,T*s);
    ctx.globalAlpha=1; ctx.fillStyle='#ffe2a8'; ctx.fillRect(q(a.x)-L*s,q(a.y)-T*s/2,L*s,T*s);
    ctx.fillStyle='#ffffff'; ctx.fillRect(q(a.x)-s,q(a.y)-T*s/2,s,T*s);
    return;
  }
  a.trail.forEach((p,i)=>{ ctx.globalAlpha=0.5*(1-i/a.trail.length); ctx.fillStyle=i<2?'#d58cff':'#7a2fd6'; const z=(a.big?3:2)-(i>2?1:0); ctx.fillRect(q(p.x)-z*s/2,q(p.y)-z*s/2,z*s,z*s); });
  ctx.globalAlpha=1;
  const z=a.big?4:3;
  ctx.fillStyle='#8a3dff'; ctx.fillRect(q(a.x)-(z+1)*s/2,q(a.y)-(z-1)*s/2,(z+1)*s,(z-1)*s); ctx.fillRect(q(a.x)-(z-1)*s/2,q(a.y)-(z+1)*s/2,(z-1)*s,(z+1)*s);
  ctx.fillStyle='#f6e6ff'; ctx.fillRect(q(a.x)-(z-2)*s/2,q(a.y)-(z-2)*s/2,Math.max(1,z-2)*s,Math.max(1,z-2)*s);
}
function drawFx(x){
  if(x.t<0) return; const a=(x.kind&&FR[x.kind])||FR.fx; const i=Math.min(a.length-1,Math.floor(x.t/(x.dur||HD.fxDur)*a.length));
  const [fx,fy,fw,fh,ax,bot]=a[i]; const s=x.kind?hpx():pxs()*(x.big?1.3:0.75)*(HD.fxS||1);
  ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.imageSmoothingEnabled=false;
  ctx.drawImage(img,fx,fy,fw,fh,snap(x.x-ax*s),snap(x.y-bot*s),fw*s,fh*s); ctx.restore();
}
function draw(){
  const th=themeOf(S.zone);
  if(!layers||layerTheme!==th){ layers=genLayers(th); layerTheme=th; }
  ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=false;
  const sx=shake?(Math.random()-.5)*shake:0, sy=shake?(Math.random()-.5)*shake:0;
  ctx.setTransform(k,0,0,k,sx*k,sy*k);
  ctx.drawImage(layers.sky,0,0,WW+4,WH);
  drawTiled(layers.stars,scroll*0.03);
  const mx=WW*0.8, my=46;
  const mg=ctx.createRadialGradient(mx,my,4,mx,my,46); mg.addColorStop(0,'rgba(255,220,210,.35)'); mg.addColorStop(1,'rgba(255,220,210,0)');
  ctx.fillStyle=mg; ctx.fillRect(mx-50,my-50,100,100);
  ctx.fillStyle=th.moon; ctx.beginPath(); ctx.arc(mx,my,13,0,7); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(mx-5,my-4,4,3); ctx.fillRect(mx+3,my+3,3,3);
  drawTiled(layers.far,scroll*0.15);
  drawTiled(layers.mid,scroll*0.45);
  drawTiled(layers.gr,scroll);
  for(let i=0;i<4;i++){
    const fx=((i*170-fogT*8-scroll*0.6)%(WW+200)+WW+200)%(WW+200)-100;
    const fg=ctx.createRadialGradient(fx,GY-20,4,fx,GY-20,90);
    fg.addColorStop(0,`rgba(${th.fog},.10)`); fg.addColorStop(1,`rgba(${th.fog},0)`);
    ctx.fillStyle=fg; ctx.fillRect(fx-90,GY-110,180,140);
  }
  for(const r of rains){ const p=r.t/r.dur; const g=ctx.createRadialGradient(r.x,GY,4,r.x,GY,110); g.addColorStop(0,`rgba(180,76,255,${0.25*(1-p)})`); g.addColorStop(1,'rgba(180,76,255,0)'); ctx.fillStyle=g; ctx.fillRect(r.x-110,GY-60,220,80); }
  const list=enemies.slice().sort((a,b)=>b.x-a.x);
  for(const e of list){
    const mv=MON[e.type].mv, s=Math.max(1,Math.round(e.scale*k))/k, w=16*s, h=(e.boss?20:16)*s, y=enemyY(e), t=e.bob, ph=e.ph||0;
    const fr=mv==='walk'?Math.floor(t*1.4)%2:0, moving=(e.mov||runV>0)&&!e.dead;
    let sx=1, sy=1, by=0, rot=0;
    if(mv==='hop'){ const q=Math.sin(t*1.6); sx+=q*0.09; sy-=q*0.09; by=-Math.max(0,Math.sin(t*1.6))*3.5; }
    else if(mv==='fly'){ const q=Math.sin(t*3.2); sy+=q*0.08; sx-=q*0.03; rot=Math.sin(t*0.9+ph)*0.06; }
    else if(mv==='float'){ by=Math.sin(t)*2-3; rot=Math.sin(t*0.7+ph)*0.07; sx+=Math.sin(t*1.4)*0.03; }
    else { const br=Math.sin(t*1.25+ph)*0.04; sy+=br; sx-=br*0.6; if(moving) { by=-Math.abs(Math.sin(t*2.8))*1.3; rot=Math.sin(t*2.8)*0.04; } }
    const sq=e.sq||0; sx+=sq*0.45; sy-=sq*0.45;
    if(e.flash>0) rot+=0.16*(e.flash/0.12);
    const lx=e.lunge?-Math.sin(e.lunge/0.18*Math.PI)*7:0;
    let alpha=1;
    if(e.dead){ const pr=1-Math.max(0,e.dt)/0.6; rot+=pr*1.45; alpha=pr<0.35?1:Math.max(0,1-(pr-0.35)/0.65); by+=pr*3; }
    ctx.save();
    const shw=w*0.38*(1+Math.min(0,by)/18)*(mv==='fly'?0.7:1);
    ctx.globalAlpha=alpha*(mv==='fly'?0.6:1);
    ctx.fillStyle='rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(e.x+lx,GY+1,Math.max(2,shw),2.6+s*0.4,0,0,7); ctx.fill();
    ctx.globalAlpha=alpha;
    if(e.elite&&!e.dead){ const pa=0.28+Math.sin(fogT*4+ph)*0.1, ag=ctx.createRadialGradient(e.x,y-h/2,2,e.x,y-h/2,h*0.8); ag.addColorStop(0,`rgba(243,185,74,${pa.toFixed(2)})`); ag.addColorStop(1,'rgba(243,185,74,0)'); ctx.fillStyle=ag; ctx.fillRect(e.x-h,y-h*1.3,h*2,h*1.5);
      if(Math.random()<0.08) parts.push({x:e.x+rnd(-8,8),y:y-rnd(0,h),vx:0,vy:-18,life:.6,max:.6,col:'#ffe08a',s:1,g:0}); }
    if(e.boss&&!e.dead){ const pa=0.3+Math.sin(fogT*3)*0.12, ag=ctx.createRadialGradient(e.x,y-h/2,4,e.x,y-h/2,h*0.9); ag.addColorStop(0,`rgba(214,40,63,${pa.toFixed(2)})`); ag.addColorStop(1,'rgba(214,40,63,0)'); ctx.fillStyle=ag; ctx.fillRect(e.x-h*1.2,y-h*1.5,h*2.4,h*1.8);
      if(Math.random()<0.25) parts.push({x:e.x+rnd(-14,14),y:y-rnd(0,h),vx:rnd(-5,5),vy:rnd(-30,-12),life:.8,max:.8,col:Math.random()<.5?'#ff5a4a':'#2a0a10',s:1.5,g:0}); }
    ctx.translate(Math.round((e.x+lx)*k)/k,y+by); ctx.rotate(rot); ctx.scale(-1,1); ctx.imageSmoothingEnabled=false;
    const ww=w*sx, hh=h*sy, blink=!e.dead&&e.bl<0;
    ctx.drawImage(enemySprite(e.type,fr,false,e.boss,blink),-ww/2,-hh,ww,hh);
    if(e.flash>0){ ctx.globalAlpha*=0.75; ctx.drawImage(enemySprite(e.type,fr,true,e.boss),-ww/2,-hh,ww,hh); }
    ctx.restore();
    if(!e.dead){
      const bw=e.boss?36:18, bx=e.x-bw/2, byy=enemyTop(e)-5;
      ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(bx-1,byy-1,bw+2,e.boss?5:3.5);
      ctx.fillStyle=e.boss?'#f3b94a':e.elite?'#ff9a3a':'#e4364f'; ctx.fillRect(bx,byy,bw*Math.max(0,e.hp/e.max),e.boss?4:2);
    }
  }
  drawPet();
  if(imgReady) drawHero();
  for(const a of arrows) drawBolt(a);
  for(const x of fxs) drawFx(x);
  for(const r of rings){ if(r.t<0) continue; const q=r.t/r.dur, rr=r.r*(0.25+0.75*Math.sqrt(q)); ctx.save(); ctx.globalAlpha=(1-q)*0.9; ctx.strokeStyle=r.col; ctx.lineWidth=Math.max(0.6,(r.ground?3:2.2)*(1-q));
    ctx.beginPath(); if(r.ground) ctx.ellipse(r.x,r.y,rr,rr*0.22,0,0,7); else ctx.arc(r.x,r.y,rr,0,7); ctx.stroke();
    if(!r.ground && q<0.35){ ctx.globalAlpha=(1-q/0.35)*0.8; ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(r.x,r.y,rr*0.45,0,7); ctx.fill(); } ctx.restore(); }
  for(const p of parts){ ctx.globalAlpha=Math.min(1,p.life/(p.max*0.5)); ctx.fillStyle=p.col;
    if(p.streak) ctx.fillRect(p.x,p.y-14,p.s,14); else if(p.ln){ ctx.strokeStyle=p.col; ctx.lineWidth=p.s; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*0.03,p.y-p.vy*0.03); ctx.stroke(); } else ctx.fillRect(p.x,p.y,p.s,p.s); }
  ctx.globalAlpha=1;
  ctx.textAlign='center';
  for(const t of floats){
    ctx.globalAlpha=Math.min(1,t.life*2.5);
    ctx.font=`700 ${Math.round(t.size*0.85)}px "Philosopher", Georgia, serif`;
    ctx.fillStyle='#000'; ctx.fillText(t.text,t.x+1,t.y+1);
    ctx.fillStyle=t.col; ctx.fillText(t.text,t.x,t.y);
  }
  ctx.globalAlpha=1;
  const vg=ctx.createRadialGradient(WW/2,WH*0.55,WH*0.3,WW/2,WH*0.55,WW*0.8);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.45)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,WW,WH);
}
