/* ---------- бестиарий ----------
   Спрайты монстров — 0x72 «16x16 DungeonTileset II» (CC0), кадры в js/data/monsters.js.
   Спрайты смотрят ВПРАВО (при отрисовке разворачиваются к герою).
   mv: walk — идёт, hop — прыгает, float — парит; big — крупный (боссы), k — масштаб отрисовки;
   tint/hue — перекраска для разных локаций. */
const MON={
 // Сумрачный лес
 goblin:{name:'Лесной гоблин',src:'goblin'},
 slug:{name:'Слизень',src:'slug'},
 tiny_slug:{name:'Слизнёнок',src:'tiny_slug'},
 muddy:{name:'Грязевик',src:'muddy',mv:'hop'},
 pumpkin:{name:'Тыквоголовый',src:'pumpkin_dude'},
 ogre:{name:'Лесной огр',src:'ogre',big:true},
 // Пепельные равнины
 skelet:{name:'Скелет',src:'skelet'},
 zombie:{name:'Упырь',src:'zombie'},
 tiny_zombie:{name:'Мертвячок',src:'tiny_zombie'},
 necromancer:{name:'Некромант',src:'necromancer',mv:'float'},
 imp:{name:'Огненный бес',src:'imp'},
 chort:{name:'Чёрт',src:'chort'},
 big_zombie:{name:'Гниющий великан',src:'big_zombie',big:true},
 // Лунные руины
 ice_zombie:{name:'Ледяной мертвец',src:'ice_zombie'},
 moon_skelet:{name:'Лунный скелет',src:'skelet',tint:'#7fb0ff',amt:.45},
 masked_orc:{name:'Орк в маске',src:'masked_orc'},
 orc_warrior:{name:'Орк-воин',src:'orc_warrior'},
 orc_shaman:{name:'Орк-шаман',src:'orc_shaman'},
 ice_ogre:{name:'Хранитель руин',src:'ogre',tint:'#8fc8ff',amt:.5,big:true},
 // Пустошь теней
 wogol:{name:'Вогол',src:'wogol'},
 shadow_imp:{name:'Бес бездны',src:'imp',hue:270},
 shadow_chort:{name:'Теневой чёрт',src:'chort',hue:250},
 dark_priest:{name:'Тёмный жрец',src:'necromancer',mv:'float',tint:'#5a3a8a',amt:.45},
 shadow_orc:{name:'Орк-тень',src:'masked_orc',tint:'#6a4aa0',amt:.5},
 shadow_demon:{name:'Повелитель теней',src:'big_demon',hue:265,big:true},
 // Кровавые топи
 swampy:{name:'Болотник',src:'swampy',mv:'hop'},
 leech:{name:'Кровавая пиявка',src:'slug',tint:'#d03a3a',amt:.5},
 bog_goblin:{name:'Болотный гоблин',src:'goblin',tint:'#8a9a2a',amt:.35},
 drowned:{name:'Утопленник',src:'zombie',tint:'#3a7a7a',amt:.4},
 bog_shaman:{name:'Шаман топей',src:'orc_shaman',tint:'#9a2a2a',amt:.35},
 big_demon:{name:'Демон топей',src:'big_demon',big:true},
};
for(const id in MON){ const m=MON[id]; m.mv=m.mv||'walk'; m.k=m.k||(m.big?.62:1); }

const monImg=new Image(); let monReady=false;
const monLoad=new Promise(r=>{ monImg.onload=()=>{ monReady=true; r(); }; monImg.onerror=()=>r(); });
monImg.src=MON_ATLAS;
const sprCache={};
const monFr=(type,anim)=>{ const F=MON_FR[(MON[type]||MON.goblin).src]; return F[anim]||F.idle; };
// размер монстра в «пикселях игры» (кадр × масштаб k)
function monSize(type){ const m=MON[type]||MON.goblin, f=monFr(type,'idle')[0]; return {w:f[2]*m.k,h:f[3]*m.k}; }
function hexMix(a,b,t){ const p=h=>{ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); };
  const A=p(a),B=p(b); return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join(''); }
function recolor(g,w,h,m){   // перекраска кадра: сдвиг оттенка (hue) или смешивание с цветом (tint)
  const d=g.getImageData(0,0,w,h), a=d.data;
  const T=m.tint&&[1,3,5].map(i=>parseInt(m.tint.slice(i,i+2),16)), amt=m.amt||.4;
  for(let i=0;i<a.length;i+=4){ if(!a[i+3]) continue; let r=a[i],gg=a[i+1],b=a[i+2];
    if(m.hue){ const mx=Math.max(r,gg,b), mn=Math.min(r,gg,b), l=(mx+mn)/510, dd=(mx-mn)/255;
      if(dd>0.04){ let hh=mx===r?((gg-b)/255/dd)%6:mx===gg?(b-r)/255/dd+2:(r-gg)/255/dd+4; hh=(hh*60+m.hue+360)%360;
        const sat=dd/(1-Math.abs(2*l-1)||1), C=(1-Math.abs(2*l-1))*sat, X=C*(1-Math.abs(hh/60%2-1)), M=l-C/2;
        const [r1,g1,b1]=hh<60?[C,X,0]:hh<120?[X,C,0]:hh<180?[0,C,X]:hh<240?[0,X,C]:hh<300?[X,0,C]:[C,0,X];
        r=(r1+M)*255; gg=(g1+M)*255; b=(b1+M)*255; } }
    if(T){ const lum=(r*.3+gg*.59+b*.11)/255; r=r+(T[0]*lum*1.4-r)*amt; gg=gg+(T[1]*lum*1.4-gg)*amt; b=b+(T[2]*lum*1.4-b)*amt; }
    a[i]=Math.max(0,Math.min(255,r)); a[i+1]=Math.max(0,Math.min(255,gg)); a[i+2]=Math.max(0,Math.min(255,b)); }
  g.putImageData(d,0,0);
}
// кадр монстра: anim — 'idle' | 'run', frame — номер кадра (по кругу), white — белая вспышка при ударе
function enemySprite(type,frame,white,boss,blink,anim){
  if(!MON[type]) type='goblin';
  const F=monFr(type,anim||'idle'), n=((frame|0)%F.length+F.length)%F.length, [x,y,w,h]=F[n];
  const key=type+(anim||'idle')+n+(white?'w':'');
  if(sprCache[key]) return sprCache[key];
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  if(!monReady) return c;   // атлас ещё грузится — пустой кадр, не кэшируем
  const g=c.getContext('2d'); g.drawImage(monImg,x,y,w,h,0,0,w,h);
  const m=MON[type]; if(m.tint||m.hue) recolor(g,w,h,m);
  if(white){ g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,w,h); }
  return sprCache[key]=c;
}
const monColCache={};
function monColors(type){ if(monColCache[type]) return monColCache[type]; if(!monReady) return ['#ffffff'];
  const c=enemySprite(type,0,false,false), d=c.getContext('2d').getImageData(0,0,c.width,c.height).data, out=[];
  for(let i=0;i<d.length;i+=4){ if(d[i+3]<200) continue; const v=d[i]+d[i+1]+d[i+2]; if(v<70) continue; out.push('#'+[d[i],d[i+1],d[i+2]].map(n=>n.toString(16).padStart(2,'0')).join('')); }
  return monColCache[type]=out.length?out:['#ffffff']; }
const monIconCache={};
function monIcon(type,boss){ const k=type+(boss?'B':''); if(monIconCache[k]) return monIconCache[k];
  const u=enemySprite(type,0,false,boss).toDataURL(); if(monReady) monIconCache[k]=u; return u; }
