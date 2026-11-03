/* Exercise the actual world event handlers and animation loop without a browser. */
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const path=require('node:path'),root=fs.existsSync(path.join(__dirname,'../dist/world.js'))?path.join(__dirname,'../dist'):path.join(__dirname,'..');
const events={},els=new Map(),ctx2d=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
class El{constructor(){this.dataset={};this.style={};this.hidden=false;this.textContent='';this.innerHTML='';this.handlers={};this.classList={add(){},remove(){},toggle(){},contains(){return true}};this.firstElementChild={textContent:''};this.title='';}getContext(){return ctx2d}getBoundingClientRect(){return{width:1360,height:900,left:0,top:0}}querySelector(){return new El()}setAttribute(k,v){this[k]=v}addEventListener(k,fn){(this.handlers[k]??=[]).push(fn)}focus(){}replaceChildren(){}append(){}setPointerCapture(){}}
const el=s=>{if(!els.has(s))els.set(s,new El());return els.get(s)};
let frame,now=0,entered=[];
const storage=new Map();const context={console,Math,Map,Set,Array,Number,String,Object,Infinity,devicePixelRatio:1,innerWidth:1360,performance:{now:()=>now},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:fn=>frame=fn,document:{hidden:false,querySelector:s=>s==='dialog[open]'?null:el(s),querySelectorAll:()=>[],createElement:()=>new El(),addEventListener(){}},addEventListener:(k,fn)=>(events[k]??=[]).push(fn)};context.window=context;vm.createContext(context);
for(const f of['content.js','engine.js','game-core.js','world.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
context.GameApp={start:()=>context.Island.start(),toast(){},chime(){}};context.Island.setCallbacks(st=>entered.push(st.id),()=>{});
// Geometry generation is already exercised above; skip paint work during movement assertions.
vm.runInContext('Soft3D.Renderer.prototype.render=function(){return 0}',context);
function step(n){for(let i=0;i<n;i++){now+=34;frame(now)}}
function key(type,k){for(const fn of events[type]||[])fn({key:k,target:Object.assign(el('#world'),{tagName:'CANVAS'}),repeat:false,preventDefault(){}})}
function pos(){return el('#world').dataset.position.split(',').map(Number)}
context.Island.start();el('#ride-action').onclick();step(4);assert.equal(el('#world').dataset.vehicle,'motorcycle');let before=pos();key('keydown','w');step(50);key('keyup','w');assert(Math.hypot(pos()[0]-before[0],pos()[2]-before[2])>8,'keyboard actually drives the mounted motorcycle');
el('#recover-action').onclick();step(5);el('#ride-action').onclick();step(5);assert.equal(el('#world').dataset.vehicle,'foot','dismount works');
el('#ride-action').onclick();step(5);assert.equal(el('#world').dataset.vehicle,'motorcycle','remount works');
for(const st of context.PORTFOLIO.stations){context.Island.visit(st);for(let n=0;n<650&&!entered.includes(st.id);n++)step(1);assert(entered.includes(st.id),'automatic ride reaches '+st.id)}
el('#recover-action').onclick();step(3);el('#race-action').onclick();step(3);assert.equal(el('#race-action')['aria-pressed'],'true');assert.equal(el('#race-caption').textContent,'GATE 1 / 8');let prior=el('#race-time').textContent;step(35);assert.notEqual(el('#race-time').textContent,prior,'race timer advances');
el('#view-2d').onclick();step(3);assert.equal(el('#view-2d')['aria-pressed'],'true');assert.equal(el('#world').dataset.vehicle,'motorcycle','map keeps mounted state');
// Drive a full ordered lap with the same map clicks used by a visitor.
for(const i of[1,2,3,4,5,6,7,0]){
  const[x,z]=context.PenguinCore.checkpoints[i],scale=Math.min(1360*.0047,900*.0036),e={button:0,pointerId:1,clientX:1360*.6+x*scale,clientY:900*.43+z*scale};
  for(const fn of el('#world').handlers.pointerdown)fn(e);
  for(const fn of el('#world').handlers.pointerup)fn(e);
  const previous=el('#race-caption').textContent;
  for(let n=0;n<650&&el('#race-caption').textContent===previous;n++)step(1);
  assert.notEqual(el('#race-caption').textContent,previous,'race reaches ordered gate '+i);
}
assert(Number(storage.get('penguin-rally-best'))>0,'completed lap persists personal best');
assert.equal(el('#race-action')['aria-pressed'],'false','lap finishes after all eight gates');
el('#race-action').onclick();step(3);
context.Island.setLanguage('fa');assert.equal(el('#ride-mode').textContent,'موتور');assert.equal(el('#ride-label').textContent,'پیاده شو');
el('#race-action').onclick();step(3);assert.equal(el('#race-action')['aria-pressed'],'false','cancel lap works');
console.log('PASS: actual world keyboard drive, mount/dismount, six automatic résumé routes, race timer/start/cancel and full 8-gate lap with saved record, 2D state preservation, Persian vehicle UI.');
