export class Input{
  constructor(target){
    this.keys = new Set();
    this.mouse = { x:0, y:0, down:false };
    this.target = target;
    this.bind();
  }
  bind(){
    window.addEventListener('keydown', e=>{
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
    });
    window.addEventListener('keyup', e=> this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', ()=> this.keys.clear());
    if(this.target){
      this.target.addEventListener('mousemove', e=>{
        const rect=this.target.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });
      this.target.addEventListener('mousedown', e=>{ this.mouse.down=true; if(e.button===0) this.mouse.left=true; });
      this.target.addEventListener('mouseup', e=>{ this.mouse.down=false; this.mouse.left=false; });
      this.target.addEventListener('contextmenu', e=> e.preventDefault());
    }
  }
  isDown(k){ return this.keys.has(k.toLowerCase()); }
  getVector(keyMap){
    // keyMap from settings
    let x=0,y=0;
    if(this.isDown(keyMap.left) || this.isDown('arrowleft')) x-=1;
    if(this.isDown(keyMap.right) || this.isDown('arrowright')) x+=1;
    if(this.isDown(keyMap.up) || this.isDown('arrowup')) y-=1;
    if(this.isDown(keyMap.down) || this.isDown('arrowdown')) y+=1;
    const len=Math.hypot(x,y);
    if(len>0){ x/=len; y/=len; }
    return {x,y};
  }
}
