import{r as W,j as we}from"./index--OgQa_6K.js";import{W as Me,S as be,C as ye,a as Ie,N as Ce,L as Ee,V as he,P as ke,b as Fe,c as fe,M as Le,d as me}from"./three-BqG5kYCs.js";import{g}from"./motion-xgxdCp6f.js";import{a as Pe,f as Re}from"./hooks-7zW7wzhp.js";const Ae=`varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,Se=`precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec4 uCards[12];
uniform float uAngles[12];
uniform vec4 uLinks[12];
uniform sampler2D uAtlas;
uniform float uFluid;
uniform float uIntro;
uniform vec2 uMouse;
uniform float uHover;
vec2 local(vec2 p,int i){float a=uAngles[i];mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a));return r*(p-uCards[i].xy);}
float roundedBox(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return min(max(q.x,q.y),0.)+length(max(q,0.))-r;}
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
vec3 art(vec2 p,int i){vec2 b=max(uCards[i].zw,vec2(.1));vec2 uv=clamp(local(p,i)/(b*2.)+.5,vec2(.002),vec2(.998));float col=mod(float(i),4.);float row=floor(float(i)/4.);return texture2D(uAtlas,vec2((uv.x+col)/4.,(uv.y+(2.-row))/3.)).rgb;}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 p=(vUv-.5)*uResolution;
 float d=100000.;float first=100000.;float second=100000.;vec3 col=vec3(0.);vec3 col2=vec3(0.);
 for(int i=0;i<12;i++){
  if(uCards[i].z<1.)continue;
  float di=roundedBox(local(p,i),uCards[i].zw,6.);
  if(di<first){second=first;col2=col;first=di;col=art(p,i);}else if(di<second){second=di;col2=art(p,i);}
  d=smin(d,di,12.+uFluid*12.);
 }
 vec3 color=mix(col,col2,.5*exp(-abs(second-first)/15.));
 if(uFluid>.005){
  for(int i=0;i<12;i++){
   vec2 a=uLinks[i].xy;vec2 b=uLinks[i].zw;vec2 ba=b-a;
   float t=clamp(dot(p-a,ba)/max(dot(ba,ba),1.),0.,1.);
   vec2 center=mix(a,b,t);center.x-=sin(t*3.14159265)*uFluid*11.;
   float width=(1.2+9.*pow(abs(t-.5)*2.,3.))*uFluid;
   float dl=length(p-center)-width;
   d=smin(d,dl,14.*uFluid+.1);
  }
 }
 float alpha=1.-smoothstep(-1.,1.,d);
 if(uIntro<.999){
  float cell=mix(16.,3.,uIntro);vec2 grid=floor(p/cell);
  float threshold=hash(grid);float reveal=smoothstep(threshold-.12,threshold+.12,uIntro*1.3);
  vec2 dotPosition=mod(p,cell)-cell*.5;
  float grain=1.-smoothstep(cell*.17,cell*.4,length(dotPosition));
  alpha*=mix(grain*reveal,1.,smoothstep(.65,1.,uIntro));
 }
 gl_FragColor=vec4(color,alpha);
}`;function Ue(d){const D=W.useRef(null),f=W.useRef(d);return f.current=d,W.useEffect(()=>{const s=D.current;let x=!1,c;try{c=new Me({alpha:!0,antialias:!0,powerPreference:"high-performance"})}catch{f.current.onFailure();return}c.setPixelRatio(Math.min(window.devicePixelRatio,1.7)),c.setClearColor(16579317,0),c.domElement.setAttribute("aria-hidden","true"),s.appendChild(c.domElement);const j=e=>{e.preventDefault(),f.current.onFailure()};c.domElement.addEventListener("webglcontextlost",j);const B=new be,ve=new ye,w=document.createElement("canvas");w.width=4*640,w.height=3*448;const A=w.getContext("2d");A.fillStyle="#FCFAF5",A.fillRect(0,0,w.width,w.height);const M=new Ie(w);M.colorSpace=Ce,M.minFilter=Ee,M.generateMipmaps=!1;const I=Array.from({length:12},()=>new he),F=new Float32Array(12),V=Array.from({length:12},()=>new he),b={uResolution:{value:new fe},uCards:{value:I},uAngles:{value:F},uLinks:{value:V},uAtlas:{value:M},uFluid:{value:0},uIntro:{value:0},uMouse:{value:new fe(-1e4,-1e4)},uHover:{value:0}},N=new ke(2,2),G=new Fe({vertexShader:Ae,fragmentShader:Se,uniforms:b,transparent:!0,depthWrite:!1});B.add(new Le(N,G));const n={rotation:d.initialIndex*Math.PI/6,intro:0,spread:0,energy:0};let m=1,C=1,L=-1,H=d.initialIndex,S=0,_=0,y=!1,z=0,T=0,J=0,Y=0,X=0,K=0,E=s.getBoundingClientRect();const Q=()=>{E=s.getBoundingClientRect(),m=E.width,C=E.height,c.setSize(m,C),b.uResolution.value.set(m,C)},Z=new ResizeObserver(Q);Z.observe(s),Q();const $=[];let U;const pe=sessionStorage.getItem("yikai-ring-seen")==="1",ge=()=>{if(!(x||U)){if(sessionStorage.setItem("yikai-ring-seen","1"),pe){n.intro=1,n.spread=1;return}U=g.timeline().to(n,{intro:1,duration:.9,ease:"power2.out"}).to(n,{spread:1,energy:.7,duration:1.5,ease:"power3.inOut"},.55).to(n,{energy:0,duration:.7},1.8)}};let ee=0;const te=async e=>{const t=new Image;t.decoding="async";const r=new Promise((a,i)=>{t.onload=()=>a(t),t.onerror=i});t.src=Pe(Re[e].image.medium);try{if(await r,x)return;const a=640,i=448,u=Math.max(a/t.width,i/t.height),l=a/u,o=i/u;A.drawImage(t,(t.width-l)/2,(t.height-o)/2,l,o,e%4*a,Math.floor(e/4)*i,a,i),M.needsUpdate=!0,ee++,e===d.initialIndex&&ge()}catch{x||f.current.onFailure()}},ne=[d.initialIndex,(d.initialIndex+1)%12,(d.initialIndex+11)%12];(async()=>{await Promise.all(ne.map(te));for(let e=0;e<12&&!x;e++)ne.includes(e)||await te(e)})();const q=()=>(Math.round(n.rotation/(Math.PI/6))%12+12)%12;let p=n.rotation,O;const k=(e,t=.75)=>{f.current.paused||ee===0||(p=e,g.killTweensOf(n,"rotation,energy"),$.push(g.to(n,{rotation:e,energy:.75,duration:t,ease:"power3.out",onComplete:()=>{g.to(n,{energy:0,duration:.6})}})))};d.controls.current=e=>k((Math.round(n.rotation/(Math.PI/6))+e)*Math.PI/6);const ae=(e,t)=>{for(let r=0;r<12;r++){const a=I[r],i=-F[r],u=e-a.x,l=t-a.y,o=u*Math.cos(i)-l*Math.sin(i),h=u*Math.sin(i)+l*Math.cos(i);if(Math.abs(o)<a.z&&Math.abs(h)<a.w)return r}return-1},oe=e=>[e.clientX-E.left-m/2,C/2-(e.clientY-E.top)],re=e=>{if(f.current.paused)return;e.preventDefault();const t=Math.max(-140,Math.min(140,Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX));Math.abs(t)<1||(p+=t*.0021,k(p,.38),clearTimeout(O),O=setTimeout(()=>{p=Math.round(p/(Math.PI/6))*Math.PI/6,k(p,.65)},160))},ie=e=>{f.current.paused||(y=!0,Y=0,z=e.clientX,T=e.clientY,J=n.rotation,X=e.clientY,g.killTweensOf(n,"rotation"),s.setPointerCapture(e.pointerId))},se=e=>{const[t,r]=oe(e);b.uMouse.value.set(t,r),L=ae(t,r),s.style.cursor=y?"grabbing":L>=0?"pointer":"grab",y&&(Y=Math.hypot(e.clientX-z,e.clientY-T),n.rotation=J+(e.clientY-T+(z-e.clientX)*.65)/(m*.73),K=(e.clientY-X)/m,X=e.clientY,n.energy=.8)},P=e=>{if(y){if(y=!1,Y<7){const[t,r]=oe(e),a=ae(t,r);if(a>=0)if(a===q())f.current.onOpen(a);else{let i=(a-q()+18)%12-6;k(n.rotation+i*Math.PI/6)}}else k(Math.round((n.rotation+K*8)/(Math.PI/6))*Math.PI/6);p=n.rotation}},le=()=>{L=-1,b.uMouse.value.set(-1e4,-1e4)};s.addEventListener("wheel",re,{passive:!1}),s.addEventListener("pointerdown",ie),s.addEventListener("pointermove",se),s.addEventListener("pointerup",P),s.addEventListener("pointercancel",P),s.addEventListener("pointerleave",le);const ce=(e,t)=>{const r=I[e],a=I[t],i=a.x-r.x,u=a.y-r.y,l=F[e],o=i*Math.cos(l)+u*Math.sin(l),h=-i*Math.sin(l)+u*Math.cos(l),v=Math.min(r.z/Math.max(Math.abs(o),.001),r.w/Math.max(Math.abs(h),.001));return[r.x+i*v*.96,r.y+u*v*.96]},de=e=>{if(x||(S=requestAnimationFrame(de),document.hidden||f.current.paused||e-_<24))return;_=e;const t=Math.min(m*.32,600),r=t*.7,a=Math.max(m*.92,C*1.16),i=m*.56-m/2,u=i-a;for(let o=0;o<12;o++){const h=o*Math.PI/6-n.rotation,v=o===d.initialIndex?1:g.utils.clamp(0,1,n.spread*1.35-Math.abs((o-d.initialIndex+18)%12-6)*.055),R=u+Math.cos(h)*a,xe=Math.sin(h)*a,ue=o===L&&!y?1.018:1;I[o].set(me.lerp(i,R,n.spread),me.lerp(0,xe,n.spread),t/2*v*ue,r/2*v*ue),F[o]=Math.atan2(Math.sin(h),Math.cos(h))*n.spread}for(let o=0;o<12;o++){const h=(o+1)%12,v=ce(o,h),R=ce(h,o);V[o].set(v[0],v[1],R[0],R[1])}b.uIntro.value=n.intro,b.uFluid.value=n.energy;const l=q();l!==H&&(H=l,f.current.onIndexChange(l)),c.render(B,ve)};return S=requestAnimationFrame(de),()=>{x=!0,cancelAnimationFrame(S),Z.disconnect(),clearTimeout(O),U?.kill(),g.killTweensOf(n),$.forEach(e=>e.kill()),s.removeEventListener("wheel",re),s.removeEventListener("pointerdown",ie),s.removeEventListener("pointermove",se),s.removeEventListener("pointerup",P),s.removeEventListener("pointercancel",P),s.removeEventListener("pointerleave",le),c.domElement.removeEventListener("webglcontextlost",j),N.dispose(),G.dispose(),M.dispose(),c.dispose(),c.forceContextLoss(),c.domElement.remove()}},[]),we.jsx("div",{className:"works-canvas",ref:D,tabIndex:0,"aria-label":"Artwork ring. Use left and right arrow keys, or scroll and drag to browse."})}export{Ue as default};
