/* ---------- themes ---------- */
const THEMES=[
  {name:T('Сумрачный лес'),sky:['#08060f','#1d1233','#4a2a63'],moon:'#efe2ff',far:'#1a1029',far2:'#2a1a3e',mid:'#0c0814',ground:'#151021',lip:'#3a2752',stone:'#1e1530',fog:'150,90,220',kind:'pines',en:[['#5fbf5a','#b4f08a'],['#6a3fa8','#a77be0'],['#d9d0e3','#ffffff']]},
  {name:T('Пепельные равнины'),sky:['#0d0b10','#27212b','#5c4b4c'],moon:'#ece2d2',far:'#221c24',far2:'#302830',mid:'#110e12',ground:'#1b1819',lip:'#3c3536',stone:'#262123',fog:'170,150,140',kind:'dead',en:[['#8c8378','#cfc4b5'],['#4d4048','#8a7680'],['#c95a2b','#ff9a4a']]},
  {name:T('Лунные руины'),sky:['#050816','#12204a','#3b4f92'],moon:'#e1eaff',far:'#111a38',far2:'#1a2650',mid:'#090e20',ground:'#131726',lip:'#2b3556',stone:'#1b2033',fog:'110,140,230',kind:'ruins',en:[['#3a7bd5','#8fc1ff'],['#2a3a6e','#5a74c0'],['#a8c8ff','#ffffff']]},
  {name:T('Пустошь теней'),sky:['#0b0513','#2a0e3e','#5d2a72'],moon:'#f2cbff',far:'#1e0a2c',far2:'#2c1240',mid:'#0f0519',ground:'#170c1d',lip:'#3c1f49',stone:'#22122b',fog:'170,90,230',kind:'shards',en:[['#8c3bd9','#d39bff'],['#3c1a5e','#7a46b0'],['#43d6a8','#b6ffe6']]},
  {name:T('Кровавые топи'),sky:['#0e0406','#3a0a12','#6e1a22'],moon:'#ffc0b0',far:'#260810',far2:'#3a1018',mid:'#120406',ground:'#1a0a0c',lip:'#4a1a1c',stone:'#2a1012',fog:'200,50,60',kind:'dead',en:[['#7a2a3a','#b04a5a'],['#6a9a3a','#9acd5a'],['#3f7a5a','#7ac08a']]},
];
const themeOf=z=>THEMES[locOf(z).theme];
