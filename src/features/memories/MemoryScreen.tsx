import { useTranslation } from '../../i18n/Locale';
import { memoryAsset, type Memory } from '../../content/memories';
export default function MemoryScreen({ memory, revealing }: {memory: Memory; revealing: boolean}) {
 const { t, locale } = useTranslation();

  return <article className={`memory-screen-content ${memory.image.height > memory.image.width ? 'is-portrait' : ''} ${revealing ? 'is-revealing' : ''}`} aria-label={t(`Memory: ${memory.title}`)}>
    <div className="memory-screen-photo"><img src={memoryAsset(memory.image.display)} alt={t(memory.alt)} draggable={false} /></div>
    <div className="memory-screen-copy" aria-label={t("Photograph description")}>
      <div className="memory-screen-meta"><span>{t(memory.year ?? 'Undated')}{t(memory.location && ` / ${memory.location}`)}</span></div>
      <h2>{t(memory.title)}</h2>
      <p lang={locale}>{t(memory.description)}</p>
    </div>
  </article>;
}
