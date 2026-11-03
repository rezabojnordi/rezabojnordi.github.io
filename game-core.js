/* Deterministic arcade movement and collision helpers. No network or dependencies. */
'use strict';
(function(root){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  const boundary=[[-69,-37],[-49,-60],[-17,-65],[29,-62],[62,-43],[72,-12],[70,28],[49,56],[11,65],[-30,61],[-64,42],[-74,2]];
  const checkpoints=[[0,46],[40,32],[56,0],[40,-32],[0,-46],[-40,-32],[-56,0],[-40,32]];
  const ramps=[{x:54,z:10,w:6,d:8,h:2.7,angle:Math.PI},{x:-54,z:-8,w:6,d:8,h:2.7,angle:0},{x:23,z:42,w:6,d:8,h:3.8,angle:Math.PI/2}];
  function inside(x,z){let hit=false;for(let i=0,j=boundary.length-1;i<boundary.length;j=i++){const a=boundary[i],b=boundary[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}
  function localPoint(x,z,o){const dx=x-o.x,dz=z-o.z,c=Math.cos(o.angle||0),s=Math.sin(o.angle||0);return {x:dx*c-dz*s,z:dx*s+dz*c}}
  function contains(x,z,o,r=.7){if(o.r)return Math.hypot(x-o.x,z-o.z)<o.r+r;const p=localPoint(x,z,o);return Math.abs(p.x)<o.w/2+r&&Math.abs(p.z)<o.d/2+r}
  function blocked(x,z,objects,y=0,r=.7){return !inside(x,z)||objects.some(o=>!o.soft&&y<(o.h||3)&&contains(x,z,o,r))}
  function rampAt(x,z){return ramps.find(r=>{const p=localPoint(x,z,r);return Math.abs(p.x)<r.w/2&&Math.abs(p.z)<r.d/2})}
  function groundHeight(x,z){const r=rampAt(x,z);return r?clamp((localPoint(x,z,r).z+r.d/2)/r.d,0,1)*r.h:0}
  function move(p,dx,dz,objects,r=.7){const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.32));let collision=false;for(let i=0;i<n;i++){if(!blocked(p.x+dx/n,p.z,objects,p.y,r))p.x+=dx/n;else collision=true;if(!blocked(p.x,p.z+dz/n,objects,p.y,r))p.z+=dz/n;else collision=true}return collision}
  function drive(p,input,dt){const throttle=(input.up?1:0)-(input.down?1:0),steer=(input.left?1:0)-(input.right?1:0);const max=input.boost?28:20;let acceleration=throttle*(input.boost?20:14);if(throttle&&p.speed*throttle<0)acceleration*=2.1;p.speed+=acceleration*dt;p.speed*=Math.exp(-(input.brake?8:throttle?.3:1.15)*dt);p.speed=clamp(p.speed,-7,max);if(Math.abs(p.speed)<.04)p.speed=0;p.angle+=steer*(1.75+Math.min(Math.abs(p.speed)/12,1)*.7)*clamp(Math.abs(p.speed)/3,0,1)*Math.sign(p.speed||1)*dt;p.lean+=(steer*clamp(p.speed/26,-.2,.43)-p.lean)*Math.min(1,dt*8);return{x:Math.sin(p.angle)*p.speed*dt,z:Math.cos(p.angle)*p.speed*dt}}
  function vertical(p,dt,wasRamp){const ground=groundHeight(p.x,p.z),ramp=rampAt(p.x,p.z);if(wasRamp&&!ramp&&p.y>1&&Math.abs(p.speed)>7&&p.vy<=0)p.vy=5+Math.min(4,Math.abs(p.speed)*.14);p.vy-=20*dt;p.y+=p.vy*dt;if(p.y<=ground){p.y=ground;p.vy=0}return ground}
  // A binary heap keeps navigation fast on the larger map.
  function route(start,goal,objects){const step=2,key=(x,z)=>x+','+z,from=[Math.round(start.x/step),Math.round(start.z/step)],to=[Math.round(goal.x/step),Math.round(goal.z/step)],heap=[],cost=new Map(),came=new Map(),closed=new Set();
    function push(v){heap.push(v);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=v.f)break;heap[i]=heap[p];i=p}heap[i]=v}
    function pop(){const top=heap[0],v=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=v.f)break;heap[i]=heap[j];i=j}heap[i]=v}return top}
    if(blocked(goal.x,goal.z,objects))return[];const sk=key(...from);push({x:from[0],z:from[1],g:0,f:0});cost.set(sk,0);let end=null;
    for(let n=0;heap.length&&n<18000;n++){const c=pop(),k=key(c.x,c.z);if(closed.has(k))continue;closed.add(k);if(c.x===to[0]&&c.z===to[1]){end=k;break}for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=c.x+dx,z=c.z+dz,nk=key(x,z);if(closed.has(nk)||blocked(x*step,z*step,objects)||blocked((c.x+x)*step/2,(c.z+z)*step/2,objects)||(dx&&dz&&(blocked(x*step,c.z*step,objects)||blocked(c.x*step,z*step,objects))))continue;const g=c.g+Math.hypot(dx,dz);if(g<(cost.get(nk)??Infinity)){cost.set(nk,g);came.set(nk,k);push({x,z,g,f:g+Math.hypot(x-to[0],z-to[1])})}}}
    if(!end)return[];const path=[];while(came.has(end)){const[x,z]=end.split(',').map(Number);path.push({x:x*step,z:z*step});end=came.get(end)}path.reverse();path.push({x:goal.x,z:goal.z});return path}
  function advanceRace(race,p){if(!race.active)return false;const next=checkpoints[race.next];if(Math.hypot(p.x-next[0],p.z-next[1])>6)return false;race.passed++;if(race.passed===8){race.active=false;return 'finish'}race.next=(race.next+1)%8;return 'checkpoint'}
  const api={clamp,angleDelta,boundary,checkpoints,ramps,inside,contains,blocked,localPoint,groundHeight,rampAt,move,drive,vertical,route,advanceRace};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PenguinCore=api;
})(typeof window==='undefined'?{}:window);
