// ---- TON-кошелёк через TON Connect (библиотека грузится только при открытии профиля) ----
const TON_LIB='https://cdn.jsdelivr.net/npm/@tonconnect/ui@5.0.2/dist/tonconnect-ui.min.js';
const TON={ui:null,loading:null,addr:null,err:false,saved:undefined};
function tonLoad(){
  if(TON.loading) return TON.loading;
  TON.loading=new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=TON_LIB; s.onload=res; s.onerror=rej; document.head.appendChild(s); })
    .then(async()=>{
      let cfg={}; try{ cfg=await (await api('config')).json(); }catch(e){}
      TON.ui=new TON_CONNECT_UI.TonConnectUI({
        manifestUrl:location.origin+'/tonconnect-manifest.json',
        uiPreferences:{theme:'DARK'}, language:LANG==='ru'?'ru':'en',
        actionsConfiguration:cfg.tgAppUrl?{twaReturnUrl:cfg.tgAppUrl}:undefined,
      });
      TON.ui.onStatusChange(w=>tonSet(w),()=>{});
      await TON.ui.connectionRestored; tonSet(TON.ui.wallet);
    })
    .catch(e=>{ console.error(e); TON.loading=null; TON.err=true; tonRender(); });
  return TON.loading;
}
function tonSet(w){
  let a=null; try{ if(w&&w.account) a=TON_CONNECT_UI.toUserFriendlyAddress(w.account.address,w.account.chain==='-3'); }catch(e){}
  TON.addr=a; TON.err=false;
  if(a!==TON.saved){ TON.saved=a; api('wallet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:a})}).catch(()=>{}); }
  tonRender();
}
const tonShort=a=>a.slice(0,6)+'…'+a.slice(-6);
function tonRender(){
  const box=$('tonBox'); if(!box) return;
  if(TON.addr) box.innerHTML=`<div class="ton-ok"><i class="ton-ic"></i><span><b>${T('Кошелёк подключён')}</b><small title="${esc(TON.addr)}">${esc(tonShort(TON.addr))}</small></span></div>
    <button type="button" class="sec-btn ton-off" id="tonOff">${T('Отключить')}</button>`;
  else box.innerHTML=`<p class="note">${T('Подключите TON-кошелёк (Telegram Wallet, Tonkeeper и другие), чтобы привязать его к аккаунту.')}</p>
    <button type="button" class="ton-on" id="tonOn"${TON.ui||TON.err?'':' disabled'}><i class="ton-ic"></i>${TON.err?T('Повторить загрузку'):TON.ui?T('Подключить кошелёк'):T('Загрузка…')}</button>`;
}
function tonMount(){ tonRender(); if(!TON.ui) tonLoad(); }
$('list').addEventListener('click',async e=>{
  const lg=e.target.closest('[data-lang]'); if(lg){ if(lg.dataset.lang!==LANG) setLang(lg.dataset.lang); return; }
  if(e.target.closest('#tonOn')){ if(TON.err){ TON.err=false; tonRender(); tonLoad(); return; } try{ await TON.ui.openModal(); }catch(err){ console.error(err); } return; }
  if(e.target.closest('#tonOff')){ try{ await TON.ui.disconnect(); }catch(err){} tonSet(null); }
});
