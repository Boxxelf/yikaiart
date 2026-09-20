import { useEffect, useRef, type RefObject, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { MemoryPhase } from './useMemorySequence';

type Props = {
  screen: RefObject<HTMLDivElement | null>; slot: RefObject<HTMLDivElement | null>;
  progress: MutableRefObject<{value:number}>; phase: MemoryPhase; image: HTMLImageElement|null;
  interaction: RefObject<HTMLElement | null>; viewReset: number; rotateStep: number;
  origin: RefObject<HTMLElement | null>;
  hasMemory: boolean; reduced: boolean; paused: boolean; onFailure:()=>void; onReady:()=>void;
};
// Project the real display corners onto a DOM plane, so readable text stays inside the housing.
function placeScreen(element: HTMLElement, points: THREE.Vector2[]) {
  const [p0,p1,p2,p3]=points;
  const dx1=p1.x-p2.x,dx2=p3.x-p2.x,dx3=p0.x-p1.x+p2.x-p3.x;
  const dy1=p1.y-p2.y,dy2=p3.y-p2.y,dy3=p0.y-p1.y+p2.y-p3.y;
  const det=dx1*dy2-dx2*dy1;
  if(Math.abs(det)<.001)return;
  const g=(dx3*dy2-dx2*dy3)/det,h=(dx1*dy3-dx3*dy1)/det;
  const a=p1.x-p0.x+g*p1.x,b=p3.x-p0.x+h*p3.x;
  const d=p1.y-p0.y+g*p1.y,e=p3.y-p0.y+h*p3.y;
  element.style.transform=`matrix3d(${a/640},${d/640},0,${g/640},${b/502},${e/502},0,${h/502},0,0,1,0,${p0.x},${p0.y},0,1)`;
  const scale=p0.distanceTo(p1)/640;
  element.style.setProperty('--screen-font',`${Math.min(36,13/scale)}px`);
}
export default function MemoryComputer(props:Props) {
  const hostRef=useRef<HTMLDivElement>(null);
  const latest=useRef(props);latest.current=props;
  useEffect(()=>{
    const host=hostRef.current!;
    let renderer:THREE.WebGLRenderer;
    try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});} catch {latest.current.onFailure();return;}
    let dead=false,frame=0,w=1,h=1,last=0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
    renderer.localClippingEnabled=true;
    renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
    const lost=(e:Event)=>{e.preventDefault();latest.current.onFailure();};
    renderer.domElement.addEventListener('webglcontextlost',lost);
    const scene=new THREE.Scene();renderer.setClearColor(0x000000,0);
    const camera=new THREE.PerspectiveCamera(35,1,.1,80);
    const computer=new THREE.Group();scene.add(computer);
    const shell=new THREE.MeshStandardMaterial({color:'#d4cfbf',roughness:.53,metalness:.12});
    const ivory=new THREE.MeshStandardMaterial({color:'#e7e2d6',roughness:.65});
    const recess=new THREE.MeshStandardMaterial({color:'#282b28',roughness:.75});
    const metal=new THREE.MeshStandardMaterial({color:'#77796f',roughness:.38,metalness:.8});
    const boxes:THREE.BufferGeometry[]=[];
    function box(width:number,height:number,depth:number,x:number,y:number,z:number,mat:THREE.Material=shell,radius=.035) {
      const geo=new RoundedBoxGeometry(width,height,depth,2,Math.min(radius,width/4,height/4,depth/4));boxes.push(geo);
      const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;computer.add(mesh);return mesh;
    }
    // Opaque CRT enclosure with a recessed screen and thick, rounded ivory bezel.
    box(3.8,.68,2.8,0,.67,0);box(3.85,.12,2.85,0,.29,0,recess);
    box(3.87,.13,2.89,0,1.05,0,ivory);
    box(3.78,3.08,2.48,0,2.52,-.10,shell,.16);
    for(const x of [-1.77,1.77])box(.29,2.98,.20,x,2.52,1.19,ivory,.065);
    for(const y of [1.10,3.94])box(3.70,.29,.20,0,y,1.19,ivory,.065);
    box(3.38,2.68,.08,0,2.5,1.25,recess,.055);
    for(let i=0;i<16;i++)box(.018,.045,1.25,1.899,1.65+i*.12,-.30,recess,.006);
    // Slot is a dark cutout surrounded by a physical bezel.
    box(1.33,.20,.045,.67,.70,1.42,metal,.012);
    box(1.19,.067,.025,.67,.70,1.452,recess,.004);
    box(.13,.15,.035,1.46,.69,1.435,ivory,.01);
    const ledMaterial=new THREE.MeshStandardMaterial({color:'#b94132',emissive:'#d94c25',emissiveIntensity:.5,roughness:.35});
    box(.06,.045,.04,-1.47,.70,1.43,ledMaterial,.009);
    // The vent bank ends at x=-.35; the drive bezel begins at x=.005.
    for(let i=0;i<10;i++)box(.023,.23,.012,-1.07+i*.078,.67,1.412,recess,.003);
    for(let i=0;i<14;i++)box(.012,.025,1.4,1.91,.48+i*.026,-.15,recess,.003);
    // Keyboard wedge and individual keycaps.
    const keyboard=box(3.55,.18,1.38,0,.25,2.13,shell,.07);keyboard.rotation.x=.08;
    box(3.32,.06,1.15,0,.36,2.13,recess,.025);
    const keyGeo=new RoundedBoxGeometry(.205,.105,.22,2,.018);boxes.push(keyGeo);
    const keyMat=new THREE.MeshStandardMaterial({color:'#e8e3d5',roughness:.62});
    const keys=new THREE.InstancedMesh(keyGeo,keyMat,52);keys.castShadow=true;keys.receiveShadow=true;computer.add(keys);
    const temp=new THREE.Object3D();let ki=0;
    for(let row=0;row<4;row++)for(let col=0;col<13;col++){
      temp.position.set(-1.46+col*.241,.42,1.72+row*.257);temp.rotation.x=.08;temp.updateMatrix();keys.setMatrixAt(ki++,temp.matrix);
    }
    box(1.3,.10,.18,0,.43,2.67,ivory,.02);
    // Tiny key legends and a bespoke identity plate, made with canvas rather than external assets.
    const labels=document.createElement('canvas');labels.width=1024;labels.height=400;
    const lc=labels.getContext('2d')!;lc.clearRect(0,0,1024,400);lc.fillStyle='#42443b';lc.textAlign='center';lc.font='22px monospace';
    const rows=['1234567890−=⌫','QWERTYUIOP[ ]','ASDFGHJKL;  ↵','ZXCVBNM,./  ↑'];
    rows.forEach((r,ri)=>[...r].slice(0,13).forEach((c,ci)=>lc.fillText(c,45+ci*77,40+ri*93)));
    const labelTex=new THREE.CanvasTexture(labels);const labelMat=new THREE.MeshBasicMaterial({map:labelTex,transparent:true,depthWrite:false});
    const legend=new THREE.Mesh(new THREE.PlaneGeometry(3.13,1.04),labelMat);legend.rotation.x=-Math.PI/2;legend.position.set(0,.48,2.12);computer.add(legend);
    const badgeCanvas=document.createElement('canvas');badgeCanvas.width=512;badgeCanvas.height=96;
    const bc=badgeCanvas.getContext('2d')!;bc.fillStyle='#262923';bc.font='500 44px sans-serif';bc.fillText('YI KAI',20,58);bc.font='17px sans-serif';bc.fillText('MEMORY TERMINAL',192,55);
    const badgeTex=new THREE.CanvasTexture(badgeCanvas);const badgeMat=new THREE.MeshBasicMaterial({map:badgeTex,transparent:true});
    const badge=new THREE.Mesh(new THREE.PlaneGeometry(1.58,.30),badgeMat);badge.position.set(-.91,.9,1.413);computer.add(badge);
    // A single buffered particle field; particles never replace the original photograph.
    const count=1800,pos=new Float32Array(count*3),colors=new Float32Array(count*3),seed=new Float32Array(count*3);
    const palette=['#e0aa85','#668fb8','#d9cec1','#b84131','#86a999'].map(c=>new THREE.Color(c));
    for(let i=0;i<count;i++){
      seed[i*3]=(Math.random()-.5)*3.15;seed[i*3+1]=Math.random();seed[i*3+2]=(Math.random()-.5)*2.1;
      const col=palette[i%palette.length];col.toArray(colors,i*3);
    }
    const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));particleGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    const particleMat=new THREE.PointsMaterial({size:.025,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,sizeAttenuation:true});
    const particles=new THREE.Points(particleGeo,particleMat);computer.add(particles);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=.1;floor.receiveShadow=true;scene.add(floor);
    scene.add(new THREE.HemisphereLight('#eee8d8','#45463a',2.1));
    const keyLight=new THREE.DirectionalLight('#fff0d8',3.8);keyLight.position.set(-4,9,6);keyLight.castShadow=true;keyLight.shadow.mapSize.set(1024,1024);keyLight.shadow.camera.left=-7;keyLight.shadow.camera.right=7;keyLight.shadow.camera.top=7;keyLight.shadow.camera.bottom=-7;keyLight.shadow.normalBias=.025;keyLight.shadow.bias=-.0002;scene.add(keyLight);
    const rim=new THREE.DirectionalLight('#c0d7df',1.4);rim.position.set(6,5,-5);scene.add(rim);
    let card:THREE.Mesh<THREE.PlaneGeometry,THREE.MeshStandardMaterial>|null=null,lastImage:HTMLImageElement|null=null;
    const clipping=new THREE.Plane(new THREE.Vector3(0,0,1),-1.47);
    function createCard(img:HTMLImageElement) {
      if(card){computer.remove(card);card.geometry.dispose();card.material.map?.dispose();card.material.dispose();}
      const cv=document.createElement('canvas');cv.width=600;cv.height=720;const c=cv.getContext('2d')!;c.fillStyle='#faf7ee';c.fillRect(0,0,600,720);
      const ratio=Math.min(550/img.naturalWidth,570/img.naturalHeight);const iw=img.naturalWidth*ratio,ih=img.naturalHeight*ratio;c.drawImage(img,(600-iw)/2,25+(570-ih)/2,iw,ih);
      c.fillStyle='#272a26';c.font='26px sans-serif';c.fillText('YI KAI',30,660);c.font='16px sans-serif';c.fillText('A moment from the archive',30,693);
      const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;
      card=new THREE.Mesh(new THREE.PlaneGeometry(1,1.2),new THREE.MeshStandardMaterial({map:texture,side:THREE.DoubleSide,roughness:.8,clippingPlanes:[]}));card.castShadow=true;computer.add(card);
    }
    const surface=props.interaction.current!;
    let yaw=props.hasMemory?0:.32,pitch=props.hasMemory?0:.12,targetYaw=yaw,targetPitch=pitch;
    let seenReset=props.viewReset,seenRotate=props.rotateStep,wasActive=false,suppressClick=false;
    let pointer:{id:number;x:number;y:number;yaw:number;pitch:number;moved:boolean}|null=null;
    const resetView=()=>{targetYaw=Math.round(yaw/(Math.PI*2))*Math.PI*2;targetPitch=0;};
    const stopPointer=()=>{if(pointer&&surface.hasPointerCapture(pointer.id))surface.releasePointerCapture(pointer.id);pointer=null;surface.classList.remove('is-rotating');};
    const down=(event:PointerEvent)=>{
      if(!event.isPrimary||event.button!==0)return;
      const p=latest.current;
      if(p.paused||['loading','inserting','revealing'].includes(p.phase))return;
      const target=event.target as Element;
      if(!target.closest('.memory-webgl,.memory-display,.memory-slot-target'))return;
      suppressClick=false;
      pointer={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:targetYaw,pitch:targetPitch,moved:false};
    };
    const move=(event:PointerEvent)=>{
      if(!pointer||pointer.id!==event.pointerId)return;
      const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
      if(!pointer.moved&&Math.hypot(dx,dy)<6)return;
      pointer.moved=true;surface.setPointerCapture(event.pointerId);surface.classList.add('is-rotating');
      targetYaw=pointer.yaw-dx*.008;targetPitch=THREE.MathUtils.clamp(pointer.pitch+dy*.005,-.06,.55);
      event.preventDefault();
    };
    const up=(event:PointerEvent)=>{if(pointer?.id===event.pointerId){suppressClick=pointer.moved;stopPointer();}};
    const cancel=()=>{suppressClick=false;stopPointer();};
    const click=(event:MouseEvent)=>{if(suppressClick){suppressClick=false;event.preventDefault();event.stopPropagation();}};
    surface.addEventListener('pointerdown',down);surface.addEventListener('pointermove',move);
    surface.addEventListener('pointerup',up);surface.addEventListener('pointercancel',cancel);
    surface.addEventListener('click',click,true);
    const viewTarget=new THREE.Vector3(0,1.9,.55);
    const cardStart=new THREE.Vector3(-2.5,1.3,3.45);let cardStartScale=1.3;
    function resize(){w=host.clientWidth;h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
    const observer=new ResizeObserver(resize);observer.observe(host);resize();
    function project(x:number,y:number,z:number){const p=new THREE.Vector3(x,y,z).project(camera);return new THREE.Vector2((p.x+1)*w/2,(1-p.y)*h/2);}
    function locateCardOrigin(){
      const rect=latest.current.origin.current?.getBoundingClientRect();
      if(!rect||rect.width===0||rect.bottom<0||rect.top>innerHeight){cardStart.set(-2.5,1.3,3.45);cardStartScale=1.3;return;}
      const bounds=host.getBoundingClientRect();
      // Unproject the clicked print into the incoming card plane after the view has settled.
      const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((rect.left+rect.width/2-bounds.left)/w*2-1,1-(rect.top+rect.height/2-bounds.top)/h*2),camera);
      ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),-3.45),cardStart);
      cardStartScale=THREE.MathUtils.clamp(rect.width/w*2*(camera.position.z-3.45)*Math.tan(THREE.MathUtils.degToRad(17.5))*camera.aspect,.7,1.7);
    }
    let locatedOrigin=false,inViewport=true;
    let renderedYaw=NaN,renderedPitch=NaN,renderedWidth=0,renderedHeight=0,renderedPhase='';
    const visibility=new IntersectionObserver(([entry])=>{inViewport=entry.isIntersecting;},{rootMargin:'100px'});visibility.observe(host);
    function render(time:number){
      if(dead)return;frame=requestAnimationFrame(render);if(document.hidden||latest.current.paused||!inViewport)return;
      const dt=Math.min((time-last)/1000,.05);last=time;
      const p=latest.current;const t=p.progress.current.value*2.8;
      const active=p.phase==='inserting'||p.phase==='revealing';
      if(p.rotateStep!==seenRotate){targetYaw+=(p.rotateStep-seenRotate)*.35;seenRotate=p.rotateStep;}
      if(p.viewReset!==seenReset){seenReset=p.viewReset;resetView();}
      if(active&&!wasActive){stopPointer();resetView();locatedOrigin=false;}
      const wasAnimating=wasActive;wasActive=active;
      yaw=p.reduced?targetYaw:THREE.MathUtils.damp(yaw,targetYaw,active?12:14,dt);
      pitch=p.reduced?targetPitch:THREE.MathUtils.damp(pitch,targetPitch,12,dt);
      const viewChanged=Math.abs(yaw-renderedYaw)>0.00001||Math.abs(pitch-renderedPitch)>0.00001||w!==renderedWidth||h!==renderedHeight;
      if(!active&&!wasAnimating&&!viewChanged&&p.phase===renderedPhase&&p.image===lastImage)return;
      renderedYaw=yaw;renderedPitch=pitch;renderedWidth=w;renderedHeight=h;renderedPhase=p.phase;
      if(active||wasAnimating)renderer.shadowMap.needsUpdate=true;
      const distance=Math.max(10.4,6.0/(Math.tan(THREE.MathUtils.degToRad(17.5))*Math.max(camera.aspect,.4)*2));
      camera.position.set(Math.sin(yaw)*Math.cos(pitch)*distance,1.9+Math.sin(pitch)*distance,.55+Math.cos(yaw)*Math.cos(pitch)*distance);camera.lookAt(viewTarget);camera.updateMatrixWorld();
      const facing=camera.position.z>2.3;
      if(p.screen.current){
        p.screen.current.dataset.facing=facing?'front':'back';
        p.screen.current.inert=!facing||p.phase==='inserting';
        p.screen.current.setAttribute('aria-hidden',String(!facing||p.phase==='inserting'));
        if(facing)placeScreen(p.screen.current,[project(-1.625,3.775,1.30),project(1.625,3.775,1.30),project(1.625,1.225,1.30),project(-1.625,1.225,1.30)]);
      }
      if(p.slot.current){const center=project(.67,.70,1.47);p.slot.current.style.left=`${center.x}px`;p.slot.current.style.top=`${center.y}px`;p.slot.current.dataset.facing=facing?'front':'back';}
      if(p.image&&p.image!==lastImage){lastImage=p.image;createCard(p.image);}
      if(card){
        card.visible=p.phase==='inserting'&&t>=.4;
        if(card.visible){
          if(!locatedOrigin){locateCardOrigin();locatedOrigin=true;}
          const fly=THREE.MathUtils.smoothstep(t,.4,1.0),insert=THREE.MathUtils.smoothstep(t,1.0,1.5);
          card.position.set(THREE.MathUtils.lerp(cardStart.x,.67,fly),THREE.MathUtils.lerp(cardStart.y,.70,fly)+Math.sin(fly*Math.PI)*.55,THREE.MathUtils.lerp(cardStart.z,2.18,fly)-insert*1.4);
          card.rotation.set(-Math.PI/2*fly,0,-.08*(1-fly));card.scale.setScalar(THREE.MathUtils.lerp(cardStartScale,.97,fly));card.material.clippingPlanes=t>.95?[clipping]:[];
        }
      }
      const pulse=active?Math.sin(Math.min(1,t/2.8)*Math.PI):0;ledMaterial.emissiveIntensity=.4+pulse*3;
      particles.visible=active;
      particleMat.opacity=p.phase==='revealing'?Math.max(0,1-(t-1.5)/.85):.76;
      if(particles.visible){for(let i=0;i<count;i++){
        const x=seed[i*3],v=seed[i*3+1],z=seed[i*3+2];const tick=p.reduced?0:time*.00045;
        pos[i*3]=x+Math.sin(tick+v*12)*.04;pos[i*3+1]=1.4+v*2.15+Math.sin(x*1.8+tick+z)*.04;pos[i*3+2]=1.30;
      }particleGeo.attributes.position.needsUpdate=true;}
      renderer.render(scene,camera);
    }
    frame=requestAnimationFrame(render);latest.current.onReady();
    return ()=>{
      dead=true;stopPointer();surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerup',up);surface.removeEventListener('pointercancel',cancel);surface.removeEventListener('click',click,true);cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);
      const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
      scene.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.Points){geometries.add(obj.geometry);for(const mat of Array.isArray(obj.material)?obj.material:[obj.material]){materials.add(mat);if('map'in mat&&mat.map instanceof THREE.Texture)textures.add(mat.map);}}});
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    };
  },[]);
  return <div className="memory-webgl" ref={hostRef}/>;
}
