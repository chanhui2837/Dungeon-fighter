// Simple WebAudio manager that respects BGM/SFX volume and mute
let ctx=null;
let bgmGain=null;
let sfxGain=null;
let bgmOsc=null;
let enabled=true;

function ensureCtx(){
  if(ctx) return ctx;
  try{
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx = new AC();
    bgmGain = ctx.createGain();
    sfxGain = ctx.createGain();
    bgmGain.connect(ctx.destination);
    sfxGain.connect(ctx.destination);
    return ctx;
  }catch{ return null; }
}

export const audio = {
  init(settings){
    if(!settings) return;
    this.apply(settings);
    // unlock on first interaction
    const unlock=()=>{
      const c = ensureCtx();
      if(c && c.state==='suspended') c.resume();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, {once:true});
    window.addEventListener('keydown', unlock, {once:true});
    window.addEventListener('touchstart', unlock, {once:true});
  },
  apply(settings){
    const s = settings?.audio || { bgm:60, sfx:80, mute:false };
    const c = ensureCtx();
    const mute = !!s.mute;
    const bgmV = mute ? 0 : (s.bgm??60)/100 * 0.35;
    const sfxV = mute ? 0 : (s.sfx??80)/100;
    if(bgmGain) bgmGain.gain.value = bgmV;
    if(sfxGain) sfxGain.gain.value = sfxV;
    // manage BGM pseudo hum
    if(bgmV>0.01) this.startBgm();
    else this.stopBgm();
  },
  startBgm(){
    const c = ensureCtx();
    if(!c || bgmOsc) return;
    try{
      bgmOsc = c.createOscillator();
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      bgmOsc.type='sine';
      bgmOsc.frequency.value= 110;
      lfo.frequency.value=0.12;
      lfoGain.gain.value=8;
      lfo.connect(lfoGain);
      lfoGain.connect(bgmOsc.frequency);
      bgmOsc.connect(bgmGain);
      bgmOsc.start();
      lfo.start();
      bgmOsc._lfo=lfo; bgmOsc._lfoGain=lfoGain;
    }catch{}
  },
  stopBgm(){
    if(bgmOsc){
      try{ bgmOsc.stop(); bgmOsc._lfo?.stop(); }catch{}
      try{ bgmOsc.disconnect(); bgmOsc._lfo?.disconnect(); }catch{}
      bgmOsc=null;
    }
  },
  playSfx(kind='hit'){
    const c = ensureCtx();
    if(!c || !sfxGain || sfxGain.gain.value < 0.001) return;
    if(c.state==='suspended') c.resume();
    try{
      const osc=c.createOscillator();
      const gain=c.createGain();
      osc.connect(gain); gain.connect(sfxGain);
      const now=c.currentTime;
      if(kind==='hit'){
        osc.type='square'; osc.frequency.setValueAtTime(220, now); osc.frequency.exponentialRampToValueAtTime(80, now+0.12);
        gain.gain.setValueAtTime(0.6, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.15);
      } else if(kind==='heal'){
        osc.type='sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.linearRampToValueAtTime(660, now+0.2);
        gain.gain.setValueAtTime(0.5, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.3);
      } else if(kind==='skill'){
        osc.type='sawtooth'; osc.frequency.setValueAtTime(180, now); osc.frequency.linearRampToValueAtTime(360, now+0.18);
        gain.gain.setValueAtTime(0.5, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.22);
      } else if(kind==='levelup'){
        osc.type='sine'; osc.frequency.setValueAtTime(523, now); osc.frequency.setValueAtTime(659, now+0.12); osc.frequency.setValueAtTime(783, now+0.24);
        gain.gain.setValueAtTime(0.6, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.5);
      } else {
        osc.type='sine'; osc.frequency.value=300;
        gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.1);
      }
      osc.start(now); osc.stop(now+0.5);
    }catch{}
  },
  // quick helper for UI
  setBgm(v, mute){ this.apply({audio:{bgm:v, sfx: sfxGain ? sfxGain.gain.value*100 : 80, mute}}); },
};
