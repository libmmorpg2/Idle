/* ---------- языки ----------
   Тексты в коде пишутся по-русски и оборачиваются в T('…'). Для других языков T ищет перевод
   в словаре I18N[язык] (js/i18n/<язык>.js); если перевода нет — остаётся русский текст.
   Язык: кука lang → язык Telegram → язык браузера. Смена языка перезагружает страницу. */
var LANGS=[{id:'ru',name:'Русский',flag:'🇷🇺'},{id:'en',name:'English',flag:'🇬🇧'}];
var I18N={};
var LANG=(function(){
  var ok=function(l){ return LANGS.some(function(x){ return x.id===l; })?l:null; };
  var map=function(code){ code=String(code||'').toLowerCase().slice(0,2); return ['ru','uk','be','kk'].indexOf(code)>=0?'ru':code?'en':null; };
  try{ var m=document.cookie.match(/(?:^|;\s*)lang=([a-z]{2})/); if(m&&ok(m[1])) return m[1]; }catch(e){}
  try{ var h=new URLSearchParams(location.hash.slice(1)).get('tgWebAppData'); if(h){ var u=JSON.parse(new URLSearchParams(h).get('user')||'{}'); if(u.language_code) return ok(map(u.language_code))||'en'; } }catch(e){}
  try{ return ok(map(navigator.language))||'ru'; }catch(e){ return 'ru'; }
})();
var LOCALE=LANG==='ru'?'ru-RU':'en-US';
document.documentElement.lang=LANG;
function T(s){ if(LANG==='ru'||s==null) return s; var d=I18N[LANG]; var v=d&&d[s]; return v==null?s:v; }
function setLang(id){
  document.cookie='lang='+id+';path=/;max-age='+(3600*24*365*2)+';samesite=lax';
  try{ if(typeof save==='function'&&typeof S!=='undefined'&&S){ S.lang=id; save(true); } }catch(e){}
  setTimeout(function(){ location.reload(); },150);
}
// перевод статичной разметки: текстовые узлы и атрибуты placeholder/aria-label/title
function i18nDom(root){
  if(LANG==='ru'||!root) return;
  var tr=function(s){ var t=s.trim(); if(!t||!/[А-Яа-яЁё]/.test(t)) return s; var v=T(t); return v===t?s:s.replace(t,v); };
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null), n, list=[];
  while((n=w.nextNode())) list.push(n);
  list.forEach(function(n){ if(n.parentNode&&/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) return; n.nodeValue=tr(n.nodeValue); });
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(function(el){ ['placeholder','aria-label','title'].forEach(function(a){ if(el.hasAttribute(a)) el.setAttribute(a,tr(el.getAttribute(a))); }); });
}
