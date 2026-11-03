/* Small original software 3D renderer. Perspective camera, 3-axis geometry,
   face culling, near-plane clipping, depth ordering and directional lighting.
   Canvas rendering keeps the same world available without WebGL or a CDN. */
'use strict';
(() => {
  const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>mul(a,1/(Math.hypot(...a)||1));
  const light=norm([-1,2.7,1.5]),colorCache=new Map();
  function shade(hex,n,unlit=false){if(!hex.startsWith('#'))return hex;let b=unlit?1:.62+Math.max(0,dot(n,light))*.42;let k=hex+Math.round(b*100);if(colorCache.has(k))return colorCache.get(k);const c=parseInt(hex.slice(1),16),rgb=[c>>16,(c>>8)&255,c&255].map(v=>Math.min(255,Math.round(v*b)));let out=`rgb(${rgb.join(',')})`;colorCache.set(k,out);return out}
  function face(vertices,color,options={}){const normal=norm(cross(sub(vertices[1],vertices[0]),sub(vertices[2],vertices[0]))),center=mul(vertices.reduce(add,[0,0,0]),1/vertices.length);return{vertices,normal,center,color,paint:shade(color,normal,options.unlit),...options}}
  function polygon(vertices,color,options={}){return[face(vertices,color,options)]}
  function box(x,y,z,w,h,d,color,rotation=0){const raw=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,h,-d/2],[-w/2,h,-d/2],[-w/2,0,d/2],[w/2,0,d/2],[w/2,h,d/2],[-w/2,h,d/2]],c=Math.cos(rotation),s=Math.sin(rotation),v=raw.map(([a,b,e])=>[x+a*c+e*s,y+b,z-a*s+e*c]);return[[4,5,6,7],[1,0,3,2],[5,1,2,6],[0,4,7,3],[3,7,6,2],[0,1,5,4]].map((ids,i)=>face(ids.map(j=>v[j]),Array.isArray(color)?color[i%color.length]:color))}
  function cylinder(x,y,z,r0,r1,h,color,segments=10,rotation=0){const bottom=[],top=[];for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2+rotation;bottom.push([x+Math.sin(a)*r0,y,z+Math.cos(a)*r0]);top.push([x+Math.sin(a)*r1,y+h,z+Math.cos(a)*r1])}const faces=[];for(let i=0;i<segments;i++){let j=(i+1)%segments;faces.push(face([bottom[i],bottom[j],top[j],top[i]],color))}if(r1>0)faces.push(face(top,color));if(r0>0)faces.push(face([...bottom].reverse(),color));return faces}
  function sphere(x,y,z,rx,ry,rz,color,segments=10,rings=6){const v=[];for(let r=0;r<=rings;r++){const phi=r/rings*Math.PI;v.push(Array.from({length:segments},(_,s)=>{const theta=s/segments*Math.PI*2;return[x+Math.sin(phi)*Math.sin(theta)*rx,y+Math.cos(phi)*ry,z+Math.sin(phi)*Math.cos(theta)*rz]}))}const faces=[];for(let r=0;r<rings;r++)for(let s=0;s<segments;s++){let next=(s+1)%segments;const pts=r===0?[v[r][s],v[r+1][next],v[r+1][s]]:r===rings-1?[v[r][s],v[r][next],v[r+1][s]]:[v[r][s],v[r][next],v[r+1][next],v[r+1][s]];let f=face(pts,color);if(dot(f.normal,sub(f.center,[x,y,z]))<0)f=face([...pts].reverse(),color);faces.push(f)}return faces}
  function transform(faces,translation=[0,0,0],rotation=[0,0,0],scale=[1,1,1]){const[cx,sx,cy,sy,cz,sz]=[Math.cos(rotation[0]),Math.sin(rotation[0]),Math.cos(rotation[1]),Math.sin(rotation[1]),Math.cos(rotation[2]),Math.sin(rotation[2])];return faces.map(f=>face(f.vertices.map(v=>{let[x,y,z]=v.map((n,i)=>n*scale[i]);[y,z]=[y*cx-z*sx,y*sx+z*cx];[x,z]=[x*cy+z*sy,-x*sy+z*cy];[x,y]=[x*cz-y*sz,x*sz+y*cz];return[x+translation[0],y+translation[1],z+translation[2]]}),f.color,{unlit:f.unlit,doubleSide:f.doubleSide}))}
  function beam(a,b,width,color){const delta=sub(b,a),length=Math.hypot(...delta),up=norm(delta),right=norm(cross(up,Math.abs(up[1])>.9?[0,0,1]:[0,1,0])),front=cross(right,up),base=box(0,0,0,width,length,width,color);return base.map(f=>face(f.vertices.map(v=>add(a,add(add(mul(right,v[0]),mul(up,v[1])),mul(front,v[2])))),color))}
  class Camera{
    constructor(){this.target=[0,0,0];this.yaw=.7;this.elevation=.65;this.distance=65;this.cx=0;this.cy=0;this.focal=800;this.ortho=false;this.zoom=16;this.update()}
    update(){const h=Math.cos(this.elevation)*this.distance;this.eye=add(this.target,[Math.sin(this.yaw)*h,Math.sin(this.elevation)*this.distance,Math.cos(this.yaw)*h]);this.forward=norm(sub(this.target,this.eye));this.right=norm(cross(this.forward,[0,1,0]));this.up=cross(this.right,this.forward)}
    space(p){let r=sub(p,this.eye);return[dot(r,this.right),dot(r,this.up),dot(r,this.forward)]}
    screen(p){let scale=this.ortho?this.zoom:this.focal/p[2];return{x:this.cx+p[0]*scale,y:this.cy-p[1]*scale,depth:p[2],scale}}
    project(p){return this.screen(this.space(p))}
    ground(x,y,height=0){const nx=(x-this.cx)/this.focal,ny=-(y-this.cy)/this.focal,dir=norm(add(this.forward,add(mul(this.right,nx),mul(this.up,ny))));if(Math.abs(dir[1])<.001)return null;let t=(height-this.eye[1])/dir[1];if(t<0)return null;return add(this.eye,mul(dir,t))}
  }
  function clipNear(points){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ina=a[2]>=.5,inb=b[2]>=.5;if(ina)out.push(a);if(ina!==inb){const t=(.5-a[2])/(b[2]-a[2]);out.push(add(a,mul(sub(b,a),t)))}}return out}
  class Renderer{
    constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});this.width=0;this.height=0}
    resize(w,h){this.width=w;this.height=h;const d=Math.min(devicePixelRatio||1,1.7);this.canvas.width=Math.round(w*d);this.canvas.height=Math.round(h*d);this.ctx.setTransform(d,0,0,d,0,0)}
    clear(){this.ctx.clearRect(0,0,this.width,this.height)}
    render(faces,camera,{sort=true}={}){const queue=[];for(const f of faces){if(!f.doubleSide&&dot(f.normal,sub(camera.eye,f.center))<-.001)continue;let pts=clipNear(f.vertices.map(v=>camera.space(v)));if(pts.length<3)continue;const depth=pts.reduce((s,p)=>s+p[2],0)/pts.length;pts=pts.map(p=>camera.screen(p));if(pts.every(p=>p.x<0)||pts.every(p=>p.x>this.width)||pts.every(p=>p.y<0)||pts.every(p=>p.y>this.height))continue;queue.push({pts,depth,paint:f.paint})}if(sort)queue.sort((a,b)=>b.depth-a.depth);const c=this.ctx;c.lineJoin='round';for(const f of queue){c.beginPath();f.pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=f.paint;c.fill();if(!f.paint.startsWith('rgba')){c.strokeStyle=f.paint;c.lineWidth=.45;c.stroke()}}return queue.length}
  }
  window.Soft3D={Camera,Renderer,face,box,cylinder,sphere,polygon,transform,beam,add,sub,mul,dot,norm,cross};
})();
