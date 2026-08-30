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
      // 8-bit 신나는 전투 테마 - 140BPM 16스텝 루프
      let step=0;
      // C4, E4, G4, B4, A4 등 신나는 진행
      const melody = [
        261.63, 329.63, 392.00, 329.63,  // C - E - G - E
        440.00, 392.00, 329.63, 261.63,  // A - G - E - C
        329.63, 392.00, 493.88, 392.00,  // E - G - B - G
        523.25, 493.88, 392.00, 329.63,  // C5 - B - G - E
        261.63, 329.63, 392.00, 493.88,  // 상승
        523.25, 587.33, 523.25, 392.00,  // 절정
        329.63, 261.63, 293.66, 329.63,  // 하강
        392.00, 329.63, 261.63, 0,       // 마무리
      ];
      const bass = [
        65.41, 65.41, 98.00, 98.00,
        110.00,110.00, 98.00, 65.41,
        82.41, 82.41,123.47,123.47,
        130.81,130.81,123.47, 82.41,
        65.41, 65.41, 73.42, 82.41,
        98.00,110.00, 98.00, 82.41,
        65.41, 65.41, 73.42, 82.41,
        98.00, 82.41, 65.41, 65.41,
      ];
      const bpm = 142;
      const interval = 60000/bpm/2; // 8분음표
      const playStep = ()=>{
        if(!bgmOsc || !ctx || ctx.state==='suspended') return;
        const now = ctx.currentTime;
        const freq = melody[step % melody.length];
        const low = bass[step % bass.length];
        // lead - square 8bit
        if(freq>0){
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.type='square'; o.frequency.value=freq;
          g.gain.setValueAtTime(0.22, now); g.gain.exponentialRampToValueAtTime(0.01, now+0.18);
          o.connect(g); g.connect(bgmGain);
          o.start(now); o.stop(now+0.2);
        }
        // bass - triangle
        if(low>0 && step%2===0){
          const b = ctx.createOscillator(); const bg = ctx.createGain();
          b.type='triangle'; b.frequency.value=low;
          bg.gain.setValueAtTime(0.18, now); bg.gain.exponentialRampToValueAtTime(0.01, now+0.28);
          b.connect(bg); bg.connect(bgmGain);
          b.start(now); b.stop(now+0.32);
        }
        // hihat on off-beat
        if(step%2===1){
          const n = ctx.createOscillator(); const ng = ctx.createGain();
          n.type='square'; n.frequency.value= 8000;
          ng.gain.setValueAtTime(0.04, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.06);
          n.connect(ng); ng.connect(bgmGain);
          n.start(now); n.stop(now+0.07);
        }
        step = (step+1) % melody.length;
      };
      // use interval for steady tempo
      bgmOsc = { _timer: setInterval(playStep, interval), _play: playStep };
      // immediate
      playStep();
    }catch{}
  },
  stopBgm(){
    if(bgmOsc){
      try{ clearInterval(bgmOsc._timer); }catch{}
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
