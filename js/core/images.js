/* ---------- images ---------- */
const img=new Image(); let imgReady=false;
img.onload=()=>{ imgReady=true; buildSkillButtons(); renderPanel(); if(typeof PK!=='undefined'&&PK.open){ pkRender(); } };
img.onerror=()=>showErr('не загрузились спрайты героев');
img.src=ATLAS;
