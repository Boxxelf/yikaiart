import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { works, asset } from '../content/works';
import { collections } from '../content/collections';
import '../styles/works-editor.css';

const uploadUrl = 'https://github.com/Boxxelf/yikaiart/upload/main/content/works-updates';
type Packet = { version: 1; id: string; displayTitle: string; collectionId: string; medium: string; size: { height: number; width: number; unit: 'in' | 'cm' }; imageDataUrl?: string };
async function readPhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('请选择 JPG、PNG 或 WebP 图片。iPhone 的 HEIC 照片请先导出为 JPEG。');
  if (file.size > 40 * 1024 * 1024) throw new Error('这张照片超过 40 MB，请先导出一张较小的 JPEG。');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    if (bitmap.width * bitmap.height > 50000000) throw new Error('照片分辨率过大，请先缩小到长边约 3000 像素。');
    const scale = Math.min(1, 3072 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('浏览器无法处理照片，请使用最新版 Chrome 或 Safari。');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', 0.92);
    if (data.length > 10 * 1024 * 1024) throw new Error('图片仍然过大，请换一张较小的 JPEG。');
    return data;
  } finally { bitmap.close(); }
}
export default function WorksEditorPage() {
  const [mode, setMode] = useState<'new' | 'edit'>('new');
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [collectionId, setCollectionId] = useState('now');
  const [medium, setMedium] = useState('Oil on canvas');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [imageData, setImageData] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [downloaded, setDownloaded] = useState('');
  const [dirty, setDirty] = useState(false);
  const newId = useRef(`work-${crypto.randomUUID()}`);
  const imageVersion = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const publishSection = useRef<HTMLElement>(null);
  const current = mode === 'edit' ? works.find(work => work.id === selected) : undefined;
  const ready = mode === 'new' || Boolean(current);
  const preview = imageData || (current ? asset(current.image.display) : '');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '作品更新助手 — Yi Kai';
    const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex, nofollow'; document.head.append(meta);
    return () => { document.title = previousTitle; meta.remove(); };
  }, []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    let cancelled = false;
    imageVersion.current++;
    setError(''); setImageError(false); setConfirmed(false); setDownloaded(''); setImageData(undefined); setDirty(false);
    if (fileInput.current) fileInput.current.value = '';
    const work = mode === 'edit' ? works.find(item => item.id === selected) : undefined;
    const size = work?.dimensions?.match(/^([\d.]+) × ([\d.]+) (in|cm)$/);
    setTitle(work?.displayTitle || ''); setCollectionId(work?.collectionId || 'now'); setMedium(work?.medium || 'Oil on canvas');
    setHeight(size?.[1] || ''); setWidth(size?.[2] || ''); setUnit(size?.[3] === 'cm' ? 'cm' : 'in');
    if (mode === 'new') newId.current = `work-${crypto.randomUUID()}`;
    setBusy(Boolean(work?.updateRevision));
    if (work?.updateRevision) {
      // Preserve the original encoded image when replacing a previously uploaded packet.
      fetch(asset(`works-packets/${work.id}.json?v=${work.updateRevision}`), { cache: 'no-store' })
        .then(response => { if (!response.ok) throw new Error(); return response.json(); })
        .then((packet: Packet) => { if (packet.id !== work.id) throw new Error(); if (!cancelled) setImageData(packet.imageDataUrl); })
        .catch(() => { if (!cancelled) { setError('原来的更新文件未能读取。请刷新页面后重试，以免丢失原来的图片。'); setImageError(true); } })
        .finally(() => { if (!cancelled) setBusy(false); });
    }
    return () => { cancelled = true; };
  }, [mode, selected]);
  const changed = () => { setDirty(true); setConfirmed(false); setDownloaded(''); setError(''); };
  async function selectPhoto(file?: File) {
    if (!file) return;
    const version = ++imageVersion.current;
    setBusy(true); setError(''); setImageError(false); changed();
    try { const data = await readPhoto(file); if (version === imageVersion.current) setImageData(data); }
    catch (error) { if (version === imageVersion.current) { setError(error instanceof Error ? error.message : '照片无法读取，请换一张 JPG 图片。'); setImageError(true); } }
    finally { if (version === imageVersion.current) setBusy(false); }
  }
  function download(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!ready || busy || imageError) return;
    if (!title.trim() || !medium.trim()) { setError('请填写作品名和材料，不能只填空格。'); return; }
    if (!imageData && !current) { setError('新增作品需要先选择一张照片。'); return; }
    if (/[\u3400-\u9fff]/.test(title)) { setError('网站以英文展示作品，请填写英文作品名。'); return; }
    if (mode === 'new' && works.some(work => work.displayTitle.toLowerCase().trim() === title.toLowerCase().trim())) { setError('网站已有同名作品。请在第一步选择“修改已有作品”，避免重复添加。'); return; }
    const packet: Packet = { version: 1, id: current?.id || newId.current, displayTitle: title.trim(), collectionId, medium: medium.trim(), size: { height: Number(height), width: Number(width), unit }, ...(imageData ? { imageDataUrl: imageData } : {}) };
    const blob = new Blob([JSON.stringify(packet, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `${packet.id}.json`; document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    setDownloaded(`${packet.id}.json`); setDirty(false);
    window.setTimeout(() => publishSection.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
  return <main id="main" className="works-editor" lang="zh-CN">
    <header className="editor-intro"><p className="editor-eyebrow">YI KAI / 作品维护</p><h1>作品更新助手</h1><p>准备一张作品照片，填好资料，再把下载的文件上传到 GitHub。</p><p>建议使用电脑操作。这里填写和下载不会立即更改网站。</p><a href={asset('manuals/works-upload-guide.pdf')} target="_blank" rel="noreferrer">打开大字号操作手册（PDF）</a></header>
    <section className="editor-step" aria-labelledby="choose-heading"><h2 id="choose-heading"><span>1</span>选择要做的事情</h2>
      <fieldset className="editor-mode"><legend className="editor-sr-only">更新方式</legend><label><input type="radio" name="mode" checked={mode === 'new'} onChange={() => setMode('new')} disabled={busy}/>新增作品</label><label><input type="radio" name="mode" checked={mode === 'edit'} onChange={() => setMode('edit')} disabled={busy}/>修改已有作品</label></fieldset>
      {mode === 'edit' && <div className="editor-selection"><label>查找作品<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="输入作品名中的几个字母" disabled={busy}/></label><label>选择要修改的作品<select value={selected} onChange={e => setSelected(e.target.value)} disabled={busy}><option value="">请从这里选择</option>{works.filter(work => work.id === selected || work.displayTitle.toLowerCase().includes(search.toLowerCase())).map(work => <option key={work.id} value={work.id}>{work.displayTitle} / {collections.find(c => c.id === work.collectionId)?.label}</option>)}</select></label><p>只改文字时不用重新选照片。每次修改前，请先确认上一次更新已经在网站上显示。</p></div>}
    </section>
    <form onSubmit={download}>
      <section className="editor-step" aria-labelledby="details-heading"><h2 id="details-heading"><span>2</span>选照片，填写作品资料</h2>
        {!ready && <p className="editor-notice">请先在上面选择一件已有作品。</p>}
        <fieldset disabled={!ready || busy} className="editor-fields"><legend className="editor-sr-only">作品资料</legend>
          <div className="editor-photo-field"><span>作品照片{mode === 'edit' ? '（需要换图时再选）' : '（必选）'}</span><button className="editor-photo-button" type="button" onClick={() => fileInput.current?.click()}>选择作品照片</button><input className="editor-file" ref={fileInput} aria-label={mode === 'edit' ? '作品照片（需要换图时再选）' : '作品照片（必选）'} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void selectPhoto(e.target.files?.[0])}/><small>使用 JPG、PNG 或 WebP。照片会自动缩小，您的原图不会改变。</small></div>
          <label>英文作品名<input required maxLength={180} value={title} onChange={e => { setTitle(e.target.value); changed(); }} placeholder="例如：The Fragmented Self #14"/></label>
          <label>作品系列<select value={collectionId} onChange={e => { setCollectionId(e.target.value); changed(); }}>{collections.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select><small>最近的新作品通常选择 NOW。</small></label>
          <label>材料<input required maxLength={140} value={medium} onChange={e => { setMedium(e.target.value); changed(); }} list="medium-options"/><small>布面油画填写 Oil on canvas。</small></label><datalist id="medium-options"><option value="Oil on canvas"/><option value="Acrylic on canvas"/><option value="Mixed media on canvas"/><option value="Ink on paper"/></datalist>
          <div className="editor-size"><label>作品高度<input type="number" required min="0.01" max="10000" step="any" inputMode="decimal" value={height} onChange={e => { setHeight(e.target.value); changed(); }} placeholder="例如 27.5"/></label><label>作品宽度<input type="number" required min="0.01" max="10000" step="any" inputMode="decimal" value={width} onChange={e => { setWidth(e.target.value); changed(); }} placeholder="例如 35.5"/></label><label>尺寸单位<select value={unit} onChange={e => { setUnit(e.target.value as 'in' | 'cm'); changed(); }}><option value="in">英寸 in</option><option value="cm">厘米 cm</option></select></label></div><p>填写画作本身的实际尺寸：高在前，宽在后。例如 27.5 × 35.5 英寸；不要填写照片像素。</p>
        </fieldset>
        {busy && <p role="status">正在读取照片和资料，请稍候……</p>}
        {preview && <figure className="editor-preview"><img src={preview} alt={title ? `${title} — 上传前核对` : '待上传的作品照片'}/><figcaption><strong>{title || '作品名尚未填写'}</strong><span>{collections.find(c => c.id === collectionId)?.label}</span><span>{medium}{height && width ? ` · ${height} × ${width} ${unit}` : ''}</span></figcaption></figure>}
        {error && <p className="editor-error" role="alert">{error}</p>}
        <label className="editor-confirm"><input type="checkbox" checked={confirmed} disabled={!ready || busy || imageError} onChange={e => setConfirmed(e.target.checked)}/>我已核对图片、作品名、系列、材料、尺寸和单位。</label>
        <button className="editor-primary" type="submit" disabled={!confirmed || busy || !ready || imageError}>下载这件作品的更新文件</button>
        <p>下载的是一个 .json 文件，里面已包含图片和资料。请不要打开或修改文件内容。</p>
      </section>
    </form>
    <section ref={publishSection} className="editor-step editor-publish" aria-labelledby="publish-heading"><h2 id="publish-heading"><span>3</span>上传到 GitHub，完成发布</h2>
      {downloaded ? <div className="editor-notice" role="status">已发起下载，请在电脑的“下载”文件夹确认文件：<code>{downloaded}</code><p>下载还没有更新网站。接下来请完成下面的上传。</p></div> : <p>先完成上面的填写和下载，GitHub 上传入口就会出现。</p>}
      <ol><li>在“下载”文件夹找到刚刚生成的文件。若文件名末尾多了 <b>(1)</b> 或其他序号，请删掉这个后缀，保留原文件名。</li><li>打开下方 GitHub 上传页，登录有权限的账号。点击 <b>choose your files</b>，选择这个更新文件。</li><li>等待文件上传完毕，在下方填写说明，例如“新增作品”。选择 <b>Commit directly to the main branch</b>，点击绿色的 <b>Commit changes</b>。</li><li>等待几分钟，打开 Works 并刷新，核对图片和资料。确认显示正确后，再处理下一件。</li></ol>
      {downloaded && <a className="editor-primary" href={uploadUrl} target="_blank" rel="noreferrer">打开 GitHub 上传页</a>}
      <a className="editor-check-link" href="/works" target="_blank" rel="noreferrer">打开 Works，检查发布结果</a>
      <p>若页面只有 Fork、Propose changes 或要求创建分支，请先检查登录账号是否有仓库写入权限。若 10 分钟后仍没更新，请查看操作手册中的“网站没有更新”。</p>
    </section>
  </main>;
}
