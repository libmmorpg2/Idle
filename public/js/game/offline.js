/* ---------- offline ---------- */
function offlineReward(sec){
  sec=Math.min(sec,8*3600); if(sec<60) return;
  const z=Math.max(1,S.zone);
  const kills=sec/(eHp(z)/st.dps()+1.4)*0.5;
  const gold=kills*eGold(z)*st.goldM(), xp=kills*eXp(z);
  const ex=kills*stoneChance(z); const stn=Math.floor(ex)+(Math.random()<ex%1?1:0);
  if(gold<1) return;
  const h=Math.floor(sec/3600), m=Math.floor(sec%3600/60);
  const md=$('modal');
  md.innerHTML=`<div class="card"><h2>Пока тебя не было</h2><p>Герой охотился ${h?h+' ч ':''}${m} мин и собрал добычу</p>
  <div class="gain"><span><span class="coin"></span><span style="color:var(--gold)">${fmt(gold)}</span></span><span style="color:var(--xp)">+${fmt(xp)} опыта</span>${stn?`<span style="color:#7af0ff"><img class="stn" src="${STONE_ICON}" alt="">${stn}</span>`:''}</div>
  <button id="takeBtn">Забрать</button></div>`;
  md.hidden=false;
  $('takeBtn').onclick=()=>{ S.gold+=gold; S.stones=(S.stones||0)+stn; addXp(xp); md.hidden=true; renderPanel(); save(); };
}
