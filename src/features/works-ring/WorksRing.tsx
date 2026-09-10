import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { asset, featuredWorks } from '../../content/works';

const vertex = `varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const fragment = `precision highp float;
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
}`;

type Props = { initialIndex: number; onIndexChange: (i: number) => void; onOpen: (i: number) => void; controls: MutableRefObject<(d: number) => void>; paused: boolean; onFailure: () => void };
export default function WorksRing(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef(props); latest.current = props;
  useEffect(() => {
    const host = ref.current!;
    let dead = false;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }); }
    catch { latest.current.onFailure(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setClearColor(0xfcfaf5, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);
    const lost = (e: Event) => { e.preventDefault(); latest.current.onFailure(); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    const scene = new THREE.Scene(); const camera = new THREE.Camera();
    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = 4 * 640; atlasCanvas.height = 3 * 448;
    const ctx = atlasCanvas.getContext('2d')!;
    ctx.fillStyle = '#FCFAF5'; ctx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
    const texture = new THREE.CanvasTexture(atlasCanvas); texture.colorSpace = THREE.NoColorSpace;
    texture.minFilter = THREE.LinearFilter; texture.generateMipmaps = false;
    const cards = Array.from({ length: 12 }, () => new THREE.Vector4());
    const angles = new Float32Array(12);
    const links = Array.from({ length: 12 }, () => new THREE.Vector4());
    const uniforms = { uResolution: { value: new THREE.Vector2() }, uCards: { value: cards }, uAngles: { value: angles }, uLinks: { value: links }, uAtlas: { value: texture }, uFluid: { value: 0 }, uIntro: { value: 0 }, uMouse: { value: new THREE.Vector2(-1e4, -1e4) }, uHover: { value: 0 } };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthWrite: false });
    scene.add(new THREE.Mesh(geometry, material));
    const state = { rotation: props.initialIndex * Math.PI / 6, intro: 0, spread: 0, energy: 0 };
    let width = 1, height = 1, hover = -1, lastIndex = props.initialIndex, frame = 0, lastTime = 0;
    let down = false, startX = 0, startY = 0, startRotation = 0, travel = 0, lastPointer = 0, dragVelocity = 0;
    let bounds = host.getBoundingClientRect();
    const resize = () => { bounds = host.getBoundingClientRect(); width = bounds.width; height = bounds.height; renderer.setSize(width, height); uniforms.uResolution.value.set(width, height); };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const tweens: gsap.core.Tween[] = [];
    let introTimeline: gsap.core.Timeline | undefined;
    const firstSeen = sessionStorage.getItem('yikai-ring-seen') === '1';
    const ready = () => {
      if (dead || introTimeline) return;
      sessionStorage.setItem('yikai-ring-seen', '1');
      if (firstSeen) { state.intro = 1; state.spread = 1; return; }
      introTimeline = gsap.timeline().to(state, { intro: 1, duration: .9, ease: 'power2.out' }).to(state, { spread: 1, energy: .7, duration: 1.5, ease: 'power3.inOut' }, .55).to(state, { energy: 0, duration: .7 }, 1.8);
    };
    let loaded = 0;
    const load = async (i: number) => {
      const img = new Image(); img.decoding = 'async';
      const loadedImage = new Promise<HTMLImageElement>((resolve, reject) => { img.onload = () => resolve(img); img.onerror = reject; });
      img.src = asset(featuredWorks[i].image.medium);
      try {
        await loadedImage; if (dead) return;
        const cw = 640, ch = 448;
        const ratio = Math.max(cw / img.width, ch / img.height);
        const sw = cw / ratio, sh = ch / ratio;
        ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, i % 4 * cw, Math.floor(i / 4) * ch, cw, ch);
        texture.needsUpdate = true; loaded++;
        if (i === props.initialIndex) ready();
      } catch { if (!dead) latest.current.onFailure(); }
    };
    const prioritized = [props.initialIndex, (props.initialIndex + 1) % 12, (props.initialIndex + 11) % 12];
    void (async () => { await Promise.all(prioritized.map(load)); for (let i = 0; i < 12 && !dead; i++) if (!prioritized.includes(i)) await load(i); })();
    const indexFor = () => ((Math.round(state.rotation / (Math.PI / 6)) % 12) + 12) % 12;
    let wheelTarget = state.rotation, wheelTimeout: ReturnType<typeof setTimeout>;
    const rotate = (target: number, duration = .75) => {
      if (latest.current.paused || loaded === 0) return;
      wheelTarget = target;
      gsap.killTweensOf(state, 'rotation,energy');
      tweens.push(gsap.to(state, { rotation: target, energy: .75, duration, ease: 'power3.out', onComplete: () => { gsap.to(state, { energy: 0, duration: .6 }); } }));
    };
    props.controls.current = delta => rotate((Math.round(state.rotation / (Math.PI / 6)) + delta) * Math.PI / 6);
    const hit = (x: number, y: number) => {
      for (let i = 0; i < 12; i++) { const c = cards[i]; const a = -angles[i]; const dx = x - c.x, dy = y - c.y; const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a); if (Math.abs(lx) < c.z && Math.abs(ly) < c.w) return i; } return -1;
    };
    const position = (e: PointerEvent) => [e.clientX - bounds.left - width / 2, height / 2 - (e.clientY - bounds.top)];
    const wheel = (e: WheelEvent) => {
      if (latest.current.paused) return;
      e.preventDefault(); const delta = Math.max(-140, Math.min(140, Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX));
      if (Math.abs(delta) < 1) return;
      wheelTarget += delta * .0021;
      rotate(wheelTarget, .38);
      clearTimeout(wheelTimeout); wheelTimeout = setTimeout(() => { wheelTarget = Math.round(wheelTarget / (Math.PI / 6)) * Math.PI / 6; rotate(wheelTarget, .65); }, 160);
    };
    const pointerDown = (e: PointerEvent) => { if (latest.current.paused) return; down = true; travel = 0; startX = e.clientX; startY = e.clientY; startRotation = state.rotation; lastPointer = e.clientY; gsap.killTweensOf(state, 'rotation'); host.setPointerCapture(e.pointerId); };
    const pointerMove = (e: PointerEvent) => {
      const [x, y] = position(e); uniforms.uMouse.value.set(x, y); hover = hit(x, y); host.style.cursor = down ? 'grabbing' : hover >= 0 ? 'pointer' : 'grab';
      if (down) { travel = Math.hypot(e.clientX - startX, e.clientY - startY); state.rotation = startRotation + ((e.clientY - startY) + (startX - e.clientX) * .65) / (width * .73); dragVelocity = (e.clientY - lastPointer) / width; lastPointer = e.clientY; state.energy = .8; }
    };
    const pointerUp = (e: PointerEvent) => {
      if (!down) return; down = false;
      if (travel < 7) { const [x, y] = position(e); const i = hit(x, y); if (i >= 0) { if (i === indexFor()) latest.current.onOpen(i); else { let difference = (i - indexFor() + 18) % 12 - 6; rotate(state.rotation + difference * Math.PI / 6); } } }
      else rotate(Math.round((state.rotation + dragVelocity * 8) / (Math.PI / 6)) * Math.PI / 6);
      wheelTarget = state.rotation;
    };
    const leave = () => { hover = -1; uniforms.uMouse.value.set(-1e4, -1e4); };
    host.addEventListener('wheel', wheel, { passive: false }); host.addEventListener('pointerdown', pointerDown); host.addEventListener('pointermove', pointerMove); host.addEventListener('pointerup', pointerUp); host.addEventListener('pointercancel', pointerUp); host.addEventListener('pointerleave', leave);
    const edge = (i: number, j: number) => {
      const a = cards[i], b = cards[j]; const dx = b.x - a.x, dy = b.y - a.y; const angle = angles[i];
      const lx = dx * Math.cos(angle) + dy * Math.sin(angle), ly = -dx * Math.sin(angle) + dy * Math.cos(angle);
      const k = Math.min(a.z / Math.max(Math.abs(lx), .001), a.w / Math.max(Math.abs(ly), .001));
      return [a.x + dx * k * .96, a.y + dy * k * .96];
    };
    const render = (time: number) => {
      if (dead) return; frame = requestAnimationFrame(render);
      if (document.hidden || latest.current.paused || time - lastTime < 24) return;
      lastTime = time;
      const size = Math.min(width * .32, 600), h = size * .7;
      const radius = Math.max(width * .92, height * 1.16), frontX = width * .56 - width / 2;
      const cx = frontX - radius;
      for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6 - state.rotation;
        const spread = i === props.initialIndex ? 1 : gsap.utils.clamp(0, 1, state.spread * 1.35 - Math.abs((i - props.initialIndex + 18) % 12 - 6) * .055);
        const finalX = cx + Math.cos(angle) * radius;
        const finalY = Math.sin(angle) * radius;
        const scale = i === hover && !down ? 1.018 : 1;
        cards[i].set(THREE.MathUtils.lerp(frontX, finalX, state.spread), THREE.MathUtils.lerp(0, finalY, state.spread), size / 2 * spread * scale, h / 2 * spread * scale);
        angles[i] = Math.atan2(Math.sin(angle), Math.cos(angle)) * state.spread;
      }
      for (let i = 0; i < 12; i++) { const j = (i + 1) % 12; const a = edge(i, j), b = edge(j, i); links[i].set(a[0], a[1], b[0], b[1]); }
      uniforms.uIntro.value = state.intro; uniforms.uFluid.value = state.energy;
      const index = indexFor(); if (index !== lastIndex) { lastIndex = index; latest.current.onIndexChange(index); }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);
    return () => { dead = true; cancelAnimationFrame(frame); observer.disconnect(); clearTimeout(wheelTimeout); introTimeline?.kill(); gsap.killTweensOf(state); tweens.forEach(t => t.kill()); host.removeEventListener('wheel', wheel); host.removeEventListener('pointerdown', pointerDown); host.removeEventListener('pointermove', pointerMove); host.removeEventListener('pointerup', pointerUp); host.removeEventListener('pointercancel', pointerUp); host.removeEventListener('pointerleave', leave); renderer.domElement.removeEventListener('webglcontextlost', lost); geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); };
  }, []);
  return <div className="works-canvas" ref={ref} tabIndex={0} aria-label="Artwork ring. Use left and right arrow keys, or scroll and drag to browse." />;
}
