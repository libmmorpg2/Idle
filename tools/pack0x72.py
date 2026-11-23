# Собирает атлас монстров из 0x72 DungeonTileset II: только нужные кадры, обрезанные по общей рамке.
# Запуск: python3 tools/pack0x72.py <папка с atlas.png и tile_list из 0x72_DungeonTilesetII_v1.7> public/assets/img/monsters.png public/js/data/monsters.js
import re, sys, json
from PIL import Image
src_dir, out_png, out_js = sys.argv[1:4]
SRC=['goblin','imp','wogol','chort','skelet','zombie','tiny_zombie','ice_zombie','orc_shaman','orc_warrior','masked_orc',
     'swampy','muddy','necromancer','slug','tiny_slug','pumpkin_dude','big_demon','big_zombie','ogre']
atlas=Image.open(f'{src_dir}/atlas.png').convert('RGBA')
tiles={}
for line in open(f'{src_dir}/tile_list'):
    p=line.split()
    if len(p)!=5: continue
    m=re.match(r'^(.+?)_(idle_anim|run_anim|anim)_f(\d+)$',p[0])
    if not m or m.group(1) not in SRC: continue
    name,kind,idx=m.group(1),m.group(2),int(m.group(3))
    if idx>=10: idx%=10           # в списке есть опечатка zombie_anim_f10
    x,y,w,h=map(int,p[1:])
    tiles.setdefault(name,{}).setdefault(kind,{})[idx]=(x,y,w,h)
frames={}
for name in SRC:
    t=tiles[name]; idle=t.get('idle_anim') or t['anim']; run=t.get('run_anim') or t.get('anim') or idle
    idle=[idle[i] for i in sorted(idle)]; run=[run[i] for i in sorted(run)]
    crops=[atlas.crop((x,y,x+w,y+h)) for x,y,w,h in idle+run]
    W,H=crops[0].size
    bx0,by0,bx1,by1=W,H,0,0
    for c in crops:
        bb=c.getbbox()
        if bb: bx0,by0,bx1,by1=min(bx0,bb[0]),min(by0,bb[1]),max(bx1,bb[2]),max(by1,bb[3])
    frames[name]={'idle':[c.crop((bx0,by0,bx1,by1)) for c in crops[:len(idle)]],'run':[c.crop((bx0,by0,bx1,by1)) for c in crops[len(idle):]]}
# упаковка рядами
WIDTH=256; x=y=rowh=0; out={}; place=[]
for name in SRC:
    out[name]={}
    for kind in ('idle','run'):
        out[name][kind]=[]
        for c in frames[name][kind]:
            w,h=c.size
            if x+w>WIDTH: x=0; y+=rowh+1; rowh=0
            place.append((c,x,y)); out[name][kind].append([x,y,w,h]); x+=w+1; rowh=max(rowh,h)
img=Image.new('RGBA',(WIDTH,y+rowh),(0,0,0,0))
for c,px,py in place: img.alpha_composite(c,(px,py))
img.save(out_png,optimize=True)
js='/* Кадры монстров из 0x72 «16x16 DungeonTileset II» (CC0, https://0x72.itch.io/dungeontileset-ii).\n   Сгенерировано из tile_list_v1.7: [x, y, w, h] в assets/img/monsters.png, кадры обрезаны по общей рамке. */\n'
js+='const MON_ATLAS="assets/img/monsters.png";\nconst MON_FR='+json.dumps(out,separators=(',',':'))+';\n'
open(out_js,'w').write(js)
print(img.size, {k:(v['idle'][0][2],v['idle'][0][3],len(v['idle']),len(v['run'])) for k,v in out.items()})
