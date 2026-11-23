// ---- hero picker: tarot cards ----
const HEROES_ROLE={mage:T('Маг'),tank:T('Танк'),asn:T('Убийца'),sam:T('Стрелок')};
const PK_RATE_N=[T('Атака'),T('Защита'),T('Скорость'),T('Дальность')];
const PK={open:false,idx:0,pos:0,drag:null,sel:{},raf:0,t0:0,first:false,tmp:null};
const PK_IDS=()=>Object.keys(HEROES);
function withHero(id,fn){ const s={h:S.hero,HD,SK,FR,sk:S.sk}; S.hero=id; HD=HEROES[id]; SK=SKS[id]; FR=FRS[id]; S.sk=S.sks[id];
  try{ return fn(); } finally{ S.hero=s.h; HD=s.HD; SK=s.SK; FR=s.FR; S.sk=s.sk; } }
function pkRender(){
  const ids=PK_IDS(), id=ids[PK.idx], hd=HEROES[id], sel=PK.sel[id]||0;
  const statsOf=h2=>withHero(h2,()=>{ const b=buff.power; buff.power=0; const r={atk:st.atk(),aps:st.aps(),hp:st.maxHp(),crit:st.crit(),cm:st.critM(),bm:calcBM()}; buff.power=b; return r; });
  const v=statsOf(id), hb=heroBase(id);
  const rate=(HERO_RATE[id]||[3,3,3,3]).map((n,i)=>`<div><span>${PK_RATE_N[i]}</span><span class="pk-pips" aria-label="${n} ${T("из 5")}">${[0,1,2,3,4].map(j=>`<i class="${j<n?'on':''}"></i>`).join('')}</span></div>`).join('');
  const sks=SKS[id].map((s,i)=>`<button class="pk-sk ${i===sel?'on':''} ${S.lvl<s.unlock?'lock':''}" data-pks="${i}" aria-label="${s.name}"><canvas width="64" height="64"></canvas></button>`).join('');
  const s=SKS[id][sel], lv=(S.sks[id]||[])[sel]||1;
  $('pkInfo').innerHTML=`<h2>${hd.name}</h2>
    <p class="pk-role">${HEROES_ROLE[id]||''}, ${hd.melee?T('ближний бой'):T('дальний бой')}${id===S.hero&&S.picked?(' '+T('— сейчас в бою')):''}</p>
    <p class="pk-desc">${hd.desc}</p>
    <div class="pk-rate">${rate}</div>
    <p class="pk-nums">${T("Боевая мощь")} <b>${fmt(v.bm)}</b>${T("&nbsp;&nbsp; Урон")} <b>${fmt(v.atk)}</b>${T("&nbsp;&nbsp; Здоровье")} <b>${fmt(v.hp)}</b><br>${T("Атак в секунду")} <b>${v.aps.toFixed(2)}</b>${T("&nbsp;&nbsp; Крит")} <b>${Math.round(v.crit*100)}%</b>${T("&nbsp;&nbsp; Сила крита")} <b>x${v.cm.toFixed(2)}</b>${hb.def?`${T("&nbsp;&nbsp; Броня")} <b>${Math.round(hb.def*100)}%</b>`:''}</p>
    <div class="pk-sks">${sks}</div>
    <p class="pk-skinfo"><b>${s.name}.</b> ${s.info(lv)}<small>${T("Перезарядка")} ${s.cd} ${T("с, открывается на")} ${s.unlock} ${T("уровне")}</small></p>
    <p class="pk-psv">${T("Пассивные:")} ${PSV[id].map(p=>p.name).join(', ')}</p>`;
  if(imgReady) $('pkInfo').querySelectorAll('[data-pks]').forEach(b=>{ const k=+b.dataset.pks, sk=SKS[id][k]; frameThumb(b.querySelector('canvas'),id,sk.icon[0],sk.icon[1]); });
  const go=$('pkGo'), cur=id===S.hero&&S.picked; go.classList.toggle('cur',cur); go.textContent=cur?T('Вернуться в бой'):T('Выбрать героя');
}
function pkSetIdx(k){ const n=PK_IDS().length; k=((k%n)+n)%n; if(k===PK.idx) return; PK.idx=k; PK.t0=performance.now(); PK.sw=performance.now();
  const el=$('pkInfo'); if(matchMedia('(prefers-reduced-motion: reduce)').matches){ pkRender(); return; }
  el.classList.add('fade'); clearTimeout(PK.ft); PK.ft=setTimeout(()=>{ pkRender(); el.classList.remove('fade'); },150); }
function pkStep(d){ PK.target=Math.round(PK.pos)+d; pkSetIdx(PK.target); }
// --- scene ---
function pkHero(c,id,gx,gy,z,bright,warm,attack,t,tAtk){
  const F=FRS[id], hd=HEROES[id]; if(!F) return;
  let an, fi;
  if(attack){ an=F.atk; fi=Math.min(an.length-1,Math.floor(tAtk/(hd.atkDur||0.8)*an.length)); }
  else { an=F.idle; fi=Math.floor(t*(hd.idle||8))%an.length; }
  const [fx,fy,fw,fh,ax,bot]=an[fi]; const dw=Math.max(1,Math.round(fw*z)), dh=Math.max(1,Math.round(fh*z));
  const T=PK.tmp||(PK.tmp=document.createElement('canvas')); if(T.width<dw||T.height<dh){ T.width=Math.max(T.width,dw); T.height=Math.max(T.height,dh); }
  const x=T.getContext('2d'); x.clearRect(0,0,T.width,T.height); x.imageSmoothingEnabled=false; x.globalCompositeOperation='source-over'; x.drawImage(img,fx,fy,fw,fh,0,0,dw,dh);
  x.globalCompositeOperation='source-atop';
  if(bright<1){ x.fillStyle=`rgba(8,10,22,${(1-bright).toFixed(3)})`; x.fillRect(0,0,dw,dh); }
  if(warm>0){ const g=x.createLinearGradient(0,0,0,dh); g.addColorStop(0,`rgba(255,150,70,${warm*0.08})`); g.addColorStop(1,`rgba(255,120,40,${warm*0.22})`); x.fillStyle=g; x.fillRect(0,0,dw,dh); }
  x.globalCompositeOperation='source-over';
  c.fillStyle=`rgba(0,0,0,${0.35+0.25*bright})`; c.beginPath(); c.ellipse(gx,gy,9*z*(hd.art||1),2.2*z*(hd.art||1),0,0,7); c.fill();
  c.drawImage(T,0,0,dw,dh,Math.round(gx-ax*z),Math.round(gy-(bot+1)*z+z),dw,dh);
}
function pkDraw(now){
  if(!PK.open) return; PK.raf=requestAnimationFrame(pkDraw);
  const pk=$('picker'), cv=$('pkBg'), sc=$('pkScene'); if(!pk||!cv||!sc) return; const R=pk.getBoundingClientRect(); if(R.width<20) return;
  const dpr=Math.min(window.devicePixelRatio||1,2), W=Math.round(R.width*dpr), H=Math.round(R.height*dpr);
  if(cv.width!==W||cv.height!==H){ cv.width=W; cv.height=H; }
  const sr=sc.getBoundingClientRect(); const P=Math.max(2,Math.round(R.height/230)), S2=P*dpr;
  const t=now/1000, dt=Math.min(0.05,(now-(PK.last||now))/1000); PK.last=now;
  const n=PK_IDS().length;
  if(!PK.drag){ let d=PK.idx-PK.pos; d=((d%n)+n+n/2)%n-n/2; PK.pos+=d*Math.min(1,dt*9); if(Math.abs(d)<0.001) PK.pos=PK.idx; }
  const c=cv.getContext('2d'); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,W,H);
  const G={c,W,H,dpr,R,sr,P,S2,t,dt,now,n}; pkArc(G); pkTopShade(G);
}
const HCOL={mage:['#b45cff','#e8c0ff'],tank:['#5ab4ff','#d0eeff'],asn:['#ff3a5a','#ffc0cc'],sam:['#5fe08a','#d8ffe4']};
const ROMAN=['I','II','III','IV','V','VI'];
function pkTopShade({c,R,dpr,W}){ const ib=$('pkInfo').getBoundingClientRect(); const yb=(ib.bottom-R.top)*dpr; const gt=c.createLinearGradient(0,0,0,yb+40*dpr); gt.addColorStop(0,'rgba(5,6,12,.85)'); gt.addColorStop(0.75,'rgba(5,6,12,.6)'); gt.addColorStop(1,'rgba(5,6,12,0)'); c.fillStyle=gt; c.fillRect(0,0,W,yb+40*dpr); }
function pkD(k,n){ let d=k-PK.pos; return ((d%n)+n+n/2)%n-n/2; }
function pkAtk(G,id,k){ const hd=HEROES[id]; const front=k===PK.idx&&!PK.drag&&Math.abs(PK.pos-PK.idx)<0.05; const tA=(G.now-PK.t0)/1000, cyc=2.6+(hd.atkDur||0.8), tt=Math.max(0,tA)%cyc; return [front&&tt>2.6, tt-2.6]; }
function pkZ(G,id,targetH){ const hd=HEROES[id], F=FRS[id]; const mh=Math.max(...F.idle.map(q=>q[5]+1)); return Math.min(G.S2*(hd.sc||1)*1.45,targetH/mh); }
function pkRound(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function pkMotes(G,list,x0,x1,y0,y1,col,speed){ const {c,t,dpr}=G; for(let i=0;i<list;i++){ const s=(i*0.6180339)%1, s2=(i*0.3819)%1; const x=x0+(x1-x0)*((s+t*0.01*(i%3+1))%1), y=y1-((s2*(y1-y0)+t*speed*(8+i%5)*dpr)%(y1-y0)); c.globalAlpha=0.2+0.3*Math.sin(t*2+i); c.fillStyle=col; c.fillRect(Math.round(x),Math.round(y),2*dpr,2*dpr); } c.globalAlpha=1; }
function pkCards(G){
  const {c,W,H,dpr,sr,R,t,n}=G; const ids=PK_IDS();
  let g=c.createRadialGradient(W/2,H*0.62,10,W/2,H*0.62,H*0.8); g.addColorStop(0,'#3a1426'); g.addColorStop(0.5,'#1a0911'); g.addColorStop(1,'#070306'); c.fillStyle=g; c.fillRect(0,0,W,H);
  c.save(); c.globalAlpha=0.05; c.strokeStyle='#c9a25a'; c.lineWidth=1*dpr; for(let x=-H;x<W+H;x+=26*dpr){ c.beginPath(); c.moveTo(x,0); c.lineTo(x+H,H); c.moveTo(x+H,0); c.lineTo(x,H); c.stroke(); } c.restore();
  const sceneH=sr.height*dpr, ch=Math.min(sceneH*0.9,W*0.95), cw=ch*0.62, baseY=(sr.bottom-R.top)*dpr-8*dpr;
  pkMotes(G,24,0,W,(sr.top-R.top)*dpr,baseY,'#ffd9a0',0.6);
  const list=ids.map((id,k)=>({id,k,d:pkD(k,n)})).sort((a,b)=>Math.abs(b.d)-Math.abs(a.d));
  list.forEach(p=>{ const ad=Math.min(2,Math.abs(p.d)); const col=HCOL[p.id]||['#c9a25a','#fff'];
    const tx=W/2+p.d*cw*0.58, rot=p.d*0.2, s=1-0.17*ad, lift=(1-Math.min(1,ad))*14*dpr;
    c.save(); c.translate(tx,baseY-lift+ad*12*dpr); c.rotate(rot); c.scale(s,s);
    // shadow
    c.fillStyle='rgba(0,0,0,.5)'; pkRound(c,-cw/2+6*dpr,-ch+10*dpr,cw,ch,12*dpr); c.fill();
    // frame
    let fg=c.createLinearGradient(-cw/2,-ch,cw/2,0); fg.addColorStop(0,'#f3d27a'); fg.addColorStop(0.5,'#9a7438'); fg.addColorStop(1,'#e8c068'); c.fillStyle=fg; pkRound(c,-cw/2,-ch,cw,ch,12*dpr); c.fill();
    const m=6*dpr; let ig=c.createLinearGradient(0,-ch,0,0); ig.addColorStop(0,col[0]); ig.addColorStop(0.45,'#1a0f22'); ig.addColorStop(1,'#0b0710'); c.fillStyle=ig; pkRound(c,-cw/2+m,-ch+m,cw-m*2,ch-m*2,8*dpr); c.fill();
    c.save(); pkRound(c,-cw/2+m,-ch+m,cw-m*2,ch-m*2,8*dpr); c.clip();
    // sunburst
    c.globalAlpha=0.12; c.fillStyle=col[1]; for(let i=0;i<16;i++){ const a=i/16*Math.PI*2+t*0.15; c.beginPath(); c.moveTo(0,-ch*0.55); c.lineTo(Math.cos(a)*ch,-ch*0.55+Math.sin(a)*ch); c.lineTo(Math.cos(a+0.12)*ch,-ch*0.55+Math.sin(a+0.12)*ch); c.fill(); } c.globalAlpha=1;
    const gl=c.createRadialGradient(0,-ch*0.4,0,0,-ch*0.4,cw*0.6); gl.addColorStop(0,col[0]+'88'); gl.addColorStop(1,col[0]+'00'); c.fillStyle=gl; c.fillRect(-cw/2,-ch,cw,ch);
    // floor arc
    c.fillStyle='rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(0,-ch*0.2,cw*0.38,cw*0.08,0,0,7); c.fill();
    if(imgReady){ const [atk,ta]=pkAtk(G,p.id,p.k); const z=pkZ(G,p.id,ch*0.5); pkHero(c,p.id,0,-ch*0.2,z,1,0,atk,t+p.k*0.4,ta); }
    // shine sweep on front card
    if(ad<0.3){ const sx=((t*0.45)%1.6-0.3)*cw*2-cw; const sg=c.createLinearGradient(sx,-ch,sx+cw*0.5,0); sg.addColorStop(0,'rgba(255,255,255,0)'); sg.addColorStop(0.5,'rgba(255,255,255,.16)'); sg.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=sg; c.fillRect(-cw/2,-ch,cw,ch); }
    c.restore();
    // inner gold line, numeral, name ribbon
    c.strokeStyle='#e8c068'; c.lineWidth=1.5*dpr; pkRound(c,-cw/2+m+4*dpr,-ch+m+4*dpr,cw-m*2-8*dpr,ch-m*2-8*dpr,6*dpr); c.stroke();
    c.fillStyle='#f6e7c8'; c.textAlign='center'; c.textBaseline='middle'; c.font=`700 ${Math.round(ch*0.07)}px Philosopher, Georgia, serif`; c.fillText(ROMAN[p.k]||'',0,-ch+m+ch*0.07);
    const rb=ch*0.11; c.fillStyle='#120a14'; c.fillRect(-cw/2+m+4*dpr,-m-4*dpr-rb,cw-m*2-8*dpr,rb); c.strokeStyle='#e8c068'; c.strokeRect(-cw/2+m+4*dpr,-m-4*dpr-rb,cw-m*2-8*dpr,rb);
    c.fillStyle='#f3d27a'; let fs=Math.round(rb*0.5); c.font=`700 ${fs}px Philosopher, Georgia, serif`; const nm=HEROES[p.id].name; while(c.measureText(nm).width>cw-m*2-16*dpr&&fs>8){ fs--; c.font=`700 ${fs}px Philosopher, Georgia, serif`; } c.fillText(nm,0,-m-4*dpr-rb/2);
    if(ad>0.05){ c.fillStyle=`rgba(5,2,6,${Math.min(0.65,ad*0.6)})`; pkRound(c,-cw/2,-ch,cw,ch,12*dpr); c.fill(); }
    c.restore(); });
}


// ---- all heroes in a semicircle on a moonlit ritual plateau ----
function pkRGB(h){ const n=parseInt(h.slice(1),16); return [n>>16&255,n>>8&255,n&255]; }
function pkA(h,a){ const [r,g,b]=pkRGB(h); return `rgba(${r},${g},${b},${a})`; }
function pkArc(G){
  const {c,W,H,dpr,sr,R,t,n,now}=G; const ids=PK_IDS(); const sel=PK.idx, sc=HCOL[ids[sel]]||['#c9a25a','#fff'];
  const sceneH=sr.height*dpr, top=(sr.top-R.top)*dpr, baseY=top+sceneH*0.88, arcH=sceneH*0.2, hz=baseY-arcH-sceneH*0.1;
  // sky
  let g=c.createLinearGradient(0,0,0,hz); g.addColorStop(0,'#04040c'); g.addColorStop(0.55,'#0f0c28'); g.addColorStop(1,'#2a1436'); c.fillStyle=g; c.fillRect(0,0,W,H);
  c.save(); c.globalCompositeOperation='lighter';
  [[0.25,0.35,'rgba(110,60,200,.20)',0.6],[0.78,0.25,'rgba(40,110,200,.16)',0.5],[0.55,0.55,pkA(sc[0],0.16),0.55]].forEach(([x,y,col,rr],k)=>{ const gx=W*x+Math.sin(t*0.15+k*2)*24*dpr, gy=hz*y+Math.cos(t*0.12+k)*12*dpr, r=H*rr; const q=c.createRadialGradient(gx,gy,0,gx,gy,r); q.addColorStop(0,col); q.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=q; c.fillRect(0,0,W,hz+40*dpr); });
  c.restore();
  if(!PK.stars||PK.starsW!==W){ const r=seeded(3); PK.starsW=W; PK.stars=Array.from({length:140},()=>({x:r()*W,y:r()*0.95,s:r()<0.12?2:1,p:r()*7})); }
  PK.stars.forEach(st2=>{ c.globalAlpha=0.25+0.6*Math.abs(Math.sin(t*0.9+st2.p)); c.fillStyle='#e6ecff'; c.fillRect(st2.x,st2.y*hz,st2.s*dpr,st2.s*dpr); }); c.globalAlpha=1;
  // moon
  const mx=W*0.5, my=hz-sceneH*0.18, mr=Math.min(W*0.2,sceneH*0.24);
  c.save(); c.globalCompositeOperation='lighter'; let mg=c.createRadialGradient(mx,my,mr*0.6,mx,my,mr*2.6); mg.addColorStop(0,'rgba(230,220,255,.28)'); mg.addColorStop(1,'rgba(230,220,255,0)'); c.fillStyle=mg; c.fillRect(mx-mr*3,my-mr*3,mr*6,mr*6); c.restore();
  let md=c.createRadialGradient(mx-mr*0.3,my-mr*0.3,mr*0.1,mx,my,mr); md.addColorStop(0,'#f4f0ff'); md.addColorStop(1,'#b8b0d8'); c.fillStyle=md; c.beginPath(); c.arc(mx,my,mr,0,7); c.fill();
  c.fillStyle='rgba(120,110,160,.35)'; [[-0.35,-0.2,0.18],[0.3,0.15,0.12],[0.05,0.45,0.1],[-0.1,0.05,0.07]].forEach(([dx,dy,rr])=>{ c.beginPath(); c.arc(mx+dx*mr,my+dy*mr,rr*mr,0,7); c.fill(); });
  // mountains & spires
  const ridge=(col,amp,off,yb)=>{ c.fillStyle=col; c.beginPath(); c.moveTo(0,H); for(let x=0;x<=W;x+=4*dpr){ c.lineTo(x,yb-amp*(0.5+0.5*Math.sin(x/W*7+off))-amp*0.4*Math.sin(x/W*17+off*2)); } c.lineTo(W,H); c.fill(); };
  ridge('#120c22',sceneH*0.12,1.3,hz+sceneH*0.02);
  c.fillStyle='#0c0818'; [[0.12,0.22],[0.18,0.3],[0.86,0.26],[0.92,0.18]].forEach(([x,hh])=>{ const bx=W*x, h2=sceneH*hh, w2=W*0.022; c.fillRect(bx-w2/2,hz-h2*0.6,w2,h2); c.beginPath(); c.moveTo(bx-w2*0.8,hz-h2*0.6); c.lineTo(bx,hz-h2*0.6-w2*2.4); c.lineTo(bx+w2*0.8,hz-h2*0.6); c.fill(); });
  ridge('#0a0614',sceneH*0.06,3.1,hz+sceneH*0.08);
  // plateau
  const pcx=W/2, pcy=baseY-arcH*0.5, prx=W*0.47, pry=arcH*0.95;
  let pg=c.createLinearGradient(0,pcy-pry,0,H); pg.addColorStop(0,'#1c1426'); pg.addColorStop(1,'#08050c'); c.fillStyle=pg; c.beginPath(); c.ellipse(pcx,pcy,prx,pry,0,Math.PI,0); c.lineTo(W,H); c.lineTo(0,H); c.closePath(); c.fill();
  // magic circle (rotating rings in selected hero colour)
  c.save(); c.translate(pcx,pcy); c.scale(1,pry/prx); c.globalCompositeOperation='lighter';
  const ring=(r,w,a,dash,rot,col)=>{ c.save(); c.rotate(rot); c.strokeStyle=col; c.globalAlpha=a; c.lineWidth=w; c.setLineDash(dash); c.beginPath(); c.arc(0,0,r,0,7); c.stroke(); c.restore(); };
  ring(prx*0.86,2*dpr,0.55,[],0,sc[0]); ring(prx*0.8,1.5*dpr,0.5,[10*dpr,6*dpr],t*0.25,sc[1]); ring(prx*0.62,1.5*dpr,0.45,[3*dpr,9*dpr],-t*0.4,sc[0]); ring(prx*0.36,2*dpr,0.4,[16*dpr,10*dpr],t*0.6,sc[1]);
  c.globalAlpha=0.45; c.strokeStyle=sc[0]; c.lineWidth=1.2*dpr; for(let i=0;i<5;i++){ const a0=t*0.12+i*Math.PI*2/5, a1=a0+Math.PI*4/5; c.beginPath(); c.moveTo(Math.cos(a0)*prx*0.62,Math.sin(a0)*prx*0.62); c.lineTo(Math.cos(a1)*prx*0.62,Math.sin(a1)*prx*0.62); c.stroke(); }
  for(let i=0;i<24;i++){ const a=i/24*Math.PI*2-t*0.25; c.save(); c.rotate(a); c.translate(prx*0.83,0); c.globalAlpha=0.5+0.4*Math.sin(t*3+i); c.fillStyle=sc[1]; c.fillRect(-1.5*dpr,-4*dpr,3*dpr,8*dpr); c.restore(); }
  const cg=c.createRadialGradient(0,0,0,0,0,prx*0.9); cg.addColorStop(0,pkA(sc[0],0.22)); cg.addColorStop(1,pkA(sc[0],0)); c.globalAlpha=1; c.fillStyle=cg; c.beginPath(); c.arc(0,0,prx*0.9,0,7); c.fill();
  c.restore();
  // switch shockwave
  const sw=(now-(PK.sw||-1e9))/1000; const selP={};
  const pos=ids.map((id,k)=>{ const tt=n>1?(k/(n-1))*2-1:0; return {id,k,tt,x:W/2+tt*W*0.31,y:baseY-(1-tt*tt)*arcH}; });
  pos.forEach(p=>{ if(p.k===sel){ selP.x=p.x; selP.y=p.y; } });
  if(sw<0.7&&selP.x!=null){ const k=sw/0.7; c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle=pkA(sc[1],0.8*(1-k)); c.lineWidth=(4-3*k)*dpr; c.beginPath(); c.ellipse(selP.x,selP.y,(14+120*k)*dpr,(4+34*k)*dpr,0,0,7); c.stroke(); c.restore(); }
  const hits=[];
  pos.slice().sort((a,b)=>a.y-b.y).forEach(p=>{
    const on=p.k===sel, hd=HEROES[p.id], col=HCOL[p.id]||['#c9a25a','#fff']; const s=(0.82+0.12*Math.abs(p.tt))*(on?1.12:1);
    // pedestal
    const pw=20*dpr*s, ph=7*dpr*s;
    c.fillStyle='#1e1828'; c.fillRect(p.x-pw,p.y,pw*2,ph); c.beginPath(); c.ellipse(p.x,p.y+ph,pw,pw*0.28,0,0,Math.PI); c.fill();
    c.fillStyle='#3a3048'; c.beginPath(); c.ellipse(p.x,p.y,pw,pw*0.28,0,0,7); c.fill();
    c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle=pkA(col[0],on?0.95:0.35); c.lineWidth=(on?2:1.2)*dpr; c.beginPath(); c.ellipse(p.x,p.y,pw*0.82,pw*0.22,0,0,7); c.stroke();
    c.fillStyle=pkA(col[0],on?0.55:0.18); c.fillRect(p.x-pw,p.y+ph*0.45,pw*2,1.5*dpr); c.restore();
    if(on){ // light pillar + rising motes
      c.save(); c.globalCompositeOperation='lighter'; const bg=c.createLinearGradient(0,0,0,p.y); bg.addColorStop(0,pkA(col[0],0)); bg.addColorStop(0.6,pkA(col[0],0.10)); bg.addColorStop(1,pkA(col[1],0.32)); c.fillStyle=bg; c.beginPath(); c.moveTo(p.x-pw*0.55,0); c.lineTo(p.x+pw*0.55,0); c.lineTo(p.x+pw*0.95,p.y); c.lineTo(p.x-pw*0.95,p.y); c.fill();
      for(let i=0;i<22;i++){ const ss=(i*0.618)%1, ph2=(t*0.35+ss)%1; const x=p.x+(ss-0.5)*pw*1.6+Math.sin(t*2+i)*3*dpr, y=p.y-ph2*sceneH*0.7; c.globalAlpha=(1-ph2)*0.9; c.fillStyle=i%3?col[0]:col[1]; c.fillRect(x,y,2*dpr,2*dpr); } c.restore(); }
    if(imgReady){ const z=Math.min(pkZ(G,p.id,sceneH*0.36),G.S2*(hd.sc||1)*0.9)*s; const [atk,ta]=pkAtk(G,p.id,p.k);
      pkHero(c,p.id,p.x,p.y,z,on?1:0.38,on?0.12:0,atk,t+p.k*0.45,ta);
      const F=FRS[p.id]; const mh=Math.max(...F.idle.map(q=>q[5]+1)); const headY=p.y-mh*z-8*dpr+Math.sin(t*2+p.k)*1.5*dpr*(on?1:0);
      const lab=HEROES_ROLE[p.id]||hd.name; c.font=`700 ${Math.round((on?14:12)*dpr)}px Philosopher, Georgia, serif`; const tw=c.measureText(lab).width, lh=(on?22:18)*dpr, lw=tw+16*dpr;
      if(on){ c.save(); c.shadowColor=col[0]; c.shadowBlur=14*dpr; c.fillStyle=pkA(col[0],0.95); pkRound(c,p.x-lw/2,headY-lh,lw,lh,lh/2); c.fill(); c.restore(); }
      else { c.fillStyle='rgba(14,10,22,.82)'; pkRound(c,p.x-lw/2,headY-lh,lw,lh,lh/2); c.fill(); c.strokeStyle=pkA(col[0],0.5); c.lineWidth=dpr; c.stroke(); }
      c.fillStyle=on?'#0e0814':pkA(col[1],0.85); c.textAlign='center'; c.textBaseline='middle'; c.fillText(lab,p.x,headY-lh/2+0.5*dpr);
      if(on){ c.fillStyle=pkA(col[0],0.95); c.beginPath(); c.moveTo(p.x-4*dpr,headY); c.lineTo(p.x+4*dpr,headY); c.lineTo(p.x,headY+5*dpr); c.fill(); }
      hits.push({k:p.k,x:(p.x/dpr)+R.left,w:Math.max(30,W*0.13/dpr),y0:(headY-lh)/dpr+R.top,y1:p.y/dpr+R.top+10}); }
  });
  PK.hits=hits;
  // drifting fog at the bottom
  c.save(); for(let i=0;i<3;i++){ const fy=baseY-arcH*0.1+i*sceneH*0.05, off=((t*(8+i*5)*dpr)%W); const fg=c.createLinearGradient(0,fy-30*dpr,0,fy+30*dpr); fg.addColorStop(0,'rgba(150,130,200,0)'); fg.addColorStop(0.5,`rgba(150,130,200,${0.05+i*0.02})`); fg.addColorStop(1,'rgba(150,130,200,0)'); c.fillStyle=fg; c.fillRect(-off,fy-30*dpr,W*2,60*dpr); } c.restore();
  const vg=c.createRadialGradient(W/2,baseY-sceneH*0.4,H*0.15,W/2,baseY-sceneH*0.4,H*0.85); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.6)'); c.fillStyle=vg; c.fillRect(0,0,W,H);
}
function openPicker(first){
  PK.open=true; PK.first=!!first; $('picker').hidden=false; $('pkClose').hidden=!!first;
  const k=Math.max(0,PK_IDS().indexOf(S.hero)); PK.idx=k; PK.pos=k; PK.t0=performance.now(); PK.last=0; pkRender();
  cancelAnimationFrame(PK.raf); PK.raf=requestAnimationFrame(pkDraw);
  if(typeof gameRunCheck==='function') gameRunCheck();
}
function closePicker(){ PK.open=false; $('picker').hidden=true; cancelAnimationFrame(PK.raf); if(typeof gameRunCheck==='function') gameRunCheck(); }
(function(){
  const sc=$('pkScene');
  sc.addEventListener('pointerdown',e=>{ if(e.target.closest('button')) return; PK.drag={x:e.clientX,p:PK.pos,id:e.pointerId,moved:false}; try{ sc.setPointerCapture(e.pointerId); }catch(_){} });
  sc.addEventListener('pointermove',e=>{ if(!PK.drag) return; const dx=e.clientX-PK.drag.x; if(Math.abs(dx)>8) PK.drag.moved=true; });
  const end=e=>{ if(!PK.drag) return; const d=PK.drag; PK.drag=null; const dx=(e&&e.clientX!=null?e.clientX:d.x)-d.x;
    if(d.moved&&Math.abs(dx)>30){ pkSetIdx(PK.idx+(dx<0?1:-1)); return; }
    if(e&&e.clientX!=null&&PK.hits){ let best=null,bd=1e9; for(const h of PK.hits){ if(e.clientY<h.y0-20||e.clientY>h.y1+20) continue; const dd=Math.abs(e.clientX-h.x); if(dd<bd&&dd<h.w){ bd=dd; best=h; } } if(best) pkSetIdx(best.k); } };
  sc.addEventListener('pointerup',end); sc.addEventListener('pointercancel',end);
  $('pkInfo').addEventListener('click',ev=>{ const b=ev.target.closest('[data-pks]'); if(!b) return; PK.sel[PK_IDS()[PK.idx]]=+b.dataset.pks; pkRender(); });
  $('pkPrev').onclick=()=>pkSetIdx(PK.idx-1); $('pkNext').onclick=()=>pkSetIdx(PK.idx+1);
  $('pkClose').onclick=closePicker;
  $('pkGo').onclick=()=>{ const id=PK_IDS()[PK.idx]; S.picked=true; if(id!==S.hero) switchHero(id); else save(); closePicker(); };
  document.addEventListener('keydown',e=>{ if(!PK.open) return; if(e.key==='ArrowLeft') pkSetIdx(PK.idx-1); else if(e.key==='ArrowRight') pkSetIdx(PK.idx+1); else if(e.key==='Escape'&&!PK.first) closePicker(); });
})();
