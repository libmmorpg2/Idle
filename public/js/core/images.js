/* ---------- images ---------- */
const img=new Image(); let imgReady=false;
img.onload=()=>{ imgReady=true; if(!S) return; buildSkillButtons(); renderPanel(); if(typeof PK!=='undefined'&&PK.open){ pkRender(); } };
img.onerror=()=>showErr(T('не загрузились спрайты героев'));
img.src=ATLAS;
