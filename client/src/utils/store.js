export const defaultSettings = {
  graphics: { resolution:'auto', fps:60, shadow:'high', particles:true },
  audio: { bgm:60, sfx:80, mute:false },
  controls: { joystick:true, keys: { up:'w', down:'s', left:'a', right:'d', attack:' ', skill1:'q', skill2:'w', skill3:'e', skill4:'r', skill5:'t', potion:'p' } },
};

export function loadSettings(){
  try{
    const s = JSON.parse(localStorage.getItem('df_settings')||'null');
    if(!s) return structuredClone(defaultSettings);
    return {
      graphics:{...defaultSettings.graphics, ...(s.graphics||{})},
      audio:{...defaultSettings.audio, ...(s.audio||{})},
      controls:{...defaultSettings.controls, ...(s.controls||{}), keys:{...defaultSettings.controls.keys, ...(s.controls?.keys||{})}},
    };
  }catch{ return structuredClone(defaultSettings); }
}
export function saveSettings(s){ localStorage.setItem('df_settings', JSON.stringify(s)); }

export const gameData = {
  items:{}, monsters:{}, skills:{}, dungeons:{}, avatars:{},
};

export const state = {
  user:null,
  character:null,
  inventory:[],
  avatarInventory:[],
  progress:null,
  settings: loadSettings(),
  selectedDungeon:'forest',
  chatScope:'world',
  partyId:null,
};
