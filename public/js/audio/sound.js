// ---- sound: procedural SFX + generative music (Web Audio, no files) ----
const SND=(()=>{
  let ac=null, master, sfxG, musG, rev, noiseBuf, started=false;
  const last={};
  const cfg=()=>S.snd||(S.snd={sfx:true,mus:true});
  function init(){
    if(ac) return true;
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return false;
    ac=new AC(); master=ac.createGain(); master.gain.value=0.9; master.connect(ac.destination);
    const comp=ac.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=4; comp.connect(master);
    sfxG=ac.createGain(); sfxG.connect(comp); musG=ac.createGain(); musG.connect(comp);
    // simple reverb (decaying noise impulse)
    rev=ac.createConvolver(); const len=ac.sampleRate*2.2, ir=ac.createBuffer(2,len,ac.sampleRate);
    for(let ch=0;ch<2;ch++){ const d=ir.getChannelData(ch); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6); }
    rev.buffer=ir; const rg=ac.createGain(); rg.gain.value=0.35; rev.connect(rg); rg.connect(comp);
    noiseBuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate); const nd=noiseBuf.getChannelData(0); for(let i=0;i<nd.length;i++) nd[i]=Math.random()*2-1;
    apply(); return true;
  }
  function apply(){ if(!ac) return; const c=cfg(); sfxG.gain.setTargetAtTime(c.sfx?0.55:0,ac.currentTime,0.05); musG.gain.setTargetAtTime(c.mus?0.16:0,ac.currentTime,0.3); }
  function unlock(){ if(!init()) return; if(ac.state==='suspended') ac.resume(); if(!started){ started=true; Music.start(); } }
  const thr=(k,ms)=>{ const n=performance.now(); if(last[k]&&n-last[k]<ms) return false; last[k]=n; return true; };
  const ok=()=>ac&&ac.state==='running'&&cfg().sfx;
  // building blocks
  function env(g,t,a,peak,d,end=0.0001){ g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(peak,t+a); g.gain.exponentialRampToValueAtTime(end,t+a+d); }
  function tone(type,f0,f1,dur,vol,{t=0,a=0.005,out=sfxG,wet=0,filt=0,q=1}={}){
    const T=ac.currentTime+t, o=ac.createOscillator(), g=ac.createGain(); o.type=type; o.frequency.setValueAtTime(f0,T); if(f1&&f1!==f0) o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),T+dur);
    let node=o; if(filt){ const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=filt; f.Q.value=q; o.connect(f); node=f; }
    node.connect(g); env(g,T,a,vol,dur); g.connect(out); if(wet){ const w=ac.createGain(); w.gain.value=wet; g.connect(w); w.connect(rev); }
    o.start(T); o.stop(T+a+dur+0.05); }
  function noise(dur,vol,{t=0,a=0.002,type='bandpass',f0=1000,f1=0,q=1,out=sfxG,wet=0}={}){
    const T=ac.currentTime+t, s=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); s.buffer=noiseBuf; s.loop=true;
    f.type=type; f.Q.value=q; f.frequency.setValueAtTime(f0,T); if(f1) f.frequency.exponentialRampToValueAtTime(f1,T+dur);
    s.connect(f); f.connect(g); env(g,T,a,vol,dur); g.connect(out); if(wet){ const w=ac.createGain(); w.gain.value=wet; g.connect(w); w.connect(rev); }
    s.start(T,Math.random()*0.5); s.stop(T+a+dur+0.05); }
  const R=(a,b)=>a+Math.random()*(b-a);
  // ---- effects ----
  const fx={
    swing(){ if(!thr('swing',60)) return; noise(0.16,0.35,{type:'bandpass',f0:R(500,700),f1:R(2400,3200),q:1.4}); },
    heavy(){ noise(0.26,0.45,{type:'bandpass',f0:300,f1:1800,q:1}); tone('sine',120,50,0.2,0.4,{t:0.05}); },
    arrow(){ if(!thr('arrow',45)) return; tone('triangle',R(380,440),R(180,220),0.09,0.25); noise(0.12,0.18,{type:'highpass',f0:2500,f1:5000,q:0.7,t:0.01}); },
    knife(){ if(!thr('knife',45)) return; noise(0.08,0.25,{type:'bandpass',f0:3000,f1:6000,q:2}); tone('square',R(1400,1700),900,0.04,0.06,{filt:4000}); },
    bolt(){ if(!thr('bolt',50)) return; tone('sawtooth',R(820,900),R(200,240),0.18,0.14,{filt:2600,wet:0.4}); tone('sine',R(1300,1500),600,0.12,0.12,{wet:0.3}); noise(0.14,0.08,{type:'bandpass',f0:4000,f1:1500,q:3}); },
    hit(crit,big){ if(!thr('hit',35)) return; noise(big?0.14:0.08,big?0.55:0.4,{type:'lowpass',f0:big?1400:2200,f1:300,q:0.8}); tone('sine',big?140:R(170,200),55,big?0.16:0.09,big?0.5:0.35);
      if(crit){ tone('square',1600,2400,0.05,0.09,{filt:5000}); tone('triangle',2400,2400,0.12,0.08,{t:0.03,wet:0.3}); } },
    kill(boss){ if(!thr('kill',50)) return; noise(0.18,0.3,{type:'bandpass',f0:900,f1:200,q:1.2}); tone('square',R(300,340),90,0.16,0.07,{filt:1500});
      if(boss){ tone('sawtooth',220,55,0.9,0.25,{filt:900,wet:0.6}); noise(0.8,0.3,{type:'lowpass',f0:600,f1:80,q:0.7,wet:0.5}); } },
    coin(){ if(!thr('coin',90)) return; const f=R(1900,2100); tone('square',f,f,0.05,0.06,{filt:6000}); tone('square',f*1.5,f*1.5,0.12,0.05,{t:0.05,filt:6000,wet:0.2}); },
    hurt(){ if(!thr('hurt',140)) return; tone('sawtooth',160,80,0.14,0.16,{filt:700}); noise(0.1,0.22,{type:'lowpass',f0:900,f1:200}); },
    block(){ if(!thr('block',90)) return; tone('square',820,780,0.08,0.1,{filt:3000,wet:0.4}); tone('triangle',1640,1600,0.2,0.08,{wet:0.5}); },
    quake(){ tone('sine',90,32,0.6,0.7); noise(0.55,0.5,{type:'lowpass',f0:500,f1:60,q:0.7,wet:0.3}); },
    cast(kind){ if(!thr('cast',120)) return;
      if(kind==='mage'){ tone('sine',300,900,0.35,0.15,{wet:0.6}); tone('triangle',450,1350,0.35,0.08,{wet:0.6,t:0.04}); noise(0.4,0.1,{type:'bandpass',f0:800,f1:4000,q:4,wet:0.5}); }
      else if(kind==='sam'){ tone('triangle',220,660,0.3,0.12,{wet:0.5}); noise(0.3,0.08,{type:'highpass',f0:1500,f1:6000,wet:0.4}); }
      else if(kind==='asn'){ noise(0.25,0.2,{type:'bandpass',f0:2000,f1:6000,q:2}); tone('square',600,1200,0.2,0.05,{filt:3000,wet:0.3}); }
      else { tone('sawtooth',110,160,0.35,0.14,{filt:800,wet:0.4}); noise(0.3,0.14,{type:'lowpass',f0:400,f1:900}); } },
    boss(){ [0,0.18,0.36].forEach((t,i)=>tone('sawtooth',[110,110,82.4][i],[110,110,82.4][i],0.5,0.18,{t,filt:900,wet:0.5})); [0,0.18,0.36,0.9].forEach(t=>{ tone('sine',95,38,0.4,0.6,{t}); noise(0.2,0.25,{t,type:'lowpass',f0:300,f1:80}); }); },
    win(){ [523,659,784,1047].forEach((f,i)=>tone('square',f,f,0.22,0.08,{t:i*0.09,filt:3500,wet:0.4})); tone('triangle',1047,1047,0.6,0.1,{t:0.36,wet:0.6}); },
    level(){ [392,494,587,784,988].forEach((f,i)=>tone('triangle',f,f,0.25,0.12,{t:i*0.07,wet:0.5})); noise(0.6,0.05,{t:0.2,type:'highpass',f0:6000,wet:0.6}); },
    die(){ [392,330,262,196].forEach((f,i)=>tone('sawtooth',f,f*0.97,0.35,0.1,{t:i*0.22,filt:1200,wet:0.6})); },
    loot(r){ const base=[0,0,660,780,880,1047][r]||880; [1,1.25,1.5,2].forEach((k,i)=>tone('sine',base*k,base*k,0.3,0.09,{t:i*0.06,wet:0.7})); },
    click(){ if(!thr('click',40)) return; tone('square',900,700,0.03,0.05,{filt:3000}); },
    buy(){ tone('square',1300,1300,0.04,0.06,{filt:5000}); tone('square',1950,1950,0.1,0.06,{t:0.05,filt:5000,wet:0.2}); },
    potion(){ for(let i=0;i<5;i++) tone('sine',R(400,900),R(900,1600),0.08,0.1,{t:i*0.06}); tone('triangle',700,1400,0.3,0.06,{t:0.3,wet:0.5}); },
    enchOk(){ [784,988,1175,1568].forEach((f,i)=>tone('triangle',f,f,0.3,0.1,{t:i*0.08,wet:0.6})); },
    enchBad(){ tone('sawtooth',300,70,0.6,0.16,{filt:900,wet:0.4}); noise(0.5,0.25,{type:'lowpass',f0:1500,f1:100}); },
  };
  // ---- music: dark fantasy loop, intensifies in boss fights ----
  const Music=(()=>{
    let timer=null, step=0, nextT=0;
    const N=f=>440*Math.pow(2,(f-69)/12);
    const CALM={bpm:84,ch:[[57,60,64],[53,57,60],[55,59,62],[52,55,59]],bass:[45,41,43,40]}; // Am F G Em
    const BOSS={bpm:132,ch:[[50,53,57],[46,50,53],[48,52,55],[45,49,52]],bass:[38,34,36,33]}; // Dm Bb C A
    function pad(m,t,dur){ m.forEach((n,i)=>{ const o=ac.createOscillator(), o2=ac.createOscillator(), f=ac.createBiquadFilter(), g=ac.createGain();
      o.type='sawtooth'; o2.type='triangle'; o.frequency.value=N(n); o2.frequency.value=N(n)*1.003; f.type='lowpass'; f.frequency.value=900; f.Q.value=0.5;
      o.connect(f); o2.connect(f); f.connect(g); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.09,t+dur*0.3); g.gain.linearRampToValueAtTime(0.0001,t+dur);
      g.connect(musG); const w=ac.createGain(); w.gain.value=0.5; g.connect(w); w.connect(rev); o.start(t); o2.start(t); o.stop(t+dur+0.1); o2.stop(t+dur+0.1); }); }
    function pluck(n,t,v,out){ const o=ac.createOscillator(), f=ac.createBiquadFilter(), g=ac.createGain(); o.type='square'; o.frequency.value=N(n); f.type='lowpass'; f.frequency.setValueAtTime(2400,t); f.frequency.exponentialRampToValueAtTime(400,t+0.3);
      o.connect(f); f.connect(g); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(v,t+0.005); g.gain.exponentialRampToValueAtTime(0.0001,t+0.45); g.connect(out); const w=ac.createGain(); w.gain.value=0.35; g.connect(w); w.connect(rev); o.start(t); o.stop(t+0.5); }
    function drum(t,kind,v){ if(kind==='k'){ const o=ac.createOscillator(), g=ac.createGain(); o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(40,t+0.2); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.3); o.connect(g); g.connect(musG); o.start(t); o.stop(t+0.32); }
      else { const s=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); s.buffer=noiseBuf; f.type=kind==='h'?'highpass':'bandpass'; f.frequency.value=kind==='h'?7000:1800; g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(0.0001,t+(kind==='h'?0.05:0.18)); s.connect(f); f.connect(g); g.connect(musG); s.start(t,Math.random()*0.5); s.stop(t+0.2); } }
    function sched(){
      const boss=(typeof bossT!=='undefined'&&bossT>0);
      const P=boss?BOSS:CALM, spb=60/P.bpm/2; // eighth notes
      while(nextT<ac.currentTime+0.25){
        const bar=Math.floor(step/8)%4, s8=step%8, ch=P.ch[bar], t=nextT;
        if(s8===0){ pad(ch,t,spb*8+0.2); pluck(P.bass[bar],t,0.12,musG); }
        if(s8===4) pluck(P.bass[bar]+(boss?0:7),t,0.08,musG);
        const arp=[0,1,2,1,0,2,1,2][s8]; if(boss||s8%2===0||Math.random()<0.35) pluck(ch[arp]+12,t,boss?0.05:0.045,musG);
        if(!boss&&s8===6&&bar===3) pluck(ch[2]+24,t,0.03,musG);
        if(boss){ if(s8%4===0) drum(t,'k',0.55); if(s8===2||s8===6) drum(t,'k',0.3); if(s8%4===2) drum(t,'s',0.18); drum(t,'h',0.05); }
        else if(s8===0&&bar%2===0) drum(t,'k',0.18);
        nextT+=spb; step++;
      }
    }
    return { start(){ if(timer) return; nextT=ac.currentTime+0.1; step=0; timer=setInterval(()=>{ if(ac.state==='running') sched(); },100); } };
  })();
  ['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,unlock,{passive:true}));
  document.addEventListener('visibilitychange',()=>{ if(!ac) return; if(document.hidden) ac.suspend(); else if(started) ac.resume(); });
  return { play(name,...a){ try{ if(ok()&&fx[name]) fx[name](...a); }catch(e){ window.__sndErr=String(e); } }, state:()=>ac?ac.state:'none', apply, unlock };
})();
