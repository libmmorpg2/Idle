/* ---------- locations ---------- */
const LOCS=[
 {id:'forest',name:'Сумрачный лес',from:1,to:10,theme:0,gen:'леса',stat:'gold',mobs:['goblin','slug','tiny_slug','muddy','pumpkin'],boss:'ogre',bossName:'Лесной огр',
  desc:'Тихая чаща у края мира. Здесь начинают путь все герои.',rw:[100,0,0,0,0,0],drop:0.10},
 {id:'ash',name:'Пепельные равнины',from:11,to:20,theme:1,gen:'пепла',stat:'dmg',mobs:['skelet','zombie','tiny_zombie','necromancer','imp','chort'],boss:'big_zombie',bossName:'Гниющий великан',
  desc:'Выжженная земля, где мёртвые не знают покоя.',rw:[70,30,0,0,0,0],drop:0.11},
 {id:'moon',name:'Лунные руины',from:21,to:30,theme:2,gen:'луны',stat:'crit',mobs:['ice_zombie','moon_skelet','masked_orc','orc_warrior','orc_shaman'],boss:'ice_ogre',bossName:'Хранитель руин',
  desc:'Обломки древнего храма под вечной луной.',rw:[55,30,15,0,0,0],drop:0.12},
 {id:'shadow',name:'Пустошь теней',from:31,to:40,theme:3,gen:'теней',stat:'spd',mobs:['wogol','shadow_imp','shadow_chort','dark_priest','shadow_orc'],boss:'shadow_demon',bossName:'Повелитель теней',
  desc:'Мир за гранью света. Тени здесь охотятся сами.',rw:[0,0,70,30,0,0],drop:0.13},
 {id:'blood',name:'Кровавые топи',from:41,to:Infinity,theme:4,gen:'крови',stat:'hp',mobs:['swampy','leech','bog_goblin','drowned','bog_shaman','muddy'],boss:'big_demon',bossName:'Демон топей',
  desc:'Бескрайнее болото. Чем глубже, тем сильнее враги и богаче добыча.',rw:[0,0,0,65,28,7],drop:0.14},
];
const locOf=z=>LOCS.find(l=>z>=l.from&&z<=l.to)||LOCS[LOCS.length-1];
