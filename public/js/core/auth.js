/* ---------- вход через Telegram ----------
   В Telegram Mini App вход автоматический (подписанный initData).
   В обычном браузере — кнопка Telegram Login Widget. Токен сессии держим только в памяти,
   плюс сервер ставит httpOnly-куку, чтобы не входить заново после перезагрузки страницы. */
const AUTH={token:null,user:null};
const TG=(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.initData)?window.Telegram.WebApp:null;
function api(path,opts={}){
  const headers=Object.assign({},opts.headers||{}); if(AUTH.token) headers.Authorization='Bearer '+AUTH.token;
  return fetch('api/'+path,Object.assign({credentials:'same-origin',cache:'no-store'},opts,{headers}));
}
async function tgAuth(body){
  const r=await api('auth/telegram',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok) throw new Error(r.status===401?'Telegram не подтвердил вход':'сервер ответил '+r.status);
  const j=await r.json(); AUTH.token=j.token; AUTH.user=j.user; return j.user;
}
async function login(){
  LOAD.set(45,'Вход через Telegram…');
  if(TG){
    try{ TG.ready(); TG.expand(); }catch(e){}
    for(;;){ try{ const u=await tgAuth({initData:TG.initData}); srvMsg(''); return u; }
      catch(e){ srvMsg('Не удалось войти: '+e.message+'. Повторяю…'); await new Promise(f=>setTimeout(f,3000)); } }
  }
  try{ const r=await api('me'); if(r.ok){ AUTH.user=(await r.json()).user; return AUTH.user; } }catch(e){}
  return showLogin();
}
function showLogin(){ return new Promise(async done=>{
  const msg=$('loginMsg'); LOAD.login(true);
  let cfg={}; try{ cfg=await (await api('config')).json(); }catch(e){ msg.textContent='Нет связи с сервером. Обновите страницу.'; return; }
  if(!cfg.botUsername){ msg.textContent='Вход не настроен: на сервере не задан BOT_USERNAME.'; return; }
  window.onTelegramAuth=async u=>{
    try{ msg.textContent='Входим…'; const user=await tgAuth({widget:u}); LOAD.login(false); LOAD.set(60,'С возвращением!'); done(user); }
    catch(e){ msg.textContent='Ошибка входа: '+e.message; }
  };
  const s=document.createElement('script'); s.async=true; s.src='https://telegram.org/js/telegram-widget.js?22';
  s.setAttribute('data-telegram-login',cfg.botUsername); s.setAttribute('data-size','large');
  s.setAttribute('data-radius','6'); s.setAttribute('data-onauth','onTelegramAuth(user)');
  s.onerror=()=>{ msg.textContent='Не удалось загрузить кнопку Telegram.'; };
  $('loginBtn').appendChild(s);
}); }
async function logout(){
  if(S&&!SRV.dead){ S.last=Date.now(); SRV.dirty=true; await flushSave(); }
  SRV.dead=true; try{ await api('logout',{method:'POST'}); }catch(e){}
  location.reload();
}
const userName=()=>{ const u=AUTH.user; return u?(u.username?'@'+u.username:(u.firstName||'id '+u.id)):''; };
