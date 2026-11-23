/* ---------- locations ---------- */
const LOCS=[
 {id:'forest',name:T('Сумрачный лес'),from:1,to:10,theme:0,gen:T('леса'),stat:'gold',mobs:['goblin','slug','tiny_slug','muddy','pumpkin'],boss:'ogre',bossName:T('Лесной огр'),
  desc:T('Тихая чаща у края мира. Здесь начинают путь все герои.'),rw:[100,0,0,0,0,0],drop:0.10},
 {id:'ash',name:T('Пепельные равнины'),from:11,to:20,theme:1,gen:T('пепла'),stat:'dmg',mobs:['skelet','zombie','tiny_zombie','necromancer','imp','chort'],boss:'big_zombie',bossName:T('Гниющий великан'),
  desc:T('Выжженная земля, где мёртвые не знают покоя.'),rw:[70,30,0,0,0,0],drop:0.11},
 {id:'moon',name:T('Лунные руины'),from:21,to:30,theme:2,gen:T('луны'),stat:'crit',mobs:['ice_zombie','moon_skelet','masked_orc','orc_warrior','orc_shaman'],boss:'ice_ogre',bossName:T('Хранитель руин'),
  desc:T('Обломки древнего храма под вечной луной.'),rw:[55,30,15,0,0,0],drop:0.12},
 {id:'shadow',name:T('Пустошь теней'),from:31,to:40,theme:3,gen:T('теней'),stat:'spd',mobs:['wogol','shadow_imp','shadow_chort','dark_priest','shadow_orc'],boss:'shadow_demon',bossName:T('Повелитель теней'),
  desc:T('Мир за гранью света. Тени здесь охотятся сами.'),rw:[0,0,70,30,0,0],drop:0.13},
 {id:'blood',name:T('Кровавые топи'),from:41,to:Infinity,theme:4,gen:T('крови'),stat:'hp',mobs:['swampy','leech','bog_goblin','drowned','bog_shaman','muddy'],boss:'big_demon',bossName:T('Демон топей'),
  desc:T('Бескрайнее болото. Чем глубже, тем сильнее враги и богаче добыча.'),rw:[0,0,0,65,28,7],drop:0.14},
];
const locOf=z=>LOCS.find(l=>z>=l.from&&z<=l.to)||LOCS[LOCS.length-1];
