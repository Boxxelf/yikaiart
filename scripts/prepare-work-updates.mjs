import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

export const collectionIds = ['now', 'robot-ai', 'opera-players', 'agree-to-disagree', 'tibet', 'land'];
const maxPacketBytes = 12 * 1024 * 1024;
function check(ok, message) { if (!ok) throw new Error(message); }
function text(value, field, max = 180) {
  check(typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[\x00-\x1f]/.test(value), `${field} 不完整或过长`);
  return value.trim();
}
export async function prepareWorks(root = process.cwd()) {
  const base = JSON.parse(await fs.readFile(path.join(root, 'src/content/works.json'), 'utf8'));
  const byId = new Map(base.map(work => [work.id, work]));
  const directory = path.join(root, 'content/works-updates');
  await fs.mkdir(directory, { recursive: true });
  const publicPackets = path.join(root, 'public/works-packets');
  const generatedArt = path.join(root, 'public/art/updates');
  await fs.mkdir(publicPackets, { recursive: true });
  await fs.mkdir(generatedArt, { recursive: true });
  const updates = [];
  const packets = (await fs.readdir(directory)).filter(name => name.toLowerCase().endsWith('.json')).sort();
  for (const filename of packets) {
    try {
      const file = path.join(directory, filename);
      check((await fs.stat(file)).size <= maxPacketBytes, '文件超过 12 MB，请重新使用作品更新表生成');
      const raw = await fs.readFile(file, 'utf8');
      const packet = JSON.parse(raw);
      check(packet.version === 1, '更新文件版本不支持，请重新生成');
      check(packet.updatedAt === undefined || (typeof packet.updatedAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(packet.updatedAt) && Number.isFinite(Date.parse(packet.updatedAt))), '更新时间无效，请重新生成');
      check(typeof packet.id === 'string' && /^[a-z0-9][a-z0-9-]{2,119}$/.test(packet.id), '作品编号无效');
      check(filename === `${packet.id}.json`, '文件名已被更改。请保持原文件名，不要加 (1) 或其他后缀');
      const original = byId.get(packet.id);
      const displayTitle = text(packet.displayTitle, '英文作品名');
      check(!/[\u3400-\u9fff]/.test(displayTitle), '请填写英文作品名');
      check(collectionIds.includes(packet.collectionId), '请选择已有的作品系列');
      const medium = text(packet.medium, '材料', 140);
      check(packet.size && ['in', 'cm'].includes(packet.size.unit), '尺寸单位无效');
      const { height, width, unit } = packet.size;
      check([height, width].every(n => typeof n === 'number' && Number.isFinite(n) && n > 0 && n <= 10000), '高和宽应是大于 0 的数字');
      const dimensions = `${height} × ${width} ${unit}`;
      let image = original?.image;
      const revision = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
      if (packet.imageDataUrl !== undefined) {
        check(typeof packet.imageDataUrl === 'string', '图片内容无效');
        const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(packet.imageDataUrl);
        check(match, '图片应为 JPG、PNG 或 WebP');
        const bytes = Buffer.from(match[2], 'base64');
        check(bytes.length > 0 && bytes.length <= 8 * 1024 * 1024, '图片过大，请重新用表单生成');
        const normalized = await sharp(bytes, { limitInputPixels: 50000000 }).rotate().toBuffer();
        const info = await sharp(normalized).metadata();
        check(['jpeg', 'png', 'webp'].includes(info.format) && info.width > 0 && info.height > 0 && (info.pages || 1) === 1, '请使用一张静态作品图片');
        const imageHash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 16);
        const prefix = `art/updates/${packet.id}-${imageHash}`;
        const imagePaths = {};
        for (const [key, width] of [['thumbnail', 480], ['medium', 960], ['display', 1920]]) {
          imagePaths[key] = `${prefix}-${width}.webp`;
          await sharp(normalized).resize({ width, withoutEnlargement: true }).webp({ quality: 88 }).toFile(path.join(root, 'public', imagePaths[key]));
        }
        const placeholder = await sharp(normalized).resize({ width: 24 }).webp({ quality: 35 }).toBuffer();
        image = { ...imagePaths, width: info.width, height: info.height, originalAspectRatio: info.width / info.height, placeholder: `data:image/webp;base64,${placeholder.toString('base64')}` };
      }
      check(image, '新增作品缺少图片，请选择照片后重新下载更新文件');
      const work = { ...original, id: packet.id, sourceFilename: original?.sourceFilename || `${packet.id}.jpg`, sourceFolder: original?.sourceFolder || 'Owner updates', collectionId: packet.collectionId, displayTitle, medium, dimensions, dimensionSource: 'Artist-provided website update.', updateRevision: revision, image: { ...image, alt: `${displayTitle}, ${medium.toLowerCase()} by Yi Kai, ${dimensions}.` } };
      updates.push({ work, updatedAt: packet.updatedAt ? Date.parse(packet.updatedAt) : 0 });
      await fs.writeFile(path.join(publicPackets, filename), raw);
    } catch (error) { throw new Error(`作品更新文件 ${filename}: ${error.message}`); }
  }
  // Only generated public copies are pruned; owner source files are never changed.
  for (const filename of await fs.readdir(publicPackets)) {
    if (filename.endsWith('.json') && !packets.includes(filename)) await fs.unlink(path.join(publicPackets, filename));
  }
  // New and revised works lead each collection, newest first. Legacy packets keep a deterministic filename order.
  updates.sort((a, b) => b.updatedAt - a.updatedAt || b.work.id.localeCompare(a.work.id));
  const updatedIds = new Set(updates.map(({ work }) => work.id));
  const works = [...updates.map(({ work }) => work), ...base.filter(work => !updatedIds.has(work.id))];
  check(new Set(works.map(work => work.id)).size === works.length, '作品编号重复');
  await fs.writeFile(path.join(root, 'src/content/works.generated.json'), JSON.stringify(works, null, 2) + '\n');
  console.log(`Prepared ${works.length} works from ${base.length} original works and ${packets.length} owner update files.`);
  return works;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareWorks();
}
