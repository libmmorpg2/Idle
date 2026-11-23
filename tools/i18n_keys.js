// Ищет русские строки без английского перевода: T('…') в public/js и текст статичной разметки index.html.
// Запуск: node tools/i18n_keys.js   (выводит ключи, которых нет в public/js/i18n/en.js)
const fs=require('fs'), path=require('path');
const root=path.join(__dirname,'..','public'), keys=new Map();
const add=(k,src)=>{ if(/[А-Яа-яЁё]/.test(k)&&!keys.has(k)) keys.set(k,src); };
function walk(d){ for(const f of fs.readdirSync(d)){ const p=path.join(d,f); if(fs.statSync(p).isDirectory()){ if(f!=='i18n') walk(p); } else if(p.endsWith('.js')) scan(fs.readFileSync(p,'utf8'),path.relative(root,p)); } }
function scan(s,src){ const re=/\bT\((["'])((?:\\.|(?!\1).)*)\1\)/g; let m; while((m=re.exec(s))) add(eval(m[1]+m[2]+m[1]),src); }
walk(path.join(root,'js'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html.replace(/<script[\s\S]*?<\/script>/g,s=>{ scan(s,'index.html'); return ''; }).replace(/>([^<]+)</g,(_,t)=>{ add(t.trim(),'index.html'); return ''; });
html.replace(/(?:placeholder|aria-label|title)="([^"]*)"/g,(_,t)=>add(t.trim(),'index.html'));
const I18N={}; eval(fs.readFileSync(path.join(root,'js/i18n/en.js'),'utf8'));
const miss=[...keys].filter(([k])=>!(k in I18N.en));
console.log(`${keys.size} ключей, без перевода: ${miss.length}`); for(const [k,f] of miss) console.log(`  ${f}: ${JSON.stringify(k)}`);
