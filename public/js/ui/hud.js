/* ---------- HUD ---------- */
const hudCache={};
function setT(id,v){ if(hudCache[id]!==v){ hudCache[id]=v; $(id).textContent=v; } }
let lastBM=null;
function bmPop(d){ const el=document.createElement('div'); el.className='bmpop'; el.textContent=T('БМ ▲ +')+fmt(d); $('stage').appendChild(el); setTimeout(()=>el.remove(),1300); }
let potHudSig='';
function potHud(){ const act=POTS.filter(p=>potOn(p.id)); const sig=act.map(p=>p.id+Math.ceil(potLeft(p.id)/60000)).join(',');
  if(sig===potHudSig) return; potHudSig=sig;
  $('potBar').innerHTML=act.map(p=>`<button data-pot="${p.id}" aria-label="${p.name}: ${p.desc}${T(", осталось")} ${fmtMin(potLeft(p.id))}" title="${p.name}: ${p.desc}"><img src="${potIcon(p.col)}" alt=""><small>${Math.ceil(potLeft(p.id)/60000)}${T("м")}</small></button>`).join(''); }
function hud(){
  const bm=calcBM(); setT('dpsS',(T('БМ')+' ')+fmt(bm));
  if(lastBM!=null && bm>lastBM && !hero.dead && !sheetOpen) bmPop(bm-lastBM);
  lastBM=bm;
  const mh=st.maxHp();
  setT('gold',fmt(S.gold)); setT('lvl',String(S.lvl));
  setT('hpt',fmt(hero.hp)+' / '+fmt(mh));
  $('hpb').style.width=(hero.hp/mh*100)+'%';
  $('xpb').style.width=(S.xp/xpNeed(S.lvl)*100)+'%'; setT('xpt',fmt(S.xp)+' / '+fmt(xpNeed(S.lvl)));
  setT('stones',fmt(S.stones||0)); potHud();
  setT('dps',fmt(st.dps())); setT('best',String(S.best));
  $('dot-hero').hidden=!UPG.some(u=>!(u.max!=null&&S.upg[u.id]>=u.max) && S.gold>=upCost(u,S.upg[u.id]) && (S.stones||0)>=stoneCost(S.upg[u.id]));
  const canLearn=[...SK.map((s,i)=>['a'+i,s.unlock]),...PSV[S.hero].map(p=>['p'+p.id,p.unlock])].some(([k,u])=>!isL(S.hero,k)&&bookN(S.hero,k)>0&&S.lvl>=u);
  $('dot-skill').hidden=!(canLearn || SK.some((s,i)=>S.lvl>=s.unlock && isL(S.hero,'a'+i) && S.gold>=skCost(i,S.sk[i]) && bookN(S.hero,'a'+i)>=SK_BOOKS) || PSV[S.hero].some(p=>{ const l=S.psv[S.hero][p.id]||0; return S.lvl>=p.unlock && isL(S.hero,'p'+p.id) && l<p.max && S.gold>=psCost(p,l) && bookN(S.hero,'p'+p.id)>=SK_BOOKS; }));
  if(sheetOpen && S.tab==='bag') drawPreview();
  $('dot-bag').hidden=!(S.inv&&S.inv.bag.some(x=>x.n && x.cls===S.hero));
  const th=themeOf(S.zone);
  const zn=`${th.name} · <em>${S.zone}</em>`;
  if(hudCache.zn!==zn){ hudCache.zn=zn; $('zname').innerHTML=zn; }
  const pk=S.wave+'|'+(bossT>0);
  if(hudCache.pips!==pk){ hudCache.pips=pk;
    let h=''; for(let i=0;i<WAVE;i++) h+=`<i class="${i<S.wave?'on':''}"></i>`;
    h+=`<i class="boss ${bossT>0?'on':''}"></i>`; $('pips').innerHTML=h; }
  $('btimer').hidden=!(bossT>0); if(bossT>0) setT('btimer',(T('Босс ·')+' ')+bossT.toFixed(1)+(' '+T('с')));
  SK.forEach((s,i)=>{
    const b=$('sk'+i); if(!b) return;
    const nl=!isL(S.hero,'a'+i), locked=nl||S.lvl<s.unlock;
    b.classList.toggle('locked',locked);
    b.classList.toggle('ready',!locked&&skCd[i]<=0); b.classList.toggle('queued',!!skQ&&skQ.i===i);
    b.querySelector('.cd').style.setProperty('--p',locked?'100%':(skCd[i]/s.cd*100)+'%');
    b.querySelector('.cdt').textContent=nl?T('КНИГА'):S.lvl<s.unlock?`${T("Ур.")} ${s.unlock}`:(skCd[i]>0?Math.ceil(skCd[i]):'');
  });
}
function frameThumb(canvas,_who,anim,idx){
  const F=(typeof _who==='string'&&FRS[_who])||FR, HH=(typeof _who==='string'&&HEROES[_who])||HD;
  const [fx,fy,fw,fh,ax,bot]=F[anim][idx]; const c2=canvas.getContext('2d');
  canvas.width=64; canvas.height=64; c2.imageSmoothingEnabled=false;
  c2.fillStyle='#160d1f'; c2.fillRect(0,0,64,64);
  const z=HH.tz||2; c2.drawImage(img,fx,fy,fw,fh,Math.round(32-ax*z),Math.round(60-bot*z),fw*z,fh*z);
}
function buildSkillButtons(){
  const wrap=$('skills'); wrap.innerHTML='';
  SK.forEach((s,i)=>{
    const b=document.createElement('button'); b.className='sk'; b.id='sk'+i; b.setAttribute('aria-label',s.name);
    b.innerHTML=`<canvas></canvas><div class="cd"></div><div class="cdt"></div><div class="nm">${s.short}</div>`;
    if(imgReady) frameThumb(b.querySelector('canvas'),0,s.icon[0],s.icon[1]);
    b.onclick=()=>manualCast(i);
    wrap.appendChild(b);
  });
}
