/* ---------- заставка: анимированные сцены с героями и монстрами ----------
   Варианты: ?splash=1 «Натиск», 2 «Герои», 3 «Портал».
   ?splash=N&demo=1 — заставка не закрывается и показывает переключатель вариантов.
   Нужны ATLAS, FRS (data/) и enemySprite/MON/monColors (world/bestiary.js). */
const SPLASH=(()=>{
  const root=document.getElementById('loader'); if(!root) return null;
  const qs=new URLSearchParams(location.search);
  const V=Math.min(3,Math.max(1,parseInt(qs.get('splash'),10)||1));
  const DEMO=qs.has('demo');
  root.classList.add('v'+V);

  const cv=document.createElement('canvas'); cv.className='ld-cv'; root.prepend(cv);
  const c=cv.getContext('2d');
  const atlas=new Image(); let atlasOk=false; atlas.onload=()=>{ atlasOk=true; }; atlas.src=ATLAS;
  let W=1,H=1,DPR=1,P=3,BASEP=3,TOP=120,BOT=600;
  const topEl=root.querySelector('.ld-top'), botEl=root.querySelector('.ld-bottom');
  function ui(){ const r0=root.getBoundingClientRect(); if(topEl) TOP=topEl.getBoundingClientRect().bottom-r0.top; if(botEl) BOT=botEl.getBoundingClientRect().top-r0.top;
    if(V===1) P=Math.max(BASEP,Math.min(6,Math.floor(Math.min((Math.min(H*.72,BOT)-TOP)/110,W/92)))); }
  function resize(){
    DPR=Math.min(2,window.devicePixelRatio||1); W=root.clientWidth||innerWidth; H=root.clientHeight||innerHeight;
    cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
    P=BASEP=Math.max(2,Math.min(5,Math.floor(Math.min(W/118,H/165))));
    bg=null;
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
  const RUNF={mage:11,tank:12,asn:14,sam:14}, IDLEF={mage:9,tank:8,asn:9,sam:10};
  const MOBS=['slime','mushroom','bat','skeleton','wolf','wisp','ghost','eye','imp','spider','wraith','goblin','toad','beetle','snake','zombie','salamander','crab','moth','jelly','cultist','mosquito','croc','leech'];
  const BOSSES=['knight','golem','treant','croc'];
  const FLY=t=>MON[t]&&MON[t].mv==='fly', FLOAT=t=>MON[t]&&MON[t].mv==='float';

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
    const fr=Math.floor(e.t*(FLY(e.type)?8:5))%2, spr=enemySprite(e.type,fr,e.flash>0,e.boss);
    c.save(); c.translate(Math.round(x),Math.round(y)); if(!e.faceR) c.scale(-1,1); c.globalAlpha=e.alpha==null?1:e.alpha;
    c.drawImage(spr,Math.round(-8*s),Math.round(-spr.height*s),Math.round(16*s),Math.round(spr.height*s)); c.restore();
  }
  function shadow(x,y,w){ c.fillStyle='rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(x,y,w,w*.22,0,0,7); c.fill(); }
  const fmtD=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(Math.round(n));
  function text(str,x,y,size,col,{align='center',stroke=true,alpha=1,italic=false}={}){
    c.save(); c.globalAlpha=alpha; c.font=`${italic?'italic ':''}700 ${Math.round(size)}px Philosopher, Georgia, serif`; c.textAlign=align; c.textBaseline='middle';
    if(stroke){ c.lineJoin='round'; c.lineWidth=Math.max(3,size/6); c.strokeStyle='rgba(0,0,0,.85)'; c.strokeText(str,x,y); }
    c.fillStyle=col; c.fillText(str,x,y); c.restore();
  }

  /* ---------- эффекты ---------- */
  let parts=[], floats=[], rings=[], fxs=[], projs=[], bolts=[], shake=0, flash=0, flashCol='255,255,255';
  function burst(x,y,cols,n,pow,size){
    for(let i=0;i<n;i++){ const a=R(0,Math.PI*2), v=R(.3,1)*pow;
      parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-pow*.35,life:R(.45,.9),max:.9,col:pick(cols),s:size*R(.6,1.3),g:pow*1.6}); }
  }
  function dust(x,y,n,col){ for(let i=0;i<n;i++) parts.push({x:x+R(-12,12)*P,y,vx:R(-60,60)*P/3,vy:R(-50,-10)*P/3,life:R(.3,.6),max:.6,col:col||'#6a5a7a',s:P*R(.8,1.6),g:80}); }
  function ring(x,y,r,col,dur=.45,w=3){ rings.push({x,y,r,col,t:0,dur,w}); }
  function floatTxt(x,y,txt,col,size){ floats.push({x,y,txt,col,size,t:0}); }
  function hit(){ root.classList.remove('hit'); void root.offsetWidth; root.classList.add('hit'); }
  function jag(x0,y0,x1,y1,spread,depth,out){
    if(depth===0){ out.push([x1,y1]); return; }
    const mx=(x0+x1)/2+R(-spread,spread), my=(y0+y1)/2+R(-spread,spread)*.3;
    jag(x0,y0,mx,my,spread/2,depth-1,out); jag(mx,my,x1,y1,spread/2,depth-1,out);
  }
  function lightning(x0,y0,x1,y1,col){ const pts=[[x0,y0]]; jag(x0,y0,x1,y1,Math.hypot(x1-x0,y1-y0)*.35,5,pts); bolts.push({pts,t:0,dur:.28,col}); }

  function updFx(dt){
    for(const p of parts){ p.life-=dt; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; } parts=parts.filter(p=>p.life>0);
    for(const f of floats) f.t+=dt; floats=floats.filter(f=>f.t<.9);
    for(const r of rings) r.t+=dt; rings=rings.filter(r=>r.t<r.dur);
    for(const f of fxs) f.t+=dt; fxs=fxs.filter(f=>f.t<f.dur);
    for(const b of bolts) b.t+=dt; bolts=bolts.filter(b=>b.t<b.dur);
    shake=Math.max(0,shake-dt*30); flash=Math.max(0,flash-dt*2.2);
  }
  function drawFx(){
    for(const f of fxs){ const F=FRS[f.id].fx; if(!F) continue; drawF(F[Math.min(F.length-1,Math.floor(f.t/f.dur*F.length))],f.x,f.y,f.s,f.flip); }
    c.save(); c.globalCompositeOperation='lighter';
    for(const r of rings){ const q=r.t/r.dur; c.globalAlpha=(1-q)*.9; c.strokeStyle=r.col; c.lineWidth=r.w*(1-q)+1; c.beginPath(); c.ellipse(r.x,r.y,r.r*(.2+.8*easeOut(q)),r.r*(.2+.8*easeOut(q))*.35,0,0,7); c.stroke(); }
    for(const p of parts){ c.globalAlpha=Math.min(1,p.life/p.max*1.6); c.fillStyle=p.col; c.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s); }
    for(const b of bolts){ const a=1-b.t/b.dur; c.globalAlpha=a; c.lineJoin='round';
      for(const [w,col] of [[10,`rgba(${b.col},.25)`],[4,`rgba(${b.col},.8)`],[1.5,'#fff']]){ c.lineWidth=w; c.strokeStyle=col; c.beginPath(); b.pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.stroke(); } }
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

  /* ---------- фон: небо, звёзды, луна, горы ---------- */
  let bg=null;
  function ridge(seed,amp,base,step){
    const fs=[1,2,3,5,8].map(k=>({k,ph:((seed*k*9301+49297)%233280)/233280*Math.PI*2,a:1/k}));
    return x=>{ let v=0; for(const f of fs) v+=Math.sin(x/800*Math.PI*2*f.k+f.ph)*f.a; return base-Math.round(v*amp/step)*step; };
  }
  function makeBg(){
    const stars=[]; for(let i=0;i<Math.round(W*H/2600);i++) stars.push({x:R(0,W),y:R(0,H*.7),s:R(.6,1.8),ph:R(0,7),sp:R(1,3)});
    bg={stars,mt:[ridge(3,H*.07,0,P),ridge(7,H*.06,0,P),ridge(11,H*.05,0,P)]};
  }
  function sky(top,mid,bot){ const g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,top); g.addColorStop(.55,mid); g.addColorStop(1,bot); c.fillStyle=g; c.fillRect(0,0,W,H); }
  function stars(t){ for(const s of bg.stars){ c.globalAlpha=.35+.65*Math.abs(Math.sin(t*s.sp+s.ph)); c.fillStyle='#fff'; c.fillRect(s.x,s.y,s.s,s.s); } c.globalAlpha=1; }
  function moon(x,y,r){
    const g=c.createRadialGradient(x,y,r*.6,x,y,r*3.2); g.addColorStop(0,'rgba(220,200,255,.28)'); g.addColorStop(1,'rgba(160,80,255,0)'); c.fillStyle=g; c.fillRect(x-r*3.2,y-r*3.2,r*6.4,r*6.4);
    const m=c.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r); m.addColorStop(0,'#fff8ea'); m.addColorStop(.6,'#e6dccb'); m.addColorStop(1,'#b6a7c8');
    c.fillStyle=m; c.beginPath(); c.arc(x,y,r,0,7); c.fill();
    c.fillStyle='rgba(120,100,140,.35)'; [[.25,.2,.18],[-.3,.35,.12],[.1,-.35,.1]].forEach(([dx,dy,rr])=>{ c.beginPath(); c.arc(x+dx*r,y+dy*r,rr*r,0,7); c.fill(); });
  }
  function mountains(off,gy,cols){
    bg.mt.forEach((f,i)=>{ const o=off*[.08,.2,.4][i], base=gy-[H*.2,H*.12,H*.05][i];
      c.fillStyle=cols[i]; c.beginPath(); c.moveTo(0,H);
      for(let x=0;x<=W+P*2;x+=P*2) c.lineTo(x,base+f(x+o)); c.lineTo(W,H); c.fill(); });
  }
  function ground(off,gy){
    c.fillStyle='#120b1c'; c.fillRect(0,gy,W,H-gy);
    c.fillStyle='#2a1c3c'; c.fillRect(0,gy,W,P);
    c.fillStyle='#3d2a55'; const tile=P*14;
    for(let x=-((off%tile)+tile)%tile-tile;x<W+tile;x+=tile){ c.fillRect(x,gy-P,P,P); c.fillRect(x+P*5,gy-P*2,P,P*2); c.fillRect(x+P*9,gy-P,P*2,P); c.fillRect(x+P*3,gy+P*4,P*2,P); c.fillRect(x+P*10,gy+P*9,P,P); }
    const g=c.createLinearGradient(0,gy,0,H); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.65)'); c.fillStyle=g; c.fillRect(0,gy,W,H-gy);
  }

  /* =====================================================================
     1. НАТИСК — герои несутся сквозь орду
     ===================================================================== */
  const S1={off:0,heroes:null,mobs:[],spawn:0,kills:0,combo:0,comboT:0,bossIn:10,banner:0};
  function s1Init(){
    S1.heroes=[{id:'sam',dx:6,row:1},{id:'mage',dx:22,row:1},{id:'asn',dx:36,row:0},{id:'tank',dx:52,row:0}]
      .map(h=>({...h,t:R(0,1),atk:-1,cd:R(0,.6),done:false}));
    s1Place();
  }
  function s1Place(){
    const xL=Math.max(10,W*.05), gy=Math.min(H*.72,BOT-14), dy=gy-(S1.gy||gy); S1.gy=gy;
    const k=W<520?.9:1; for(const h of S1.heroes){ h.x=xL+h.dx*P*k; h.y=gy-h.row*5*P; }
    for(const e of S1.mobs) e.y+=dy;
    S1.front=S1.heroes[3].x+16*P;
  }
  const s1Pos=e=>({x:e.x,y:e.y-(e.boss?10:7)*e.s});
  function s1Spawn(boss){
    const type=boss?pick(BOSSES):pick(MOBS), s=boss?P*2.3:P*R(1.05,1.3), fly=!boss&&FLY(type);
    S1.mobs.push({type,boss,s,x:W+20*s,y:fly?S1.gy-R(22,34)*P:S1.gy,fly,hp:boss?14:Math.ceil(R(1,3.5)),pend:0,t:R(0,1),flash:0,kx:0,sp:boss?28:R(40,80)*(fly?1.2:1),bob:R(0,7)});
    if(boss){ S1.banner=1.6; flash=.25; flashCol='255,60,90'; shake=8; }
  }
  function s1Kill(e){
    e.dead=true; S1.kills++; S1.combo++; S1.comboT=2.2;
    const p=s1Pos(e); burst(p.x,p.y,monColors(e.type),e.boss?70:22,e.boss?320*P/3:200*P/3,P*(e.boss?1.5:1));
    ring(p.x,e.fly?p.y:S1.gy,(e.boss?60:26)*P/3*3,e.boss?'#ffd27a':'#c46bff',e.boss?.7:.4,e.boss?6:3);
    if(e.boss){ shake=16; flash=.7; flashCol='255,240,210'; hit(); floatTxt(p.x,p.y-30*P,'БОСС ПОВЕРЖЕН!','#ffd27a',13*P/3+10); }
  }
  function s1Damage(e,id,big){
    if(e.dead) return; e.pend=Math.max(0,e.pend-1);
    const crit=Math.random()<.22||big, d=R(900,4200)*(crit?3.2:1)*(e.boss?1.5:1);
    e.hp--; e.flash=.1; e.kx=(e.boss?60:160)*P/3;
    const p=s1Pos(e); fxs.push({id,x:p.x,y:p.y+(id==='mage'?14:8)*P*SC[id],s:P*SC[id]*(id==='mage'?1.2:1),t:0,dur:.4});
    floatTxt(p.x+R(-6,6)*P,p.y-12*P,crit?fmtD(d)+'!':fmtD(d),crit?'#ffd27a':'#ffffff',crit?13*P/3+8:9*P/3+6);
    burst(p.x,p.y,['#fff',HC[id][1]],6,120*P/3,P*.8);
    if(e.boss) shake=Math.max(shake,4);
    if(e.hp<=0) s1Kill(e);
  }
  function s1Update(dt){
    if(!S1.heroes) s1Init(); else s1Place();
    const sp=70*P/3; S1.off+=sp*dt;
    S1.spawn-=dt; if(S1.spawn<=0){ S1.bossIn--; s1Spawn(S1.bossIn<=0); if(S1.bossIn<=0) S1.bossIn=16; S1.spawn=R(.25,.7); }
    for(const e of S1.mobs){ e.t+=dt; e.flash-=dt; e.bob+=dt*3;
      e.kx=Math.max(0,e.kx-dt*600*P/3);
      const stopX=S1.front+8*e.s; e.x+=e.kx*dt;
      if(e.x>stopX) e.x-= (sp*.4+e.sp*P/3)*dt; else e.x=stopX;
      if(e.fly) e.y+=Math.sin(e.bob)*.4*P; }
    S1.mobs=S1.mobs.filter(e=>!e.dead&&e.x<W+60*e.s);
    S1.comboT-=dt; if(S1.comboT<=0) S1.combo=0;
    S1.banner=Math.max(0,S1.banner-dt);
    for(const h of S1.heroes){
      h.t+=dt; h.cd-=dt; const A=ATK[h.id];
      if(h.atk>=0){ h.atk+=dt;
        if(!h.done&&h.atk>=A.dur*A.hit){ h.done=true; const e=h.target;
          if(e&&!e.dead){ if(A.melee){ s1Damage(e,h.id); shake=Math.max(shake,3); }
            else{ const s=P*SC[h.id], m=MUZ[h.id]; shoot(A.proj,h.x+m[0]*s,h.y-m[1]*s,e,()=>s1Damage(e,h.id)); } } }
        if(h.atk>=A.dur) h.atk=-1;
      } else if(h.cd<=0){
        const cand=S1.mobs.filter(e=>!e.dead&&e.x<W-6*P&&e.pend<e.hp&&(!A.melee||e.x<S1.front+16*e.s));
        if(cand.length){ const e=A.melee?cand.reduce((a,b)=>a.x<b.x?a:b):pick(cand.slice(0,4)); h.target=e; e.pend++; h.atk=0; h.done=false; h.cd=A.cd*R(.8,1.2); }
      }
    }
    updProj(dt,s1Pos);
  }
  function s1Draw(t){
    const gy=S1.gy;
    sky('#05030b','#1a0f2e','#3a1f4f'); stars(t); moon(W*.8,H*.17,Math.min(W,H)*.075);
    mountains(S1.off,gy,['#22143a','#170d29','#0f0819']); ground(S1.off,gy);
    for(const e of S1.mobs) if(!e.fly) shadow(e.x,gy,7*e.s);
    for(const h of S1.heroes) shadow(h.x,h.y,9*P*SC[h.id]*1.45);
    for(const h of S1.heroes){ const A=ATK[h.id];
      const f=h.atk>=0?frameOf(h.id,A.a,h.atk,FRS[h.id][A.a].length/A.dur,true):frameOf(h.id,'run',h.t,RUNF[h.id]);
      drawF(f,h.x,h.y,P*SC[h.id],false,h.row?.92:1); }
    for(const e of S1.mobs) drawMob(e,e.x,e.y,e.s);
    drawProj(); drawFx();
    const cy=Math.max(TOP+40,S1.gy-80*P);
    if(S1.combo>=3){ const k=Math.min(1,S1.comboT*4); text('×'+S1.combo,W-14,cy,(16+Math.min(14,S1.combo/4))*P/3+6,'#ffd27a',{align:'right',alpha:k});
      text('КОМБО',W-14,cy+20*P/3+4,7*P/3+5,'#e8c0ff',{align:'right',alpha:k}); }
    if(S1.banner>0){ const q=1-S1.banner/1.6, a=q<.1?q*10:Math.min(1,S1.banner*2);
      c.fillStyle=`rgba(80,0,20,${.45*a})`; c.fillRect(0,cy-22*P/3,W,44*P/3);
      text('⚔ БОСС ⚔',W/2+(1-easeOut(Math.min(1,q*6)))*W,cy,22*P/3+8,'#ff6a7a',{alpha:a}); }
  }

  /* =====================================================================
     2. ГЕРОИ — крупные планы с переходами-разрезами
     ===================================================================== */
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

  /* =====================================================================
     3. ПОРТАЛ — герои выходят из бездны, монстры лезут следом
     ===================================================================== */
  const S3={t:0,swirl:[],heroes:[],mobs:[],spawn:0,nextBolt:1,surge:0};
  const S3_CYCLE=13;
  function s3Geo(){ const gy=Math.min(H*.78,BOT-12), sp=gy-TOP, r=Math.min(W*.3,sp*.27); return {px:W/2,py:TOP+sp*.38,r,gy,s:Math.max(P,Math.round(Math.min(sp/120,W/80)))}; }
  function s3Reset(){
    S3.t=0; S3.mobs=[]; const xs=[.14,.38,.62,.86];
    S3.heroes=IDS.map((id,i)=>({id,x:W*xs[i],flip:i>=2,arrive:.5+i*.85,landed:false,atk:-1,cd:R(.2,.8),t:0,done:false}));
    if(!S3.swirl.length) for(let i=0;i<170;i++) S3.swirl.push({a:R(0,7),r:R(.15,1.15),c:Math.random()});
  }
  const s3Pos=e=>({x:e.x,y:e.y-8*e.s});
  function s3Kill(e){ e.dead=true; const p=s3Pos(e); burst(p.x,p.y,monColors(e.type),26,230*P/3,P); ring(p.x,p.y,30*P,'#c46bff',.4,3); }
  function s3Update(dt){
    if(!S3.heroes.length) s3Reset();
    const g=s3Geo(); S3.t+=dt;
    for(const p of S3.swirl){ p.a+=(1.2+(1.2-p.r)*3.5)*dt*(1+S3.surge*3); p.r-=dt*.12*(1+S3.surge*4); if(p.r<.08){ p.r=R(1,1.2); p.a=R(0,7); } }
    S3.surge=Math.max(0,S3.surge-dt);
    S3.nextBolt-=dt; if(S3.nextBolt<=0){ S3.nextBolt=R(1.2,2.6); const a=R(-2.6,-.5); lightning(R(0,W),0,g.px+Math.cos(a)*g.r,g.py+Math.sin(a)*g.r*.9,'200,150,255'); flash=Math.max(flash,.18); flashCol='200,170,255'; }
    for(const h of S3.heroes){ h.t+=dt;
      if(!h.landed&&S3.t>=h.arrive+.45){ h.landed=true; shake=Math.max(shake,9); ring(h.x,g.gy,46*P,HC[h.id][1],.6,6); dust(h.x,g.gy,16); burst(h.x,g.gy-14*P,[HC[h.id][0],HC[h.id][1],'#fff'],26,260*P/3,P); floatTxt(h.x,g.gy-50*g.s*SC[h.id],ROLE[h.id],HC[h.id][1],8*P/3+10); hit(); }
      if(!h.landed) continue; const A=ATK[h.id];
      if(h.atk>=0){ h.atk+=dt;
        if(!h.done&&h.atk>=A.dur*A.hit){ h.done=true; const e=h.target;
          if(e&&!e.dead){ const s=s3Geo().s*SC[h.id], m=MUZ[h.id];
            shoot(A.melee?'bolt':A.proj,h.x+(h.flip?-m[0]:m[0])*s,g.gy-m[1]*s,e,()=>{ if(e.dead) return; e.hp--; e.flash=.1; const p=s3Pos(e);
              floatTxt(p.x,p.y-10*P,fmtD(R(1e3,6e3)),'#fff',9*P/3+6); burst(p.x,p.y,['#fff',HC[h.id][1]],6,110*P/3,P*.8); if(e.hp<=0) s3Kill(e); }); } }
        if(h.atk>=A.dur) h.atk=-1;
      } else { h.cd-=dt; if(h.cd<=0){ const cand=S3.mobs.filter(e=>!e.dead&&e.q>.35&&e.pend<e.hp);
        if(cand.length){ const e=pick(cand); e.pend++; h.target=e; h.atk=0; h.done=false; h.cd=A.cd*R(.9,1.4); } } }
    }
    if(S3.t>4&&S3.t<S3_CYCLE-1.2){ S3.spawn-=dt; if(S3.spawn<=0){ S3.spawn=R(.35,.75);
      const type=pick(MOBS), tx=R(W*.18,W*.82), ty=FLY(type)||FLOAT(type)?R(g.gy-46*P,g.py+g.r*.6):g.gy;
      S3.mobs.push({type,x:g.px,y:g.py,sx:g.px,sy:g.py,tx,ty,q:0,s:0,S:s3Geo().s*R(.9,1.15),hp:Math.ceil(R(1,3)),pend:0,t:0,flash:0,faceR:tx>g.px?true:false,alpha:1}); } }
    for(const e of S3.mobs){ e.t+=dt; e.flash-=dt; e.q=Math.min(1,e.q+dt/1.3); const q=easeOut(e.q);
      e.x=lerp(e.sx,e.tx,q); e.y=lerp(e.sy,e.ty,q)-Math.sin(q*Math.PI)*g.r*.5; e.s=lerp(P*.2,e.S,q);
      if(e.q>=1){ e.x+=Math.sin(e.t*2)*.3; } }
    S3.mobs=S3.mobs.filter(e=>!e.dead);
    if(S3.t>=S3_CYCLE-1.2&&!S3.surged){ S3.surged=true; S3.surge=1.2; flash=.8; flashCol='230,200,255'; shake=14; hit(); S3.mobs.forEach(s3Kill); }
    if(S3.t>=S3_CYCLE){ S3.surged=false; s3Reset(); }
    updProj(dt,s3Pos);
  }
  function s3Draw(t){
    const g=s3Geo();
    sky('#040209','#140a24','#2a1640'); stars(t);
    // портал
    const pulse=1+Math.sin(t*3)*.03+S3.surge*.15, r=g.r*pulse;
    let gl=c.createRadialGradient(g.px,g.py,r*.3,g.px,g.py,r*2.4); gl.addColorStop(0,'rgba(150,60,255,.45)'); gl.addColorStop(1,'rgba(90,20,200,0)'); c.fillStyle=gl; c.fillRect(0,0,W,H);
    c.save(); c.translate(g.px,g.py); c.scale(1,.9);
    const d=c.createRadialGradient(0,0,0,0,0,r); d.addColorStop(0,'#000'); d.addColorStop(.5,'#0d0320'); d.addColorStop(.82,'#3a1070'); d.addColorStop(.95,'#b56cff'); d.addColorStop(1,'rgba(240,210,255,.0)');
    c.fillStyle=d; c.beginPath(); c.arc(0,0,r,0,7); c.fill();
    c.globalCompositeOperation='lighter';
    for(const p of S3.swirl){ const rr=p.r*r, x=Math.cos(p.a)*rr, y=Math.sin(p.a)*rr; c.globalAlpha=clamp((1.2-p.r)*.9,0,.9)*(p.r<.3?p.r/.3:1); c.fillStyle=p.c<.6?'#b56cff':p.c<.85?'#e8c0ff':'#ffd27a'; c.fillRect(x,y,2+p.c*1.5,2+p.c*1.5); }
    c.globalAlpha=.85; c.strokeStyle='#e3b8ff'; c.lineWidth=2; c.setLineDash([r*.08,r*.05]); c.lineDashOffset=-t*40; c.beginPath(); c.arc(0,0,r*1.04,0,7); c.stroke();
    c.strokeStyle='#ffd27a'; c.globalAlpha=.6; c.setLineDash([2,r*.1]); c.lineDashOffset=t*30; c.beginPath(); c.arc(0,0,r*1.12,0,7); c.stroke(); c.setLineDash([]);
    c.restore();
    if(Math.random()<.25){ const a=R(0,7), a2=a+R(.3,.8); const pts=[]; for(let i=0;i<=6;i++){ const aa=lerp(a,a2,i/6), rr=r*R(.95,1.1); pts.push([g.px+Math.cos(aa)*rr,g.py+Math.sin(aa)*rr*.9]); } bolts.push({pts,t:0,dur:.12,col:'220,170,255'}); }
    // земля-утёс
    c.fillStyle='#0b0612'; c.beginPath(); c.moveTo(0,H); c.lineTo(0,g.gy-P*2); for(let x=0;x<=W;x+=P*6) c.lineTo(x,g.gy+((x/P*7)%3|0)*P-P*2); c.lineTo(W,H); c.fill();
    c.fillStyle='#3a2058'; c.fillRect(0,g.gy-P*2,W,P);
    // лучи прибытия героев
    for(const h of S3.heroes){ const q=(S3.t-h.arrive)/.45;
      if(q>=0&&q<1.2){ const a=q<1?Math.min(1,q*3):1-(q-1)/.2; c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=a*.6;
        const bw=12*P; const lg=c.createLinearGradient(h.x-bw,0,h.x+bw,0); lg.addColorStop(0,'rgba(0,0,0,0)'); lg.addColorStop(.5,HC[h.id][1]); lg.addColorStop(1,'rgba(0,0,0,0)');
        c.fillStyle=lg; c.fillRect(h.x-bw,0,bw*2,g.gy); c.restore(); } }
    for(const e of S3.mobs) if(e.q>=1&&e.ty===g.gy) shadow(e.x,g.gy,7*e.s);
    for(const h of S3.heroes){ const q=(S3.t-h.arrive)/.45; if(q<0) continue; const s=g.s*SC[h.id];
      if(!h.landed){ const k=easeOut(Math.min(1,q)); const x=lerp(g.px,h.x,k), y=lerp(g.py,g.gy,k)-Math.sin(k*Math.PI)*g.r*.4;
        drawF(frameOf(h.id,'run',h.t,RUNF[h.id]),x,y,s*lerp(.2,1,k),h.flip,k,.6); continue; }
      shadow(h.x,g.gy,9*s*1.45);
      const A=ATK[h.id], f=h.atk>=0?frameOf(h.id,A.a,h.atk,FRS[h.id][A.a].length/A.dur,true):frameOf(h.id,'idle',h.t,IDLEF[h.id]);
      const fresh=S3.t-h.arrive-.45; drawF(f,h.x,g.gy,s,h.flip,1,fresh<.4?(.4-fresh)*1.5:0); }
    for(const e of S3.mobs) drawMob(e,e.x,e.y,e.s);
    drawProj(); drawFx();
  }

  /* ---------- цикл ---------- */
  const SCENES={1:[s1Update,s1Draw],2:[s2Update,s2Draw],3:[s3Update,s3Draw]};
  let raf=0, last=performance.now(), T=0, running=true;
  function frame(now){
    if(!running) return; raf=requestAnimationFrame(frame);
    const dt=Math.min(.05,(now-last)/1000); last=now; T+=dt;
    if(!bg){ makeBg(); S1.heroes=null; S1.mobs=[]; S3.heroes=[]; S3.mobs=[]; projs=[]; }
    ui(); const [upd,drw]=SCENES[V];
    try{ upd(dt); updFx(dt);
      c.setTransform(DPR,0,0,DPR,0,0); c.imageSmoothingEnabled=false;
      if(shake>0) c.translate(R(-1,1)*shake*.5,R(-1,1)*shake*.5);
      drw(T);
      if(flash>0){ c.setTransform(DPR,0,0,DPR,0,0); c.fillStyle=`rgba(${flashCol},${Math.min(.85,flash)})`; c.fillRect(0,0,W,H); }
      const v=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,.55)');
      c.setTransform(DPR,0,0,DPR,0,0); c.fillStyle=v; c.fillRect(0,0,W,H);
    }catch(e){ console.error(e); running=false; }
  }
  resize(); addEventListener('resize',resize);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ /* один статичный кадр */ setTimeout(()=>{ frame(performance.now()); running=false; },400); }
  else raf=requestAnimationFrame(frame);

  if(DEMO){
    const sw=document.createElement('div'); sw.className='ld-demo';
    sw.innerHTML=['Натиск','Герои','Портал'].map((n,i)=>`<a href="?splash=${i+1}&demo=1" class="${V===i+1?'on':''}">${i+1}. ${n}</a>`).join('');
    root.appendChild(sw);
  }
  return {demo:DEMO,stop(){ running=false; cancelAnimationFrame(raf); removeEventListener('resize',resize); }};
})();
