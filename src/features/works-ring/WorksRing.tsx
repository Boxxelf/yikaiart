import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { asset, featuredWorks } from '../../content/works';

const vertex = `varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const fragment = `precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec4 uCards[24];
uniform float uAngles[24];
uniform vec4 uLinks[12];
uniform sampler2D uAtlas;
uniform float uFluid;
uniform float uIntro;
uniform vec2 uMouse;
uniform float uHover;
vec2 local(vec2 p,int i){float a=uAngles[i];mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a));return r*(p-uCards[i].xy);}
float roundedBox(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return min(max(q.x,q.y),0.)+length(max(q,0.))-r;}
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
vec3 art(vec2 p,int i){vec2 b=max(uCards[i].zw,vec2(.1));vec2 uv=clamp(local(p,i)/(b*2.)+.5,vec2(.002),vec2(.998));float tile=mod(float(i)+(i>=12?5.:0.),12.);float col=mod(tile,4.);float row=floor(tile/4.);return texture2D(uAtlas,vec2((uv.x+col)/4.,(uv.y+(2.-row))/3.)).rgb;}
void main(){
 vec2 p=(vUv-.5)*uResolution;
 float d=100000.;float first=100000.;float second=100000.;vec3 col=vec3(0.);vec3 col2=vec3(0.);
 for(int i=0;i<24;i++){
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
 alpha*=uIntro;
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
    // The twelve extra cards fill the opening circle, then recede during the zoom.
    const cards = Array.from({ length: 24 }, () => new THREE.Vector4());
    const angles = new Float32Array(24);
    const links = Array.from({ length: 12 }, () => new THREE.Vector4());
    const uniforms = { uResolution: { value: new THREE.Vector2() }, uCards: { value: cards }, uAngles: { value: angles }, uLinks: { value: links }, uAtlas: { value: texture }, uFluid: { value: 0 }, uIntro: { value: 0 }, uMouse: { value: new THREE.Vector2(-1e4, -1e4) }, uHover: { value: 0 } };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthWrite: false });
    scene.add(new THREE.Mesh(geometry, material));
    const state = { rotation: props.initialIndex * Math.PI / 6, intro: 0, spread: 0, zoom: 0, energy: 0 };
    const title = host.querySelector('.works-intro-title');
    let opening = true;
    let width = 1, height = 1, hover = -1, lastIndex = props.initialIndex, frame = 0, lastTime = 0;
    let down = false, startX = 0, startY = 0, startRotation = 0, travel = 0, lastPointer = 0, dragVelocity = 0;
    let bounds = host.getBoundingClientRect();
    const resize = () => { bounds = host.getBoundingClientRect(); width = bounds.width; height = bounds.height; renderer.setSize(width, height); uniforms.uResolution.value.set(width, height); };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const tweens: gsap.core.Tween[] = [];
    let introTimeline: gsap.core.Timeline | undefined;
    const finishIntro = () => { opening = false; host.dataset.intro = 'false'; };
    const ready = () => {
      if (dead || introTimeline) return;
      // A direct link to an artwork should open immediately behind its dialog.
      if (latest.current.paused) { state.intro = 1; state.spread = 1; state.zoom = 1; finishIntro(); return; }
      introTimeline = gsap.timeline({ onComplete: finishIntro })
        .to(state, { intro: 1, duration: .28, ease: 'power2.out' })
        .to(state, { spread: 1, duration: 1.05, ease: 'power2.inOut' }, .2)
        .to(title, { opacity: 1, filter: 'blur(0px)', duration: .45, ease: 'power2.out' }, 1.05)
        .to(state, { zoom: 1, duration: 1.55, ease: 'power3.inOut' }, 1.75)
        .to(title, { opacity: 0, filter: 'blur(5px)', duration: .35 }, 2.15);
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
      } catch { if (!dead) latest.current.onFailure(); }
    };
    // Every image is visible in the opening circle; start only when the atlas is ready.
    void Promise.all(featuredWorks.map((_, i) => load(i))).then(() => { if (loaded === 12) ready(); });
    const indexFor = () => ((Math.round(state.rotation / (Math.PI / 6)) % 12) + 12) % 12;
    let wheelTarget = state.rotation, wheelTimeout: ReturnType<typeof setTimeout>;
    const rotate = (target: number, duration = .75) => {
      if (latest.current.paused || opening || loaded === 0) return;
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
      if (latest.current.paused || opening) return;
      e.preventDefault(); const delta = Math.max(-140, Math.min(140, Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX));
      if (Math.abs(delta) < 1) return;
      wheelTarget += delta * .0021;
      rotate(wheelTarget, .38);
      clearTimeout(wheelTimeout); wheelTimeout = setTimeout(() => { wheelTarget = Math.round(wheelTarget / (Math.PI / 6)) * Math.PI / 6; rotate(wheelTarget, .65); }, 160);
    };
    const pointerDown = (e: PointerEvent) => { if (latest.current.paused || opening) return; down = true; travel = 0; startX = e.clientX; startY = e.clientY; startRotation = state.rotation; lastPointer = e.clientY; gsap.killTweensOf(state, 'rotation'); host.setPointerCapture(e.pointerId); };
    const pointerMove = (e: PointerEvent) => {
      if (opening) return;
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
      const openingRadius = Math.min(height * .4, width * .25);
      const radius = THREE.MathUtils.lerp(openingRadius, Math.max(width * .92, height * 1.16), state.zoom);
      const size = THREE.MathUtils.lerp(openingRadius * .235, Math.min(width * .32, 600), state.zoom);
      const cx = THREE.MathUtils.lerp(width * .04, width * .06 - radius, state.zoom);
      for (let i = 0; i < 24; i++) {
        const extra = i >= 12;
        const slot = extra ? i - 12 + .5 : i;
        const relativeSlot = (slot - props.initialIndex + 18) % 12 - 6;
        const openingAngle = (relativeSlot * Math.PI / 6 + .8) * state.spread;
        const settledAngle = slot * Math.PI / 6 - state.rotation;
        // Keep angles on the same turn so the camera move never spins individual cards.
        const targetAngle = openingAngle + Math.atan2(Math.sin(settledAngle - openingAngle), Math.cos(settledAngle - openingAngle));
        const angle = THREE.MathUtils.lerp(openingAngle, targetAngle, state.zoom);
        const reveal = i === props.initialIndex ? 1 : gsap.utils.clamp(0, 1, state.spread * 3 - Math.abs(relativeSlot) * .16);
        const recede = extra ? 1 - THREE.MathUtils.smoothstep(state.zoom, .05, .8) : 1;
        const scale = (i === hover && !down && !opening ? 1.018 : 1) * reveal * recede;
        cards[i].set(cx + Math.cos(angle) * radius, Math.sin(angle) * radius, size / 2 * scale, size * .7 / 2 * scale);
        angles[i] = Math.atan2(Math.sin(angle), Math.cos(angle));
      }
      for (let i = 0; i < 12; i++) { const j = (i + 1) % 12; const a = edge(i, j), b = edge(j, i); links[i].set(a[0], a[1], b[0], b[1]); }
      uniforms.uIntro.value = state.intro; uniforms.uFluid.value = state.energy;
      const index = indexFor(); if (index !== lastIndex) { lastIndex = index; latest.current.onIndexChange(index); }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);
    return () => { dead = true; cancelAnimationFrame(frame); observer.disconnect(); clearTimeout(wheelTimeout); introTimeline?.kill(); gsap.killTweensOf(state); tweens.forEach(t => t.kill()); host.removeEventListener('wheel', wheel); host.removeEventListener('pointerdown', pointerDown); host.removeEventListener('pointermove', pointerMove); host.removeEventListener('pointerup', pointerUp); host.removeEventListener('pointercancel', pointerUp); host.removeEventListener('pointerleave', leave); renderer.domElement.removeEventListener('webglcontextlost', lost); geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); };
  }, []);
  return <div className="works-canvas" ref={ref} data-intro="true" tabIndex={0} aria-label="Artwork ring. Use left and right arrow keys, or scroll and drag to browse."><span className="works-intro-title" aria-hidden="true">YI KAI</span></div>;
}
