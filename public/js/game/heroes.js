// hero ratings (shown as diamonds on the hero select screen) drive the real base stats:
// [attack, defence, speed, range]; 3 = baseline, each step = ±15% damage/speed, ±20% health, defence above 3 also gives armor

const HERO_RATE={mage:[5,2,3,5],tank:[3,5,2,1],asn:[4,2,5,1],sam:[4,2,4,5]};
const heroBase=id=>{ const r=HERO_RATE[id]||[3,3,3,3]; return {atk:1+(r[0]-3)*0.15,hp:1+(r[1]-3)*0.2,aps:1+(r[2]-3)*0.15,def:Math.max(0,r[1]-3)*0.05}; };
const HB=()=>heroBase(S.hero);
const st={
  atk:()=>(10+S.upg.dmg*2+(S.lvl-1)+eqStat('dmg'))*HB().atk*potM('atk')*(1+pv('dmg')/100)*(1+petB('dmg')/100),
  aps:()=>Math.min(4,HB().aps*potM('aps')*(1+S.upg.spd*0.03)*(1+eqStat('spd')/100)*(1+pv('aps')/100)*(1+petB('aps')/100))*(buff.power>0?2:1),
  maxHp:()=>(100+S.upg.hp*15+(S.lvl-1)*10+eqStat('hp'))*HB().hp*(1+pv('hp')/100)*(1+petB('hp')/100),
  crit:()=>Math.min(0.75,0.05+(potOn('crit')?0.2:0)+S.upg.crit*0.01+eqStat('crit')/100+pv('crit')/100+petB('crit')/100),
  critM:()=>2+S.upg.crit*0.02+pv('cdmg')/100,
  goldM:()=>(1+S.upg.gold*0.05+eqStat('gold')/100)*soulM()*potM('gold')*(1+pv('gold')/100)*(1+petB('gold')/100),
  dps(){ const b=buff.power; buff.power=0; const v=this.atk()*this.aps()*(1+this.crit()*(this.critM()-1)); buff.power=b; return v; }
};
const eHp=z=>Math.round(30+25*(z-1)+0.9*(z-1)*(z-1));
const eDmg=z=>Math.round(3+2*(z-1)+0.05*(z-1)*(z-1));
const eGold=z=>2+(z-1);
const eXp=z=>3+1.5*(z-1);
const xpNeed=l=>Math.round(200*l*Math.pow(1.08,l-1)); // x10 harder, grows ~8% per level
const WAVE=10;

const HEROES={
  mage:{name:'Маг бездны',desc:'Заряды и взрывы бездны',run:11,idle:9,atkHit:0.38,atkDur:0.95,muzzle:[14,22],speed:70,proj:'bolt',dmgWord:'Урон заряда',spdWord:'Заклинаний',fxDur:0.55,death:['#8a3dff','#e3a6ff'],part:'#c46bff',tz:2},
  tank:{name:'Викинг',desc:'Танк: щит, секира и ледяная ярость севера',run:12,idle:8,atkHit:0.3,atkDur:0.6,muzzle:[18,24],speed:62,melee:true,dmgWord:'Урон секиры',spdWord:'Ударов',fxDur:0.3,death:['#5a3a22','#bfe8ff'],part:'#bfe8ff',tz:1.3,sc:0.7,art:1.45},
  asn:{name:'Хранительница клинков',desc:'Убийца: стальные клинки, рывки и танец лезвий',run:14,idle:9,atkHit:0.25,atkDur:0.55,muzzle:[20,28],speed:92,melee:true,proj:'knife',dmgWord:'Урон клинка',spdWord:'Атак',fxDur:0.28,death:['#3a3440','#b02a5a'],part:'#dfe4ee',tz:1.3,sc:0.7,art:1.45},
  sam:{name:'Лесной следопыт',desc:'Эльф-лучник: стрелы, град стрел и луч природы',run:14,idle:10,atkHit:0.56,atkDur:1.0,muzzle:[25,33],speed:88,proj:'arrow',dmgWord:'Урон стрелы',spdWord:'Выстрелов',fxDur:0.35,death:['#1f5a3a','#e8d48a'],part:'#c8f07a',tz:1.3,sc:0.7,art:1.45},
};
let HD=HEROES.mage;
const nm=v=>typeof v==='object'?v[S.hero]:v;
const UPG=[
  {id:'dmg',name:{mage:'Посох бездны',tank:'Секира викинга',asn:'Парные кинжалы',sam:'Длинный лук'},tag:'УРН',base:10,inc:5,info:()=>`${HD.dmgWord} <b>${fmt(st.atk())}</b>`},
  {id:'spd',name:{mage:'Скорость чар',tank:'Боевой ритм',asn:'Быстрые руки',sam:'Натяжение тетивы'},tag:'СКР',base:20,inc:10,max:50,info:()=>`${HD.spdWord} в секунду <b>${(st.aps()).toFixed(2)}</b>`},
  {id:'hp',name:{mage:'Плащ теней',tank:'Латный доспех',asn:'Теневой покров',sam:'Кожаный доспех'},tag:'ЗДР',base:10,inc:5,info:()=>`Здоровье <b>${fmt(st.maxHp())}</b>`},
  {id:'crit',name:{mage:'Знание слабостей',tank:'Сокрушение',asn:'Удар в спину',sam:'Глаз орла'},tag:'КРТ',base:30,inc:15,max:40,info:()=>`Крит <b>${Math.round(st.crit()*100)}%</b> · сила <b>x${st.critM().toFixed(2)}</b>`},
  {id:'gold',name:'Жажда добычи',tag:'ЗЛТ',base:25,inc:10,info:()=>`Золото с врагов <b>x${st.goldM().toFixed(2)}</b>`},
];
const SKS={mage:[
  {name:'Взрыв бездны',short:'ВЗРЫВ',cd:10,unlock:1,anim:'pow',dur:1.0,hitAt:0.52,icon:['pow',9],cost:60,
    info:l=>`Взрыв под каждым врагом: <b>${450+l*80}%</b> урона`},
  {name:'Тройной заряд',short:'ТРИ',cd:12,unlock:3,anim:'atk',dur:0.75,hitAt:0.38,icon:['atk',6],cost:150,
    info:l=>`Три заряда подряд, каждый <b>${170+l*25}%</b> урона`},
  {name:'Сила бездны',short:'СИЛА',cd:26,unlock:6,anim:'pow',dur:1.0,hitAt:0.52,icon:['pow',11],cost:400,
    info:l=>`<b>${(6+l*0.5).toFixed(1)} с</b>: скорость заклинаний x2`},
  {name:'Цепная молния',short:'МОЛНИЯ',cd:16,unlock:10,anim:'pow',dur:1.0,hitAt:0.52,icon:['pow',13],cost:700,
    info:l=>`3 разряда по всем врагам: <b>3 × ${200+l*35}%</b> урона`},
  {name:'Щит бездны',short:'ЩИТ',cd:30,unlock:15,anim:'pow',dur:0.8,hitAt:0.5,icon:['pow',5],cost:1000,
    info:l=>`Щит на <b>${30+l*5}%</b> здоровья, 8 с`},
], tank:[
  {name:'Рубящий удар',short:'РУБКА',cd:9,unlock:1,anim:'heavy',dur:0.7,hitAt:0.4,icon:['heavy',1],cost:60,
    info:l=>`Мощный удар секирой сверху по первому врагу: <b>${300+l*50}%</b> урона и отбрасывание`},
  {name:'Ледяные шипы',short:'ШИПЫ',cd:12,unlock:3,anim:'spikes',dur:1.3,hitAt:0.25,icon:['spikes',4],cost:150,
    info:l=>`Ледяные шипы вырываются из земли под всеми врагами: <b>${260+l*45}%</b> урона`},
  {name:'Несокрушимость',short:'БРОНЯ',cd:26,unlock:6,anim:'shine',dur:0.8,hitAt:0.5,icon:['shine',3],cost:400,
    info:l=>`Щит на <b>${40+l*6}%</b> здоровья на 8 с`},
  {name:'Ярость севера',short:'ЯРОСТЬ',cd:16,unlock:10,anim:'combo',dur:1.2,hits:[0.12,0.45,0.79],icon:['combo',5],cost:700,
    info:l=>`3 удара по всем врагам: <b>3 × ${170+l*30}%</b> урона`},
  {name:'Последний рубеж',short:'РУБЕЖ',cd:30,unlock:15,anim:'ice',dur:1.4,hitAt:0.6,icon:['ice',9],cost:1000,when:()=>hero.hp<st.maxHp()*0.6,
    info:l=>`<b>${(3+l*0.5).toFixed(1)} с</b> блок всего урона и лечение <b>${20+l*3}%</b>`},
], asn:[
  {name:'Двойной удар',short:'ДВОЙН.',cd:8,unlock:1,anim:'dbl',dur:0.75,hits:[0.19,0.56],icon:['dbl',4],cost:60,
    info:l=>`Два быстрых удара, каждый <b>${190+l*30}%</b> урона`},
  {name:'Шаг тени',short:'ТЕНЬ',cd:12,unlock:3,anim:'sp',dur:1.1,hitAt:0.4,icon:['sp',5],cost:150,
    info:l=>`Рывок сквозь врагов: <b>${420+l*75}%</b> урона всем на пути`},
  {name:'Ядовитые клинки',short:'ЯД',cd:24,unlock:6,anim:'block',dur:0.9,hitAt:0.5,icon:['block',2],cost:400,
    info:l=>`<b>${(5+l*0.5).toFixed(1)} с</b>: скорость атак x2`},
  {name:'Веер кинжалов',short:'ВЕЕР',cd:15,unlock:10,anim:'pc',dur:0.6,hitAt:0.35,icon:['pc',2],cost:700,
    info:l=>`Метает кинжал в каждого врага: <b>${230+l*40}%</b> урона`},
  {name:'Танец клинков',short:'ТАНЕЦ',cd:28,unlock:15,anim:'combo',dur:1.6,hits:[0.08,0.25,0.47,0.69,0.86],icon:['combo',12],cost:1000,
    info:l=>`5 ударов по случайным врагам: <b>5 × ${150+l*25}%</b> урона`},
], sam:[
  {name:'Небесный выстрел',short:'НЕБО',cd:11,unlock:1,anim:'sp',dur:1.0,hits:[0.36,0.46,0.56],icon:['sp',4],cost:60,
    info:l=>`Три мощных выстрела подряд: <b>3 × ${260+l*45}%</b> урона`},
  {name:'Стойка блока',short:'БЛОК',cd:18,unlock:3,anim:'block',dur:1.3,hits:[0.3],icon:['block',9],cost:150,
    info:l=>`<b>${(3+l*0.5).toFixed(1)} с</b> блокирует весь урон`},
  {name:'Град стрел',short:'ГРАД',cd:22,unlock:6,anim:'rain',dur:1.0,hits:[0.6],icon:['rain',5],cost:400,
    info:l=>`8 стрел по всем врагам, каждая <b>${150+l*25}%</b> урона`},
  {name:'Пронзающая стрела',short:'ПРОНЗ.',cd:15,unlock:10,anim:'beam',dur:1.5,hits:[0.56],icon:['beam',9],cost:700,
    info:l=>`Прошивает всех врагов на линии: <b>${600+l*100}%</b> урона`},
  {name:'Дух воина',short:'ДУХ',cd:30,unlock:15,anim:'block',dur:1.3,hits:[0.3],icon:['block',8],cost:1000,when:()=>hero.hp<st.maxHp()*0.6,
    info:l=>`Лечит <b>${30+l*3}%</b> здоровья и даёт x2 скорость на 4 с`},
]};
const PSV={mage:[
  {id:'dmg',name:'Мощь бездны',per:4,max:25,unlock:2,cost:40,unit:'% к урону',ic:'dmg'},
  {id:'cdr',name:'Ускоренное чтение',per:3,max:10,unlock:5,cost:80,unit:'% быстрее перезарядка',ic:'cdr'},
  {id:'ls',name:'Кровь чародея',per:1,max:10,unlock:8,cost:120,unit:'% урона в здоровье',ic:'ls'},
  {id:'cdmg',name:'Резонанс',per:10,max:20,unlock:12,cost:150,unit:'% к силе крита',ic:'cdmg'},
], tank:[
  {id:'hp',name:'Закалка',per:6,max:25,unlock:2,cost:40,unit:'% к здоровью',ic:'hp'},
  {id:'regen',name:'Стойкость',per:0.5,max:10,unlock:5,cost:80,unit:'% здоровья в секунду',ic:'regen'},
  {id:'dmg',name:'Тяжёлая рука',per:4,max:25,unlock:8,cost:120,unit:'% к урону',ic:'dmg'},
  {id:'dodge',name:'Парирование',per:1.5,max:20,unlock:12,cost:150,unit:'% шанс отразить удар',ic:'dodge'},
], asn:[
  {id:'crit',name:'Слабые места',per:1,max:20,unlock:2,cost:40,unit:'% к шансу крита',ic:'crit'},
  {id:'cdmg',name:'Смертельная точность',per:10,max:20,unlock:5,cost:80,unit:'% к силе крита',ic:'cdmg'},
  {id:'aps',name:'Проворство',per:3,max:20,unlock:8,cost:120,unit:'% к скорости атаки',ic:'aps'},
  {id:'ls',name:'Кровопийца',per:1,max:10,unlock:12,cost:150,unit:'% урона в здоровье',ic:'ls'},
], sam:[
  {id:'hp',name:'Дисциплина',per:5,max:20,unlock:2,cost:40,unit:'% к здоровью',ic:'hp'},
  {id:'dmg',name:'Путь лука',per:4,max:25,unlock:5,cost:80,unit:'% к урону',ic:'dmg'},
  {id:'regen',name:'Медитация',per:0.5,max:10,unlock:8,cost:120,unit:'% здоровья в секунду',ic:'regen'},
  {id:'cdr',name:'Терпение',per:3,max:10,unlock:12,cost:150,unit:'% быстрее перезарядка',ic:'cdr'},
]};
const psCost=(p,l)=>p.cost*(l+1);
const PSV_ICON={
 dmg:["..........##",".........###","........###.",".......###..","..#...###...","..##.###....","...####.....","...###......","..##.##.....",".##...#.....","##..........","#..........."],
 hp:["............","..##...##...",".####.####..",".#########..",".#########..","..#######...","...#####....","....###.....",".....#......","............","............","............"],
 aps:["............","#....#......","##...##.....","###..###....","####.####...","#####.####..","####.####...","###..###....","##...##.....","#....#......","............","............"],
 crit:["....####....","..##....##..",".#...##...#.",".#..#..#..#.","#..#.oo.#..#","#..#.oo.#..#",".#..#..#..#.",".#...##...#.","..##....##..","....####....","............","............"],
 cdmg:[".....#......","..#..#..#...","...#.#.#....","....ooo.....","####ooo####.","....ooo.....","...#.#.#....","..#..#..#...",".....#......","............","............","............"],
 gold:["....####....","..##oooo##..",".#oo####oo#.",".#o#oooo#o#.","#oo#oooo#oo#","#oo#oooo#oo#",".#o#oooo#o#.",".#oo####oo#.","..##oooo##..","....####....","............","............"],
 ls:[".....#......",".....#......","....###.....","....###.....","...#####....","..#######...","..###o###...","..##o####...","...#####....","....###.....","............","............"],
 dodge:["............","########....","........#...","..######.#..",".........#..","#######..#..","........#...","..#####.....","............","............","............","............"],
 regen:["....####....","....#oo#....","....#oo#....","#####oo#####","#oooooooooo#","#oooooooooo#","#####oo#####","....#oo#....","....#oo#....","....####....","............","............"],
 cdr:["############",".#oooooooo#.","..#oooooo#..","...#oooo#...","....#oo#....",".....##.....",".....##.....","....#..#....","...#....#...","..#..oo..#..",".#oooooooo#.","############"],
};
const PSV_COL={dmg:['#ff6b5a','#ffd0c8'],hp:['#e4364f','#ff9aa8'],aps:['#5fd39b','#c8ffe0'],crit:['#f3b94a','#ff5a3a'],cdmg:['#ff9a3a','#ffffff'],gold:['#c9a25a','#f3d27a'],ls:['#c0322f','#ff9aa8'],dodge:['#8fd8ff','#ffffff'],regen:['#3f9a6c','#7af0a8'],cdr:['#c9a25a','#8fd8ff']};
let SK=SKS.mage;
function applyHero(){ HD=HEROES[S.hero]||HEROES.mage; FR=FRS[S.hero]; SK=SKS[S.hero]; S.sk=S.sks[S.hero]; }
const upCost=(u,l)=>Math.round((u.base+u.inc*l)*10);
const soulCostU=l=>0;
const stoneCost=l=>l+1>=5?Math.pow(2,l+1-5):0;   // shards from level 5: 1,2,4,8…
const stoneChance=z=>Math.min(1,0.001*z);   // 0.1% per zone
const STONE_MAP=["....####....","...#oooo#...","..#oo##oo#..",".#oo#hh#oo#.","#oo#hhhh#oo#","#o#hhhhhh#o#","#oo#hhhh#oo#",".#oo#hh#oo#.","..#oo##oo#..","...#oooo#...","....####....","............"];
let STONE_ICON='';
function bulkU(u){ // gold + soul stones + souls
  const lv=S.upg[u.id], m=S.mult; let n=0,g=0,s=0,so=0,l=lv;
  while((m===0||n<m) && (u.max==null||l<u.max)){
    const cg=upCost(u,l), cs=stoneCost(l), cso=soulCostU(l);
    if(m===0 && (g+cg>S.gold || s+cs>S.stones || so+cso>S.souls)) break;
    g+=cg; s+=cs; so+=cso; n++; l++; if(n>200) break;
  }
  return [n,g,s,so];
}
const skCost=(i,l)=>SK[i].cost*l;
