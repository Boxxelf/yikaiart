import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { chapters, type Chapter } from '../../content/about';
import { bookSurface } from './materials';

export type ShelfControl = { select: (id: string) => void; open: () => void; reset: () => void };
type Props = { onSelect: (id: string | null) => void; onOpen: (id: string) => void; onHover: (id: string | null) => void; onFailure: () => void; controls: MutableRefObject<ShelfControl | null>; paused: boolean };
type Book = { chapter: Chapter; group: THREE.Group; hinge: THREE.Group; baseX: number; height: number; depth: number };
export default function BookshelfScene(props: Props) {
  const root = useRef<HTMLDivElement>(null); const latest = useRef(props); latest.current = props;
  useEffect(() => {
    const host = root.current!; let dead = false; let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }); } catch { latest.current.onFailure(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7)); renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true'); host.appendChild(renderer.domElement);
    const lost = (e: Event) => { e.preventDefault(); latest.current.onFailure(); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    const scene = new THREE.Scene(); const camera = new THREE.OrthographicCamera(-800, 800, 400, -400, .1, 5000);
    camera.position.set(0, 405, 2200); camera.lookAt(0, 350, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 2.1));
    const sun = new THREE.DirectionalLight(0xfff8e8, 3.2); sun.position.set(-700, 1400, 1100); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -1000, right: 1000, top: 900, bottom: -600, near: .5, far: 4000 }); sun.shadow.bias = -.001; sun.shadow.radius = 5; scene.add(sun);
    const fill = new THREE.DirectionalLight(0xdde6f6, .9); fill.position.set(1200, 500, 600); scene.add(fill);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6000, 4000), new THREE.ShadowMaterial({ color: 0x514638, opacity: .13 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -4; floor.receiveShadow = true; scene.add(floor);
    const textures: THREE.Texture[] = []; const texturesFor = (c: Chapter, kind: 'cover' | 'spine' | 'inside') => { const t = new THREE.CanvasTexture(bookSurface(c, kind)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); textures.push(t); return t; };
    const books: Book[] = [];
    let totalWidth = chapters.reduce((sum, c) => sum + c.width + 14, 0) - 14;
    let cursor = -totalWidth / 2;
    for (const chapter of chapters) {
      const w = chapter.width, h = chapter.height, d = h * .67;
      const group = new THREE.Group(); group.name = chapter.id; const x = cursor + w / 2; group.position.set(x, h / 2, 0); group.rotation.z = (Number(chapter.number) % 3 - 1) * .0035;
      const mat = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: .96 });
      const edgeMaterial = mat(chapter.color), paper = mat('#EEE5D2');
      const spineMat = new THREE.MeshStandardMaterial({ map: texturesFor(chapter, 'spine'), roughness: .97 });
      const coverMat = new THREE.MeshStandardMaterial({ map: texturesFor(chapter, 'cover'), roughness: chapter.material === 'cloth' ? .98 : .9 });
      const innerMat = new THREE.MeshStandardMaterial({ map: texturesFor(chapter, 'inside'), roughness: 1 });
      const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(w - 10, h - 12, d - 8), paper); pageBlock.position.z = -d / 2; group.add(pageBlock);
      const spine = new THREE.Mesh(new THREE.BoxGeometry(w, h, 7), [edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, spineMat, edgeMaterial]); group.add(spine);
      const back = new THREE.Mesh(new THREE.BoxGeometry(4, h, d), edgeMaterial); back.position.set(-w / 2, 0, -d / 2 + 1); group.add(back);
      const pageFace = new THREE.Mesh(new THREE.PlaneGeometry(d - 10, h - 14), innerMat); pageFace.rotation.y = Math.PI / 2; pageFace.position.set(w / 2 - 4, 0, -d / 2); group.add(pageFace);
      const hinge = new THREE.Group(); hinge.position.set(w / 2 + 1, 0, 0); hinge.rotation.y = Math.PI / 2;
      const cover = new THREE.Mesh(new THREE.BoxGeometry(d, h, 4), [edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, coverMat, paper]); cover.position.x = d / 2; hinge.add(cover); group.add(hinge);
      const lineVertices: number[] = [];
      for (let px = -w / 2 + 7; px < w / 2 - 6; px += 2.4) { lineVertices.push(px, h / 2 - 5.8, -4, px, h / 2 - 5.8, -d + 5); lineVertices.push(px, -h / 2 + 5.8, -d + 5, px, h / 2 - 5.8, -d + 5); }
      const lineGeo = new THREE.BufferGeometry(); lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3)); group.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: '#9C8F75', transparent: true, opacity: .32 })));
      // Each cloth or translucent book has one physical archival insert.
      if (chapter.id === 'dialogue' || chapter.id === 'unresolved' || chapter.id === 'study') {
        const tab = new THREE.Mesh(new THREE.PlaneGeometry(55, chapter.id === 'dialogue' ? 110 : 40), new THREE.MeshStandardMaterial({ color: chapter.id === 'dialogue' ? '#B94132' : '#C5B799', transparent: true, opacity: .65, roughness: 1, side: THREE.DoubleSide }));
        tab.position.set(w * .37, h * .3, 4.1); tab.rotation.z = -.055; group.add(tab);
      }
      group.traverse(obj => { obj.userData.chapterId = chapter.id; if (obj instanceof THREE.Mesh) { obj.castShadow = true; obj.receiveShadow = true; } });
      scene.add(group); books.push({ chapter, group, hinge, baseX: x, height: h, depth: d }); cursor += w + 14;
    }
    let selected: Book | null = null, animating = false, frame = 0, hovered: Book | null = null;
    const reset = () => {
      latest.current.onSelect(null); animating = true;
      for (const b of books) { gsap.killTweensOf(b.group.position); gsap.killTweensOf(b.group.rotation); gsap.killTweensOf(b.hinge.rotation); gsap.to(b.group.position, { x: b.baseX, y: b.height / 2, z: 0, duration: .8, ease: 'power3.inOut' }); gsap.to(b.group.rotation, { y: 0, z: (Number(b.chapter.number) % 3 - 1) * .0035, duration: .8 }); gsap.to(b.hinge.rotation, { y: Math.PI / 2, duration: .5 }); }
      selected = null; gsap.delayedCall(.85, () => { animating = false; });
    };
    const open = () => {
      if (!selected || animating) return; animating = true; const id = selected.chapter.id;
      gsap.to(selected.hinge.rotation, { y: Math.PI / 2 - 2.35, duration: .8, ease: 'power2.inOut', onComplete: () => { animating = false; if (!dead) latest.current.onOpen(id); } });
    };
    const select = (id: string) => {
      if (animating || latest.current.paused) return;
      if (selected?.chapter.id === id) { open(); return; }
      const b = books.find(b => b.chapter.id === id); if (!b) return;
      if (selected) { const old = selected; gsap.to(old.group.position, { x: old.baseX, y: old.height / 2, z: 0, duration: .7 }); gsap.to(old.group.rotation, { y: 0, duration: .7 }); }
      selected = b; animating = true; latest.current.onSelect(id);
      gsap.timeline({ onComplete: () => { animating = false; } }).to(b.group.position, { z: 390, y: 360, duration: .45, ease: 'power2.out' }).to(b.group.position, { x: -b.depth / 2, z: 650, duration: .65, ease: 'power3.inOut' }, .25).to(b.group.rotation, { y: -Math.PI / 2, z: 0, duration: .7, ease: 'power3.inOut' }, .25);
    };
    props.controls.current = { select, open, reset };
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const hit = (e: PointerEvent) => { const rect = host.getBoundingClientRect(); pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1); raycaster.setFromCamera(pointer, camera); const hits = raycaster.intersectObjects(books.map(b => b.group), true); return books.find(b => b.chapter.id === hits[0]?.object.userData.chapterId) || null; };
    const move = (e: PointerEvent) => {
      if (selected || animating || latest.current.paused) return;
      const b = hit(e); if (hovered === b) return;
      if (hovered) gsap.to(hovered.group.position, { y: hovered.height / 2, duration: .3 }); hovered = b;
      if (b) gsap.to(b.group.position, { y: b.height / 2 + 9, duration: .25 });
      latest.current.onHover(b?.chapter.id || null); host.style.cursor = b ? 'pointer' : 'default';
    };
    const click = (e: PointerEvent) => { if (latest.current.paused || animating) return; const b = hit(e); if (b) select(b.chapter.id); else if (selected) reset(); };
    const leave = () => { if (hovered && !selected) gsap.to(hovered.group.position, { y: hovered.height / 2, duration: .3 }); hovered = null; latest.current.onHover(null); };
    const resize = () => { const { width, height } = host.getBoundingClientRect(); renderer.setSize(width, height); const visibleWidth = Math.max(1440, 760 * width / height); const visibleHeight = visibleWidth * height / width; camera.left = -visibleWidth / 2; camera.right = visibleWidth / 2; camera.top = visibleHeight / 2; camera.bottom = -visibleHeight / 2; camera.position.y = visibleHeight / 2 - 8; camera.lookAt(0, visibleHeight / 2 - 24, 0); camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    host.addEventListener('pointermove', move); host.addEventListener('pointerup', click); host.addEventListener('pointerleave', leave);
    let last = 0;
    const render = (time: number) => { if (dead) return; frame = requestAnimationFrame(render); if (document.hidden || latest.current.paused || time - last < 24) return; last = time; renderer.render(scene, camera); };
    frame = requestAnimationFrame(render);
    return () => { dead = true; cancelAnimationFrame(frame); observer.disconnect(); host.removeEventListener('pointermove', move); host.removeEventListener('pointerup', click); host.removeEventListener('pointerleave', leave); renderer.domElement.removeEventListener('webglcontextlost', lost); for (const b of books) { gsap.killTweensOf(b.group.position); gsap.killTweensOf(b.group.rotation); gsap.killTweensOf(b.hinge.rotation); } const disposed = new Set<unknown>(); scene.traverse(obj => { if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) { obj.geometry.dispose(); for (const m of Array.isArray(obj.material) ? obj.material : [obj.material]) if (!disposed.has(m)) { disposed.add(m); m.dispose(); } } }); textures.forEach(t => t.dispose()); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); props.controls.current = null; };
  }, []);
  return <div className="bookshelf-canvas" ref={root} />;
}
