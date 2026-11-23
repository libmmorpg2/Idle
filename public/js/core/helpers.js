let FR=FRS.mage;
/* ---------- helpers ---------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd=(a,b)=>a+Math.random()*(b-a);
const SUF=['K','M','B','T','aa','ab','ac','ad','ae','af','ag','ah'];
function fmt(n){
  if(!isFinite(n)) return '∞';
  if(n<100000) return n<10 && n%1 ? n.toFixed(1).replace(/\.0$/,'') : String(Math.floor(n));
  let i=-1; while(n>=1000 && i<SUF.length-1){n/=1000;i++}
  return (n<10?n.toFixed(2):n<100?n.toFixed(1):Math.floor(n))+SUF[i];
}
function showErr(e){ const b=$('err'); if(!b) return; b.hidden=false; b.textContent='Ошибка: '+(e&&e.message||e); }
