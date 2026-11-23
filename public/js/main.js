/* ---------- loop & boot ---------- */
let last=0, hudAcc=0, panelAcc=0, saveAcc=0, errCount=0;
function loop(now){
  requestAnimationFrame(loop);
  let dt=(now-last)/1000; last=now;
  if(!(dt>=0)) dt=0;
  if(dt>8){ offlineReward(dt); dt=0; }
  dt=Math.min(dt,0.1);
  if(typeof S!=='undefined'&&S&&!document.hidden) prof().t+=dt;
  try{
    if(cv.height<20||cv.width<20) resize();
    let sdt=dt; if(hitStop>0){ hitStop-=dt; sdt*=0.12; }
    update(sdt*(S.fast?2:1));
    if(cv.height>=20 && cv.width>=20) draw();
    hudAcc+=dt; panelAcc+=dt; saveAcc+=dt;
    if(hudAcc>0.08){hudAcc=0;hud();}
    if(panelAcc>0.3){panelAcc=0;panelTick();}
    if(saveAcc>5){saveAcc=0;save();}
  }catch(e){ if(errCount++<3){ console.error(e); showErr(e);} }
}
document.addEventListener('visibilitychange',()=>{ if(document.hidden) save(true); });
window.addEventListener('pagehide',()=>save(true));


function sndBtnSync(){}
$('shopBtn').addEventListener('click',e=>{ e.stopPropagation(); S.tab='shop'; $('list').scrollTop=0; setSheet(true); });
document.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.disabled||b.closest('.buy,[data-potbuy],[data-potdrink],.sk')) return; SND.play('click'); },true);

function start(data){
  STONE_ICON=pixIcon(STONE_MAP,'#3a8aff','#7af0ff').replace(/^/,''); $('stoneIco').src=STONE_ICON;
  loadState(data);
  $('pic').style.backgroundImage=`url(${HUDP[S.hero]})`;
  $('hname').textContent=displayName(); $('hname').hidden=!displayName();
  hero.hp=st.maxHp();
  resize(); syncToggles(); buildSkillButtons(); setSheet(false);
  if(!(data&&data.S) && S.last) offlineReward((Date.now()-S.last)/1000);
  if(!S.picked) openPicker(true);
  if(typeof sndBtnSync==='function') sndBtnSync(); if(typeof SND!=='undefined') SND.apply();
  last=performance.now(); requestAnimationFrame(loop);
  chatStart();
}
try{ window.claude?.hot?.snapshot?.(()=>({S})); }catch(e){}
let started=false;
async function boot(){ if(started) return; started=true;
  let data={}; try{ data=(window.claude&&window.claude.hot&&window.claude.hot.data)||{}; }catch(e){}
  await login();
  const saved=await fetchSave();
  LOAD.set(88,'Призываем героя…');
  await new Promise(r=>{ if(imgReady) r(); else { img.addEventListener('load',r); img.addEventListener('error',r); } });
  try{ start(Object.assign({},data,{saved})); }catch(e){ showErr(e); }
  LOAD.done();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
