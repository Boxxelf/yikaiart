import { asset, type Work } from '../content/works';
export default function WorkImage({ work, detail = false, eager = false }: { work: Work; detail?: boolean; eager?: boolean }) {
  return <img src={asset(detail ? work.image.display : work.image.medium)}
    srcSet={`${asset(work.image.thumbnail)} 480w, ${asset(work.image.medium)} 960w, ${asset(work.image.display)} 1920w`}
    sizes={detail ? '(min-width: 900px) 72vw, 95vw' : '(min-width: 1180px) 30vw, (min-width: 768px) 45vw, 90vw'}
    alt={work.image.alt} width={work.image.width} height={work.image.height} loading={eager ? 'eager' : 'lazy'}
    decoding="async" style={{ backgroundImage: `url(${work.image.placeholder})`, backgroundSize: '100% 100%' }} />;
}
