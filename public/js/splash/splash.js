/* ---------- заставка «Герои»: крупные планы героев, бьющих монстров ----------
   Нужны ATLAS, FRS (data/) и enemySprite/MON/monColors (world/bestiary.js). */
const SPLASH=(()=>{
  const root=document.getElementById('loader'); if(!root) return null;

  const cv=document.createElement('canvas'); cv.className='ld-cv'; root.prepend(cv);
  const c=cv.getContext('2d');
  const atlas=new Image(); let atlasOk=false; atlas.onload=()=>{ atlasOk=true; }; atlas.src=ATLAS;
  let W=1,H=1,DPR=1,P=3,TOP=120,BOT=600;
  const topEl=root.querySelector('.ld-top'), botEl=root.querySelector('.ld-bottom');
  function ui(){ const r0=root.getBoundingClientRect(); if(topEl) TOP=topEl.getBoundingClientRect().bottom-r0.top; if(botEl) BOT=botEl.getBoundingClientRect().top-r0.top; }
  function resize(){
    DPR=Math.min(2,window.devicePixelRatio||1); W=root.clientWidth||innerWidth; H=root.clientHeight||innerHeight;
    cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
    P=Math.max(2,Math.min(5,Math.floor(Math.min(W/118,H/165))));
  }

  /* ---------- общие данные и помощники ---------- */
  const R=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
  const easeOut=t=>1-Math.pow(1-t,3), easeBack=t=>{ const s=1.7; t-=1; return t*t*((s+1)*t+s)+1; };
  const IDS=['mage','tank','asn','sam'];
  const SC={mage:1,tank:.7,asn:.7,sam:.7};
  const HC={mage:['#b45cff','#e8c0ff','#2a0f4a'],tank:['#5ab4ff','#d0eeff','#0c2440'],asn:['#ff3a5a','#ffc0cc','#3a0c18'],sam:['#5fe08a','#d8ffe4','#0c3220']};
  const NAME={mage:'Маг бездны',tank:'Викинг',asn:'Хранительница клинков',sam:'Лесной следопыт'};
  const ROLE={mage:'Маг',tank:'Танк',asn:'Убийца',sam:'Стрелок'};
  const MUZ={mage:[14,22],tank:[18,24],asn:[20,28],sam:[25,33]};
  const ATK={mage:{a:'atk',dur:.95,hit:.38,proj:'bolt',cd:1.0},tank:{a:'atk',dur:.6,hit:.3,melee:true,cd:.7},
             asn:{a:'atk',dur:.55,hit:.25,proj:'knife',cd:.55},sam:{a:'atk',dur:1.0,hit:.56,proj:'arrow',cd:.95}};
  const SPEC={mage:{a:'pow',dur:1.1,hit:.45},tank:{a:'heavy',dur:.8,hit:.45},asn:{a:'combo',dur:1.1,hit:.6},sam:{a:'sp',dur:.8,hit:.5}};
  const IDLEF={mage:9,tank:8,asn:9,sam:10};
  const MOBS=Object.keys(MON).filter(t=>!MON[t].big);
  const FLY=t=>MON[t]&&MON[t].mv==='fly';

  function frameOf(id,anim,t,fps,once){
    const F=(FRS[id]&&FRS[id][anim])||FRS[id].idle, n=F.length;
    return F[once?Math.min(n-1,Math.floor(t*fps)):Math.floor(t*fps)%n];
  }
  function drawF(f,x,y,s,flip,alpha,glow){
    if(!atlasOk||!f) return; const [fx,fy,fw,fh,ax,bot]=f;
    c.save(); c.translate(Math.round(x),Math.round(y)); if(flip) c.scale(-1,1); c.globalAlpha=alpha==null?1:alpha;
    c.drawImage(atlas,fx,fy,fw,fh,Math.round(-ax*s),Math.round(-bot*s),Math.round(fw*s),Math.round(fh*s));
    if(glow){ c.globalCompositeOperation='lighter'; c.globalAlpha=glow; c.drawImage(atlas,fx,fy,fw,fh,Math.round(-ax*s),Math.round(-bot*s),Math.round(fw*s),Math.round(fh*s)); }
    c.restore();
  }
  function drawMob(e,x,y,s){   // спрайты монстров смотрят вправо — разворачиваем к героям
    const spr=enemySprite(e.type,Math.floor(e.t*7),e.flash>0,e.boss,false,'run'), k=(MON[e.type]||{}).k||1;
    c.save(); c.translate(Math.round(x),Math.round(y)); if(!e.faceR) c.scale(-1,1); c.globalAlpha=e.alpha==null?1:e.alpha;
    c.drawImage(spr,Math.round(-spr.width*k*s/2),Math.round(-spr.height*k*s),Math.round(spr.width*k*s),Math.round(spr.height*k*s)); c.restore();
  }
  function shadow(x,y,w){ c.fillStyle='rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(x,y,w,w*.22,0,0,7); c.fill(); }
  const fmtD=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(Math.round(n));
  function text(str,x,y,size,col,{align='center',stroke=true,alpha=1,italic=false}={}){
    c.save(); c.globalAlpha=alpha; c.font=`${italic?'italic ':''}700 ${Math.round(size)}px Philosopher, Georgia, serif`; c.textAlign=align; c.textBaseline='middle';
    if(stroke){ c.lineJoin='round'; c.lineWidth=Math.max(3,size/6); c.strokeStyle='rgba(0,0,0,.85)'; c.strokeText(str,x,y); }
    c.fillStyle=col; c.fillText(str,x,y); c.restore();
  }

  /* ---------- эффекты ---------- */
  let parts=[], floats=[], rings=[], fxs=[], projs=[], shake=0, flash=0, flashCol='255,255,255';
  function burst(x,y,cols,n,pow,size){
    for(let i=0;i<n;i++){ const a=R(0,Math.PI*2), v=R(.3,1)*pow;
      parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-pow*.35,life:R(.45,.9),max:.9,col:pick(cols),s:size*R(.6,1.3),g:pow*1.6}); }
  }
  function dust(x,y,n,col){ for(let i=0;i<n;i++) parts.push({x:x+R(-12,12)*P,y,vx:R(-60,60)*P/3,vy:R(-50,-10)*P/3,life:R(.3,.6),max:.6,col:col||'#6a5a7a',s:P*R(.8,1.6),g:80}); }
  function ring(x,y,r,col,dur=.45,w=3){ rings.push({x,y,r,col,t:0,dur,w}); }
  function floatTxt(x,y,txt,col,size){ floats.push({x,y,txt,col,size,t:0}); }
  function hit(){ root.classList.remove('hit'); void root.offsetWidth; root.classList.add('hit'); }
  function updFx(dt){
    for(const p of parts){ p.life-=dt; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; } parts=parts.filter(p=>p.life>0);
    for(const f of floats) f.t+=dt; floats=floats.filter(f=>f.t<.9);
    for(const r of rings) r.t+=dt; rings=rings.filter(r=>r.t<r.dur);
    for(const f of fxs) f.t+=dt; fxs=fxs.filter(f=>f.t<f.dur);
    shake=Math.max(0,shake-dt*30); flash=Math.max(0,flash-dt*2.2);
  }
  function drawFx(){
    for(const f of fxs){ const F=FRS[f.id].fx; if(!F) continue; drawF(F[Math.min(F.length-1,Math.floor(f.t/f.dur*F.length))],f.x,f.y,f.s,f.flip); }
    c.save(); c.globalCompositeOperation='lighter';
    for(const r of rings){ const q=r.t/r.dur; c.globalAlpha=(1-q)*.9; c.strokeStyle=r.col; c.lineWidth=r.w*(1-q)+1; c.beginPath(); c.ellipse(r.x,r.y,r.r*(.2+.8*easeOut(q)),r.r*(.2+.8*easeOut(q))*.35,0,0,7); c.stroke(); }
    for(const p of parts){ c.globalAlpha=Math.min(1,p.life/p.max*1.6); c.fillStyle=p.col; c.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s); }
    c.restore();
    for(const f of floats){ const q=f.t/.9; text(f.txt,f.x,f.y-q*30*P/3,f.size*(q<.15?1+(.15-q)*4:1),f.col,{alpha:q>.6?(1-q)/.4:1}); }
  }

  /* ---------- снаряды ---------- */
  function shoot(kind,x,y,target,onHit,speed){ projs.push({kind,x,y,tx:target.x,ty:target.y,target,onHit,sp:speed||560*P/3,trail:[]}); }
  function updProj(dt,tpos){
    for(const p of projs){
      if(p.target&&!p.target.dead){ const q=tpos(p.target); p.tx=q.x; p.ty=q.y; }
      const dx=p.tx-p.x, dy=p.ty-p.y, d=Math.hypot(dx,dy), st=p.sp*dt;
      p.a=Math.atan2(dy,dx); p.trail.unshift([p.x,p.y]); if(p.trail.length>7) p.trail.pop();
      if(d<=st+2){ p.done=true; p.onHit(p); } else { p.x+=dx/d*st; p.y+=dy/d*st; }
    }
    projs=projs.filter(p=>!p.done);
  }
  function drawProj(){
    for(const p of projs){
      if(p.kind==='bolt'){
        c.save(); c.globalCompositeOperation='lighter';
        p.trail.forEach(([x,y],i)=>{ c.globalAlpha=.5*(1-i/7); c.fillStyle='#a65cff'; c.beginPath(); c.arc(x,y,(5-i*.5)*P/3+1,0,7); c.fill(); });
        const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,9*P/3); g.addColorStop(0,'#fff'); g.addColorStop(.35,'#e3b8ff'); g.addColorStop(1,'rgba(140,60,255,0)');
        c.globalAlpha=1; c.fillStyle=g; c.beginPath(); c.arc(p.x,p.y,9*P/3,0,7); c.fill(); c.restore();
      } else {
        const id=p.kind==='arrow'?'sam':'asn', F=FRS[id][p.kind]; if(!F||!atlasOk) continue; const [fx,fy,fw,fh,ax,bot]=F[0], s=P*.7;
        c.save(); c.globalAlpha=.4; c.strokeStyle=p.kind==='arrow'?'#c8f07a':'#dfe4ee'; c.lineWidth=1.5; c.beginPath();
        p.trail.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.stroke(); c.restore();
        c.save(); c.translate(p.x,p.y); c.rotate(p.a); c.drawImage(atlas,fx,fy,fw,fh,-ax*s,-bot*s,fw*s,fh*s); c.restore();
      }
    }
  }

  function sky(top,mid,bot){ const g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,top); g.addColorStop(.55,mid); g.addColorStop(1,bot); c.fillStyle=g; c.fillRect(0,0,W,H); }
  /* ---------- сцена: крупные планы героев с переходами-разрезами ---------- */
  const S2={i:-1,t:0,DUR:2.9,mob:null,atk:-1,done:false,spec:false,specDone:false,cd:.2,rays:0,lines:[],ghost:[]};
  function s2Next(){ S2.i=(S2.i+1)%4; S2.t=0; S2.atk=-1; S2.cd=.45; S2.spec=false; S2.specDone=false; S2.ghost=[]; s2Mob(true); }
  const RAWH={mage:31,tank:46,asn:42,sam:44}, RAWW={mage:16,tank:34,asn:45,sam:49};
  function s2Mob(now){ const sc=Math.max(3,Math.round(Math.min(H*.11,W*.2)/16)); S2.mob={type:pick(MOBS.filter(m=>!FLY(m))),hp:4,flash:0,t:0,s:sc,drop:now?0:-H*.5,vy:0,kx:0,faceR:false}; }
  function s2Scale(id){ const gy=Math.min(H*.7,BOT-16); return Math.max(3,Math.floor(Math.min((gy-TOP-70)*.62/RAWH[id],W*.6/RAWW[id]))); }
  function s2Geo(){ const id=IDS[Math.max(0,S2.i)], s=s2Scale(id), gy=Math.min(H*.7,BOT-16); return {s,gy,hx:W*(id==='mage'?.34:.28),mx:W*.8,ty:TOP+Math.max(34,(gy-TOP)*.12)}; }
  function s2Hit(big){
    const m=S2.mob, g=s2Geo(), id=IDS[S2.i]; if(!m) return;
    m.hp-=big?3:1; m.flash=.1; m.kx=(big?900:420)*g.s/8;
    const y=g.gy-8*m.s, d=R(2e3,9e3)*(big?4:1);
    fxs.push({id,x:g.mx,y:y+8*m.s*(id==='mage'?1.4:.8),s:m.s*(id==='mage'?1.1:.9),t:0,dur:.4});
    floatTxt(g.mx+R(-10,10)*g.s/3,y-14*m.s,(big?'КРИТ ':'')+fmtD(d),big?'#ffd27a':'#fff',big?18+g.s*2:12+g.s*1.2);
    burst(g.mx,y,['#fff',HC[id][1],HC[id][0]],big?40:12,(big?420:240)*g.s/6,g.s*.6);
    shake=Math.max(shake,big?14:5); if(big){ flash=.45; flashCol='255,255,255'; ring(g.mx,g.gy,48*g.s/3,HC[id][1],.6,6); hit(); }
    if(m.hp<=0){ burst(g.mx,y,monColors(m.type),50,380*g.s/6,g.s*.8); ring(g.mx,g.gy,40*g.s/3,'#c46bff',.5,5); S2.mob=null; setTimeout(()=>{ if(S2.mob===null) s2Mob(false); },250); }
  }
  function s2Update(dt){
    if(S2.i<0) s2Next();
    S2.t+=dt; if(S2.t>=S2.DUR) s2Next();
    S2.rays+=dt*.25;
    if(S2.lines.length<26) S2.lines.push({y:R(0,H),x:W+R(0,W),l:R(.1,.4)*W,v:R(1.4,2.6)*W,w:R(1,3)});
    for(const l of S2.lines) l.x-=l.v*dt; S2.lines=S2.lines.filter(l=>l.x+l.l>0);
    const id=IDS[S2.i], g=s2Geo(), m=S2.mob;
    if(m){ m.t+=dt; m.flash-=dt; m.kx=Math.max(0,m.kx-dt*2400*g.s/8); if(m.drop<0){ m.vy+=2600*dt; m.drop=Math.min(0,m.drop+m.vy*dt); if(m.drop===0){ dust(g.mx,g.gy,12); ring(g.mx,g.gy,30*g.s/3,'#a98fd0',.4,3); } } }
    const A=S2.spec?SPEC[id]:ATK[id];
    if(S2.atk>=0){ S2.atk+=dt;
      if(!S2.done&&S2.atk>=A.dur*A.hit){ S2.done=true;
        if(m&&m.drop===0){ const big=S2.spec; if(ATK[id].melee||S2.spec&&id!=='sam'&&id!=='mage') s2Hit(big);
          else { const s=g.s, mz=MUZ[id]; shoot(ATK[id].proj,g.hx+mz[0]*s,g.gy-mz[1]*s,{x:g.mx,y:g.gy-8*m.s},()=>s2Hit(big),1500*g.s/8); } } }
      if(S2.atk>=A.dur){ S2.atk=-1; if(S2.spec) S2.specDone=true; S2.spec=false; S2.cd=.12; }
    } else { S2.cd-=dt; if(S2.cd<=0&&S2.t>.35&&S2.t<S2.DUR-.4){ S2.spec=!S2.specDone&&S2.t>1.1; S2.atk=0; S2.done=false; } }
    if(S2.t<.4&&Math.random()<.6) S2.ghost.push({x:S2.ghostX||0,a:.5});
    for(const gh of S2.ghost) gh.a-=dt*2.5; S2.ghost=S2.ghost.filter(gh=>gh.a>0);
    updProj(dt,()=>({x:g.mx,y:g.gy-8*(S2.mob?S2.mob.s:g.s)}));
  }
  function s2Draw(t){
    const id=IDS[S2.i], col=HC[id], g=s2Geo();
    sky('#06040c',col[2],'#05030a');
    // лучи из-за героя
    c.save(); c.translate(g.hx,g.gy-RAWH[id]*g.s*.5); c.rotate(S2.rays); c.globalCompositeOperation='lighter';
    for(let i=0;i<14;i++){ c.rotate(Math.PI*2/14); c.fillStyle=i%2?col[0]+'14':col[1]+'0c'; c.beginPath(); c.moveTo(0,0); c.lineTo(W*1.5,-W*.12); c.lineTo(W*1.5,W*.12); c.fill(); }
    c.restore();
    const halo=c.createRadialGradient(g.hx,g.gy-RAWH[id]*g.s*.5,0,g.hx,g.gy-RAWH[id]*g.s*.5,Math.max(W,H)*.55); halo.addColorStop(0,col[0]+'55'); halo.addColorStop(1,col[0]+'00'); c.fillStyle=halo; c.fillRect(0,0,W,H);
    // линии скорости
    c.save(); c.globalCompositeOperation='lighter'; for(const l of S2.lines){ c.globalAlpha=.25; c.fillStyle=col[1]; c.fillRect(l.x,l.y,l.l,l.w); } c.restore();
    // земля
    c.fillStyle='#07040c'; c.fillRect(0,g.gy,W,H-g.gy); c.fillStyle=col[0]+'66'; c.fillRect(0,g.gy,W,2);
    const gl=c.createLinearGradient(0,g.gy,0,g.gy+40); gl.addColorStop(0,col[0]+'40'); gl.addColorStop(1,col[0]+'00'); c.fillStyle=gl; c.fillRect(0,g.gy,W,40);
    // монстр
    const m=S2.mob; if(m){ shadow(g.mx,g.gy,7*m.s); drawMob(m,g.mx+m.kx*.05,g.gy+m.drop,m.s); }
    // герой: въезжает слева со шлейфом
    const inq=clamp(S2.t/.35,0,1), ox=(1-easeBack(inq))*-W*.6; S2.ghostX=ox;
    const s=g.s, A=S2.spec?SPEC[id]:ATK[id];
    const f=S2.atk>=0?frameOf(id,A.a,S2.atk,FRS[id][A.a].length/A.dur,true):frameOf(id,'idle',S2.t,IDLEF[id]);
    shadow(g.hx+ox,g.gy,RAWW[id]*s*.4);
    for(const gh of S2.ghost){ c.save(); c.globalCompositeOperation='lighter'; drawF(f,g.hx+gh.x-20,g.gy,s,false,gh.a*.6); c.restore(); }
    drawF(f,g.hx+ox,g.gy,s,false,1,S2.spec?.35+.25*Math.sin(t*30):0);
    drawProj(); drawFx();
    // имя героя
    const nq=clamp((S2.t-.15)/.35,0,1), nx=lerp(W*1.1,W*.5,easeOut(nq)), out=S2.t>S2.DUR-.35?(S2.t-(S2.DUR-.35))/.35:0;
    const ns=Math.min(30,W/13)+6;
    c.save(); c.translate(nx-out*W,g.ty); c.transform(1,0,-.18,1,0,0);
    c.fillStyle='rgba(0,0,0,.55)'; c.fillRect(-W*.46,-ns*.85,W*.92,ns*1.7); c.fillStyle=col[0]; c.fillRect(-W*.46,-ns*.85,6,ns*1.7);
    c.restore();
    text(NAME[id],nx-out*W,g.ty-ns*.18,ns,'#fff',{italic:true});
    text(ROLE[id].toUpperCase(),nx-out*W,g.ty+ns*.48,ns*.42,col[1],{stroke:false});
    // разрез-переход
    const tq=S2.t>S2.DUR-.22?(S2.t-(S2.DUR-.22))/.22:S2.t<.2?1+S2.t/.2:-1;
    if(tq>=0){ const k=tq<=1?tq:2-tq, x=lerp(-W*.4,W*1.4,tq/2);
      c.save(); c.globalAlpha=Math.min(1,k*1.6); c.fillStyle='#fff'; c.beginPath(); c.moveTo(x-W*.35,H); c.lineTo(x+W*.15,0); c.lineTo(x+W*.25,0); c.lineTo(x-W*.25,H); c.fill();
      c.fillStyle=col[0]; c.beginPath(); c.moveTo(x-W*.25,H); c.lineTo(x+W*.25,0); c.lineTo(x+W*.75,0); c.lineTo(x+W*.25,H); c.fill(); c.restore(); }
  }

  /* ---------- цикл ---------- */
  let raf=0, last=performance.now(), T=0, running=true;
  function frame(now){
    if(!running) return; raf=requestAnimationFrame(frame);
    const dt=Math.min(.05,(now-last)/1000); last=now; T+=dt;
    ui();
    try{ s2Update(dt); updFx(dt);
      c.setTransform(DPR,0,0,DPR,0,0); c.imageSmoothingEnabled=false;
      if(shake>0) c.translate(R(-1,1)*shake*.5,R(-1,1)*shake*.5);
      s2Draw(T);
      if(flash>0){ c.setTransform(DPR,0,0,DPR,0,0); c.fillStyle=`rgba(${flashCol},${Math.min(.85,flash)})`; c.fillRect(0,0,W,H); }
      const v=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,.55)');
      c.setTransform(DPR,0,0,DPR,0,0); c.fillStyle=v; c.fillRect(0,0,W,H);
    }catch(e){ console.error(e); running=false; }
  }
  resize(); addEventListener('resize',resize);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ /* один статичный кадр */ setTimeout(()=>{ frame(performance.now()); running=false; },400); }
  else raf=requestAnimationFrame(frame);

  return {stop(){ running=false; cancelAnimationFrame(raf); removeEventListener('resize',resize); }};
})();
