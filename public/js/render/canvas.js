/* ---------- canvas & layers ---------- */
const cv=$('cv'), ctx=cv.getContext('2d');
let WH=296, GY=206; const TW=480;
let k=1, WW=400, HX=80, DPR=1;
let layers=null, layerTheme=null;

function seeded(seed){ return ()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }; }
function makeLayer(){ const c=document.createElement('canvas'); c.width=TW; c.height=WH; return c; }
function genLayers(th){
  const r=seeded(th.name.length*7919+13);
  const sky=document.createElement('canvas'); sky.width=64; sky.height=WH;
  let x=sky.getContext('2d'); const g=x.createLinearGradient(0,0,0,GY);
  g.addColorStop(0,th.sky[0]); g.addColorStop(.6,th.sky[1]); g.addColorStop(1,th.sky[2]);
  x.fillStyle=g; x.fillRect(0,0,64,WH);
  const stars=makeLayer(); x=stars.getContext('2d');
  for(let i=0;i<70;i++){ x.fillStyle=`rgba(255,240,230,${(0.2+r()*0.6).toFixed(2)})`; x.fillRect(Math.floor(r()*TW),Math.floor(r()*Math.max(60,GY-100)),1,1); }
  const far=makeLayer(); x=far.getContext('2d');
  const p1=r()*6,p2=r()*6,p3=r()*6;
  for(let i=0;i<TW;i++){
    const t=i/TW*Math.PI*2;
    const tall=Math.max(1,GY/210); const yy=Math.round(GY-86*tall+(Math.sin(t*2+p1)*20+Math.sin(t*5+p2)*10+Math.sin(t*11+p3)*4)*tall);
    x.fillStyle=th.far; x.fillRect(i,yy,1,WH-yy);
    x.fillStyle=th.far2; x.fillRect(i,yy,1,2);
  }
  const mid=makeLayer(); x=mid.getContext('2d'); x.fillStyle=th.mid;
  const draw=(fn)=>{ for(let i=0;i<14;i++){ const px=Math.floor(r()*TW), s=r(); fn(px,s); fn(px-TW,s); fn(px+TW,s);} };
  x.fillRect(0,GY-14,TW,WH);
  if(th.kind==='pines') draw((px,s)=>{ const h=(50+s*55)*Math.max(1,GY/240), w=16+s*16; for(let y=0;y<h;y++){ const ww=Math.round(w*(y/h)*(0.75+0.25*((y%9)/9))); x.fillRect(px-ww/2|0,GY-14-h+y,ww,1);} x.fillRect(px-2,GY-16,4,4); });
  if(th.kind==='dead') draw((px,s)=>{ const h=40+s*50; x.fillRect(px,GY-14-h,3,h); for(let b=0;b<4;b++){ const by=GY-14-h+8+b*10, d=b%2?1:-1, L=8+s*10; for(let j=0;j<L;j++) x.fillRect(px+1+d*j,by-(j>>1),2,2);} });
  if(th.kind==='ruins') draw((px,s)=>{ const h=30+s*60, w=10+s*8; x.fillRect(px,GY-14-h,w,h); x.fillRect(px-3,GY-14-h,w+6,4); if(s>.5){ x.fillRect(px+w,GY-14-h+6,26,5); x.fillRect(px+w+20,GY-14-h+6,w,h-6);} });
  if(th.kind==='shards') draw((px,s)=>{ const h=30+s*70, w=6+s*10; for(let y=0;y<h;y++){ const ww=Math.max(1,Math.round(w*(y/h))); x.fillRect(px-(ww>>1),GY-14-h+y,ww,1);} });
  const gr=makeLayer(); x=gr.getContext('2d');
  x.fillStyle=th.ground; x.fillRect(0,GY,TW,WH-GY);
  x.fillStyle=th.lip; x.fillRect(0,GY,TW,3);
  for(let i=0;i<TW;i+=2){ if(r()<.35){ x.fillRect(i,GY-1-Math.floor(r()*3),1,3);} }
  x.fillStyle=th.stone;
  for(let i=0;i<90;i++){ const sx=Math.floor(r()*TW), sy=GY+6+Math.floor(r()*(WH-GY-8)), w=2+Math.floor(r()*6); x.fillRect(sx,sy,w,2); }
  x.fillStyle='rgba(255,255,255,.04)';
  for(let i=0;i<40;i++){ x.fillRect(Math.floor(r()*TW),GY+4+Math.floor(r()*40),1,1); }
  const clouds=makeLayer(); x=clouds.getContext('2d');
  for(let i=0;i<7;i++){ const cx=r()*TW, cy=20+r()*Math.max(30,GY-150), cw=40+r()*70, ch=6+r()*8;
    for(const dx of [0,-TW,TW]){ for(let j=0;j<5;j++){ const ex=cx+dx+(j-2)*cw*0.22, ey=cy-Math.sin(j/4*Math.PI)*ch*0.8, rx=cw*0.28, ry=ch*(0.6+0.4*Math.sin(j/4*Math.PI));
      for(let yy=-ry;yy<=ry;yy++){ const hw=Math.round(rx*Math.sqrt(Math.max(0,1-(yy/ry)**2))); x.fillStyle=yy<-ry*0.4?th.far2:th.far; x.globalAlpha=0.55; x.fillRect(Math.round(ex-hw),Math.round(ey+yy),hw*2,1); } } } }
  x.globalAlpha=1;
  const props=[]; const pk=AMB[THEMES.indexOf(th)]||AMB[0];
  for(let i=0;i<16;i++) props.push({x:r()*TW,y:GY+(r()<0.55?0:6+r()*Math.max(8,WH-GY-30)),s:1.1+r()*0.9,ph:r()*7,k:pk.props});
  const grass=[]; for(let i=0;i<TW;i+=3+Math.floor(r()*4)) grass.push({x:i,h:2+r()*4,ph:r()*7,c:r()<.5});
  return {sky,stars,far,mid,gr,th,clouds,props,grass};
}

function resize(){
  const el=$('stage'); DPR=Math.min(window.devicePixelRatio||1,2);
  if(el.clientHeight<20||el.clientWidth<20) return;
  cv.width=Math.round(el.clientWidth*DPR); cv.height=Math.round(el.clientHeight*DPR);
  k=cv.width/250; if(cv.height/k<250) k=cv.height/250;
  WH=cv.height/k; WW=cv.width/k;
  const ctl=document.querySelector('.controls'); const ch=ctl?ctl.offsetHeight+18:86;
  GY=Math.round(WH-Math.max(64,Math.min(WH*0.45,(Math.max(86,ch)*DPR)/k)));
  layers=null; HX=Math.max(64,Math.min(WW*0.2,120));
}
try{ new ResizeObserver(resize).observe($('stage')); }catch(e){} window.addEventListener('resize',resize);
