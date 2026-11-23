function hitEnemy(e,base,opts={}){
  if(!e||e.dead) return;
  let d=base; const crit=Math.random()<st.crit(); if(crit) d*=st.critM();
  e.hp-=d; e.flash=0.12; e.sq=0.28; e.x+=opts.knock||1.5; SND.play('hit',crit,!!opts.big||e.boss);
  const ls=pv('ls'); if(ls && !hero.dead) hero.hp=Math.min(st.maxHp(),hero.hp+d*ls/100);
  floats.push({x:e.x+rnd(-8,8),y:enemyTop(e)-6,text:fmt(d),col:crit?'#f3b94a':'#ffffff',size:crit?15:11,life:0.9,vy:-38});
  for(let i=0;i<(opts.big?12:5);i++) parts.push({x:e.x-6,y:enemyY(e)-8*e.scale,vx:rnd(-20,70),vy:rnd(-90,10),life:rnd(.3,.6),max:.6,col:opts.col||HD.part,s:rnd(1,2.5),g:220});
  if(e.hp<=0) killEnemy(e);
}
function killEnemy(e){
  if(e.dead) return;
  e.dead=true; e.dt=0.6; SND.play('kill',e.boss); SND.play('coin'); { const P=prof(); P.k++; if(e.boss) P.b++; }
  { const cols=monColors(e.type), n=e.boss?34:14, ty=enemyY(e)-8*e.scale;
    for(let i=0;i<n;i++) parts.push({x:e.x+rnd(-6,6)*e.scale*0.6,y:ty+rnd(-6,6)*e.scale*0.6,vx:rnd(-40,90),vy:rnd(-150,-40),life:rnd(.5,1.1),max:1.1,col:cols[Math.floor(Math.random()*cols.length)],s:rnd(1.2,2.4),g:360,bounce:true});
    for(let i=0;i<6;i++) parts.push({x:e.x+rnd(-8,8),y:GY-1,vx:rnd(-30,30),vy:rnd(-25,-5),life:.5,max:.5,col:'rgba(210,200,220,.45)',s:2.5,g:0}); }
  const g=e.gold*st.goldM(); S.gold+=g; prof().g+=g;
  floats.push({x:e.x,y:enemyTop(e)-18,text:'+'+fmt(g),col:'#f3b94a',size:12,life:1.1,vy:-26});
  for(let i=0;i<(e.boss?26:7);i++) parts.push({x:e.x,y:enemyY(e)-10,vx:rnd(-50,50),vy:rnd(-140,-60),life:rnd(.6,1),max:1,col:'#f3b94a',s:2,g:320,bounce:true});
  addXp(e.xp);
  dropLoot(e);
  if(e.boss){
    S.wave=0; bossT=0; const z=S.zone;
    SND.play('win'); if(z>=S.best){ S.best=z+1; banner(T('Босс повержен'),`${T("Зона")} ${z+1} ${T("открыта")}`,2.2); } else banner(T('Босс повержен'),locOf(z).bossName,1.6);
    if(Math.random()<0.25){ const P=POTS[Math.floor(Math.random()*POTS.length)]; const s=potSt(); s.own[P.id]=(s.own[P.id]||0)+1; floats.push({x:e.x,y:enemyTop(e)-40,text:P.name,col:P.col,size:11,life:1.6,vy:-18}); }
    hero.hp=st.maxHp(); save(); renderPanel();
  } else S.wave++;
}
function addXp(x){
  x*=(1+petB('xp')/100)*potM('xp'); S.xp+=x; let up=false;
  while(S.xp>=xpNeed(S.lvl)){ S.xp-=xpNeed(S.lvl); S.lvl++; up=true; }
  if(up){ SND.play('level'); hero.hp=st.maxHp(); banner(`${T("Уровень")} ${S.lvl}`, SK.some(s=>s.unlock===S.lvl)?T('Новое умение открыто'):'', 1.4); buildSkillButtons(); renderPanel();
    for(let i=0;i<20;i++) parts.push({x:HX+rnd(-14,14),y:GY-rnd(0,32),vx:rnd(-10,10),vy:rnd(-80,-30),life:rnd(.6,1),max:1,col:'#efe3da',s:1.5,g:0}); }
}
function heroHurt(dmg){
  if(hero.dead) return;
  if(buff.guard>0){ SND.play('block'); floats.push({x:HX,y:GY-50,text:T('блок'),col:'#f3b94a',size:10,life:.7,vy:-30}); for(let i=0;i<5;i++) parts.push({x:HX+14,y:GY-22+rnd(-6,6),vx:rnd(20,60),vy:rnd(-40,20),life:.3,max:.3,col:'#ffd27a',s:1.5,g:0}); return; }
  if(Math.random()<pv('dodge')/100){ floats.push({x:HX,y:GY-50,text:T('уклон'),col:'#8fd8ff',size:10,life:.7,vy:-30}); return; }
  if(buff.shield>0){ const a=Math.min(buff.shield,dmg); buff.shield-=a; dmg-=a; if(dmg<=0){ floats.push({x:HX,y:GY-50,text:T('щит'),col:'#c46bff',size:10,life:.6,vy:-30}); return; } }
  dmg*=(1-HB().def)*(potOn('def')?0.8:1); hero.hp-=dmg; hero.flash=0.15; SND.play('hurt');
  if(FR.hurt && hero.state==='idle' && hero.hp>0){ hero.state='hurt'; hero.hits=[]; hero.hi=0; setAnim('hurt',{dur:0.35}); }
  floats.push({x:HX-4,y:GY-44,text:'-'+fmt(dmg),col:'#ff5a6e',size:11,life:.8,vy:-30});
  if(hero.hp<=0){ hero.hp=0; hero.dead=true; hero.deadT=3; arrows=[]; rains=[]; setState('dead'); SND.play('die'); banner(T('Герой пал'),T('Улучши защиту и урон'),2.4); }
}

const staff=()=>({x:HX+HD.muzzle[0]*hpx(),y:GY-HD.muzzle[1]*hpx()});
function shoot(target,dmg,{dy=0,big=false,delay=0,pierce=false}={}){
  const b=staff(); SND.play(HD.proj==='arrow'?'arrow':HD.proj==='knife'?'knife':'bolt');
  arrows.push({x:b.x,y:b.y+dy,target,dmg,big,delay,pierce,hit:new Set(),kind:HD.proj,vx:HD.proj==='bullet'?(pierce?520:640):HD.proj==='arrow'?(big?480:560):HD.proj==='knife'?540:360,trail:[]});
}
function impact(x,y,big){ fxs.push({x,y,t:0,big});
  rings.push({x,y,t:0,dur:big?0.32:0.22,r:big?16:10,col:HD.part});
  for(let i=0;i<(big?10:6);i++){ const a=rnd(-1.2,1.2), v=rnd(90,190); parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,life:rnd(.15,.3),max:.3,col:i%2?'#ffffff':HD.part,s:1,g:200,ln:true}); } }
function quake(x,big){ SND.play('quake'); rings.push({x,y:GY,t:0,dur:0.45,r:big?70:45,col:'#fff2d0',ground:true}); rings.push({x,y:GY,t:-0.08,dur:0.45,r:big?50:32,col:HD.part,ground:true});
  for(let i=0;i<(big?22:12);i++) parts.push({x:x+rnd(-30,30),y:GY-1,vx:rnd(-40,40),vy:rnd(-110,-30),life:rnd(.4,.8),max:.8,col:i%3?'#8a7a6a':'#c8b8a0',s:rnd(1.5,2.5),g:300,bounce:true}); }
let skQ=null;
function manualCast(i){ const sk=SK[i], b=$('sk'+i); if(!sk||hero.dead) return;
  const deny=()=>{ if(!b) return; b.classList.remove('deny'); void b.offsetWidth; b.classList.add('deny'); };
  if(S.lvl<sk.unlock||!isL(S.hero,'a'+i)||skCd[i]>0){ deny(); return; }
  if(hero.state==='atk'||hero.state==='hurt') setState('idle');
  if(!castSkill(i)) skQ={i,t:2};
}
function castSkill(i){
  const sk=SK[i];
  if(hero.dead || S.lvl<sk.unlock || !isL(S.hero,'a'+i) || skCd[i]>0 || busy()) return false;
  const f=front(); if(!f || f.x>HX+range()) return false;
  skCd[i]=sk.cd*(1-pv('cdr')/100); hero.state='skill'; hero.cast=i; hero.hits=sk.hits||[sk.hitAt]; hero.hi=0;
  setAnim(sk.anim,{dur:sk.dur}); SND.play('cast',S.hero);
  return true;
}
function startAttack(){
  const aps=st.aps();
  hero.state='atk'; hero.hits=HD.atkHits||[HD.atkHit]; hero.hi=0; hero.cast=-1;
  setAnim('atk',{dur:Math.min(HD.atkDur,1.2/aps)}); hero.cd=1/aps;
}
function melee(e,mult,opts={}){ if(!e||e.dead) return; SND.play(opts.big?'heavy':'swing'); hitEnemy(e,st.atk()*mult,Object.assign({knock:3,col:HD.part},opts)); impact(e.x-2,enemyY(e)-7*e.scale+rnd(-3,3),opts.big); hitStop=Math.max(hitStop,opts.big?0.07:0.04); shake=Math.max(shake,opts.big?3:1.2); }
function onRelease(){
  const f=front();
  if(hero.state==='atk' && hero.cast===-1){
    if(HD.melee){ if(f && f.x<=HX+range()+6) melee(f,1); return; }
    if(f) shoot(f,st.atk()); return; }
  const lv=S.sk[hero.cast];
  if(S.hero==='tank'){
    if(hero.cast===0){ if(f){ melee(f,(300+lv*50)/100,{big:true,knock:22}); shake=4; quake(f.x-6,false); } }
    else if(hero.cast===1){ shake=7; quake(HX+30,true); for(const e of alive()){ melee(e,(260+lv*45)/100,{big:true,knock:6}); } for(let i=0;i<26;i++) parts.push({x:HX+rnd(10,90),y:GY-1,vx:rnd(-20,40),vy:rnd(-90,-30),life:rnd(.4,.8),max:.8,col:i%2?'#c8b8a0':'#ffd27a',s:2,g:260,bounce:true}); }
    else if(hero.cast===2){ buff.shield=st.maxHp()*(40+lv*6)/100; buff.shieldT=8; for(let i=0;i<24;i++) parts.push({x:HX+rnd(-14,14),y:GY-rnd(0,36),vx:rnd(-15,15),vy:rnd(-60,-15),life:rnd(.5,.9),max:.9,col:i%2?'#8ca8d8':'#ffffff',s:1.5,g:0}); }
    else if(hero.cast===3){ const m=(170+lv*30)/100; for(const e of alive()) if(e.x<HX+90) melee(e,m,{knock:4}); shake=3; }
    else if(hero.cast===4){ buff.guard=3+lv*0.5; const mh=st.maxHp(), hl=mh*(20+lv*3)/100; hero.hp=Math.min(mh,hero.hp+hl); floats.push({x:HX,y:GY-50,text:'+'+fmt(hl),col:'#5fd39b',size:12,life:1,vy:-30}); for(let i=0;i<20;i++) parts.push({x:HX+rnd(-10,14),y:GY-rnd(0,40),vx:rnd(-20,20),vy:rnd(-50,-10),life:.6,max:.6,col:i%2?'#ffd27a':'#5fd39b',s:1.5,g:0}); }
    return;
  }
  if(S.hero==='asn'){
    if(hero.cast===0){ if(f) melee(f,(190+lv*30)/100); }
    else if(hero.cast===1){ shake=3; for(const e of alive()) if(e.x<HX+120) melee(e,(420+lv*75)/100,{big:true,col:'#c87aff'}); for(let i=0;i<18;i++) parts.push({x:HX+rnd(0,60),y:GY-rnd(4,30),vx:rnd(-60,-20),vy:rnd(-10,10),life:.4,max:.4,col:i%2?'#55407e':'#c87aff',s:2,g:0}); }
    else if(hero.cast===2){ buff.power=5+lv*0.5; for(let i=0;i<24;i++) parts.push({x:HX+rnd(-12,12),y:GY-rnd(0,34),vx:rnd(-15,15),vy:rnd(-70,-20),life:rnd(.4,.8),max:.8,col:i%2?'#7af0a8':'#2a8a5a',s:1.5,g:0}); }
    else if(hero.cast===3){ const m=(230+lv*40)/100; alive().forEach((e,n)=>shoot(e,st.atk()*m,{delay:n*0.06,dy:(n%3-1)*2})); }
    else if(hero.cast===4){ const list=alive(); const e=list[Math.floor(Math.random()*list.length)]; if(e) melee(e,(150+lv*25)/100,{big:true}); }
    return;
  }
  if(S.hero==='sam'){
    if(hero.cast===0){ const tg=front()||f; if(tg) shoot(tg,st.atk()*(260+lv*45)/100,{big:true}); shake=3; }
    else if(hero.cast===1){ buff.guard=3+lv*0.5; for(let i=0;i<14;i++) parts.push({x:HX+rnd(-10,14),y:GY-rnd(0,40),vx:rnd(-20,20),vy:rnd(-50,-10),life:.5,max:.5,col:'#ffd27a',s:1.5,g:0}); }
    else if(hero.cast===2){ const m=(150+lv*25)/100, list=alive(); list.slice(0,4).forEach((e,n)=>fxs.push({x:e.x,y:GY,t:-n*0.08,kind:'shower',dur:1.1})); for(let n=0;n<8;n++){ setTimeout(()=>{ const l2=alive(); const tg=l2[n%Math.max(1,l2.length)]; if(tg&&!hero.dead){ hitEnemy(tg,st.atk()*m,{knock:2,col:HD.part}); impact(tg.x+rnd(-4,4),enemyY(tg)-6*tg.scale,false); } },550+n*70); } }
    else if(hero.cast===3){ const m=(600+lv*100)/100; for(const e of alive()){ hitEnemy(e,st.atk()*m,{big:true,knock:8,col:HD.part}); impact(e.x,enemyY(e)-8*e.scale,true); } hitStop=Math.max(hitStop,0.08); shake=5; }
    else if(hero.cast===4){ const mh=st.maxHp(); hero.hp=Math.min(mh,hero.hp+mh*(30+lv*3)/100); buff.power=4; floats.push({x:HX,y:GY-50,text:'+'+fmt(mh*(30+lv*3)/100),col:'#5fd39b',size:12,life:1,vy:-30}); for(let i=0;i<24;i++) parts.push({x:HX+rnd(-12,12),y:GY-rnd(0,40),vx:rnd(-15,15),vy:rnd(-70,-20),life:rnd(.5,.9),max:.9,col:i%2?'#5fd39b':'#ffd27a',s:1.5,g:0}); }
    return;
  }
  if(S.hero==='gun'){
    if(hero.cast===0){ const m=(120+lv*20)/100; for(let n=0;n<5;n++){ const list=alive(); const t=list[n%Math.max(1,list.length)]; if(t) shoot(t,st.atk()*m,{dy:(n%2)*2-1,delay:n*0.08}); } }
    else if(hero.cast===1){ shoot(null,st.atk()*(500+lv*90)/100,{pierce:true,big:true}); shake=4; }
    else if(hero.cast===2){ rains.push({t:0,dur:0.95,ticks:0,n:3,iv:0.3,dmg:st.atk()*(180+lv*30)/100,blast:true,x:HX+60}); }
    else if(hero.cast===3){ const m=(220+lv*40)/100; alive().forEach((e,n)=>shoot(e,st.atk()*m,{delay:n*0.09})); }
    else if(hero.cast===4){ buff.power=5+lv*0.5; for(let i=0;i<20;i++) parts.push({x:HX+rnd(-12,12),y:GY-rnd(0,36),vx:rnd(-15,15),vy:rnd(-70,-20),life:rnd(.4,.8),max:.8,col:i%2?'#ff9a3a':'#ffd2a6',s:1.5,g:0}); }
    return;
  }
  if(hero.cast===0){ shake=6; for(const e of alive()){ hitEnemy(e,st.atk()*(450+lv*80)/100,{big:true}); impact(e.x,enemyY(e)-8*e.scale,true); } }
  else if(hero.cast===1){ const m=(170+lv*25)/100; for(let n=0;n<3;n++){ const list=alive(); const t=list[n%Math.max(1,list.length)]; if(t) shoot(t,st.atk()*m,{dy:(n-1)*6,delay:n*0.12,big:true}); } }
  else if(hero.cast===3){ rains.push({t:0,dur:0.8,ticks:0,n:3,iv:0.25,dmg:st.atk()*(200+lv*35)/100,x:HX+60}); shake=3; }
  else if(hero.cast===4){ buff.shield=st.maxHp()*(30+lv*5)/100; buff.shieldT=8; for(let i=0;i<24;i++) parts.push({x:HX+rnd(-14,14),y:GY-rnd(0,36),vx:rnd(-15,15),vy:rnd(-60,-15),life:rnd(.5,.9),max:.9,col:i%2?'#b44cff':'#e8d0ff',s:1.5,g:0}); }
  else if(hero.cast===2){ buff.power=6+lv*0.5; for(let i=0;i<30;i++) parts.push({x:HX+rnd(-14,14),y:GY-rnd(0,32),vx:rnd(-15,15),vy:rnd(-80,-20),life:rnd(.5,1),max:1,col:i%2?'#b44cff':'#f2d9ff',s:3,g:0}); }
}

function update(dt){
  for(let i=0;i<5;i++) skCd[i]=Math.max(0,skCd[i]-dt);
  buff.power=Math.max(0,buff.power-dt); buff.guard=Math.max(0,buff.guard-dt);
  buff.shieldT=Math.max(0,buff.shieldT-dt); if(!buff.shieldT) buff.shield=0;
  if(!hero.dead && (pv('regen')||petB('regen'))) hero.hp=Math.min(st.maxHp(),hero.hp+st.maxHp()*(pv('regen')+petB('regen'))/100*dt);
  if(buff.guard>0 && Math.random()<dt*10) parts.push({x:HX+rnd(-12,14),y:GY-rnd(0,40),vx:0,vy:-25,life:.5,max:.5,col:'#ffd27a',s:1,g:0});
  updatePet(dt);
  for(const x of fxs){ x.t+=dt; x.x-=runV*dt; } fxs=fxs.filter(x=>x.t<(x.dur||HD.fxDur));
  for(const r of rings){ r.t+=dt; r.x-=runV*dt; } rings=rings.filter(r=>r.t<r.dur);
  if(buff.power>0 && Math.random()<dt*14) parts.push({x:HX+rnd(-12,12),y:GY-rnd(0,40),vx:0,vy:rnd(-60,-30),life:.6,max:.6,col:'#b44cff',s:3,g:0});
  shake=Math.max(0,shake-dt*20); fogT+=dt;
  if(bannerT>0){ bannerT-=dt; if(bannerT<=0) $('banner').classList.remove('show'); }
  const maxHp=st.maxHp(); if(hero.hp>maxHp) hero.hp=maxHp;
  hero.t+=dt; hero.cd-=dt; hero.flash=Math.max(0,hero.flash-dt);

  const f=front();
  const inRange=!!(f && f.x<=HX+range());
  if(hero.dead){
    hero.deadT-=dt;
    if(hero.deadT<=0){ enemies=[]; S.wave=0; bossT=0; hero.hp=maxHp; hero.dead=false; setState('run'); }
  } else if(busy()){
    const hits=hero.hits||[]; while((hero.hi||0)<hits.length && hero.t/hero.dur>=hits[hero.hi]){ onRelease(hero.hi); hero.hi++; }
    if(hero.t>=hero.dur) setState(inRange?'idle':'run');
  } else if(inRange){
    if(hero.state!=='idle') setState('idle');
    let cast=false;
    if(skQ&&castSkill(skQ.i)){ cast=true; skQ=null; }
    if(!cast&&S.auto){ for(const i of [4,2,3,0,1]){ if(!SK[i]) continue; if(SK[i].when && !SK[i].when()) continue; if(castSkill(i)){cast=true;break;} } }
    if(!cast && hero.cd<=0) startAttack();
  } else if(hero.state!=='run') setState('run');
  if(skQ){ skQ.t-=dt; if(skQ.t<=0||hero.dead) skQ=null; }
  if(!hero.dead) hero.hp=Math.min(maxHp,hero.hp+maxHp*(inRange?0.006:0.07)*dt);
  runV=(!hero.dead && hero.state==='run')?HD.speed*potM('run'):0;
  scroll+=runV*dt;

  for(const e of enemies){
    e.x-=runV*dt; e.bob+=dt*(MON[e.type].mv==='fly'?5:3); e.flash=Math.max(0,e.flash-dt);
    e.sq=Math.max(0,(e.sq||0)-dt*2.2); e.bl=(e.bl==null?2:e.bl)-dt; if(e.bl<-0.13) e.bl=rnd(1.8,4.5);
    if(e.dead){ e.dt-=dt; continue; }
    const stopX=HX+18+(enemies.filter(o=>!o.dead&&o.x<e.x).length)*12;
    e.mov=false;
    if(!runV && e.x>stopX && e.x<WW+20){ e.x=Math.max(stopX,e.x-e.spd*dt); e.mov=true; }
    const mvk=MON[e.type].mv;
    if((e.mov||runV>0) && (mvk==='walk'||mvk==='hop') && e.x<WW && Math.random()<dt*(e.boss?7:3.5))
      parts.push({x:e.x+rnd(-4,6)*e.scale*0.5,y:GY-1,vx:rnd(5,25),vy:rnd(-14,-4),life:rnd(.3,.5),max:.5,col:'rgba(200,190,215,.35)',s:e.boss?3:2,g:0});
    if(e.boss && e.mov && Math.random()<dt*1.2) shake=Math.max(shake,1.2);
    if(e.x<=HX+24+ (e.boss?12:0) && !hero.dead){
      e.atkT-=dt;
      if(e.atkT<=0){ e.atkT=e.boss?1.25:1.5; e.lunge=0.18; e.sq=-0.18; heroHurt(e.dmg); }
    }
    if(e.lunge) e.lunge=Math.max(0,e.lunge-dt);
  }
  enemies=enemies.filter(e=>!(e.dead&&e.dt<=0) && e.x>-80);
  if(!enemies.length && !hero.dead) spawnPack();

  for(const a of arrows){
    if(a.delay>0){ a.delay-=dt; continue; }
    a.x+=(a.vx-runV)*dt;
    a.trail.unshift({x:a.x,y:a.y}); if(a.trail.length>6) a.trail.pop();
    for(const p of a.trail) p.x-=runV*dt;
    if(a.pierce){ for(const e of enemies) if(!e.dead && !a.hit.has(e) && a.x>=e.x-6){ a.hit.add(e); hitEnemy(e,a.dmg,{big:true,knock:5}); impact(e.x,a.y,true); } if(a.x>WW+40) a.done=true; continue; }
    const t=(a.target && !a.target.dead)?a.target:null;
    if(t){ const ty=enemyY(t)-8*t.scale; a.y+=(ty-a.y)*Math.min(1,dt*7);
      if(a.x>=t.x-6){ hitEnemy(t,a.dmg,a.kind==='pet'?{col:a.col}:{}); if(a.kind!=='pet') impact(t.x,a.y,a.big); a.done=true; } }
    if(a.x>WW+40) a.done=true;
  }
  arrows=arrows.filter(a=>!a.done);
  for(const r of rains){
    r.t+=dt; r.x-=runV*dt;
    const tick=Math.floor(r.t/(r.iv||0.22));
    if(tick<(r.n||6) && tick>=r.ticks){ r.ticks=tick+1; for(const e of alive()){ hitEnemy(e,r.dmg); impact(e.x+rnd(-4,4),enemyY(e)-8*e.scale+rnd(-4,4),true); } shake=Math.max(shake,3.5); }
  }
  rains=rains.filter(r=>r.t<r.dur);

  if(bossT>0 && !hero.dead){
    bossT-=dt;
    if(bossT<=0){ bossT=0; enemies=[]; S.wave=0; banner(T('Время вышло'),T('Босс сбежал. Попробуй снова'),2); }
  }
  for(const p of parts){ p.life-=dt; p.vy+=(p.g||0)*dt; p.x+=(p.vx-runV)*dt; p.y+=p.vy*dt;
    if(p.streak&&p.y>GY-2){ p.life=0; parts.push({x:p.x,y:GY-2,vx:rnd(-30,30),vy:rnd(-60,-20),life:.25,max:.25,col:'#e3a6ff',s:2,g:200}); }
    if(p.bounce&&p.y>GY){p.y=GY;p.vy*=-0.4;p.vx*=0.6;} }
  parts=parts.filter(p=>p.life>0);
  for(const t of floats){ t.life-=dt; t.y+=t.vy*dt; t.vy*=0.96; }
  floats=floats.filter(t=>t.life>0);
}
