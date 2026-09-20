import { memoryAsset, type Memory } from '../../content/memories';
export default function MemoryScreen({ memory, revealing }: {memory: Memory; revealing: boolean}) {
  return <article className={`memory-screen-content ${memory.image.height > memory.image.width ? 'is-portrait' : ''} ${revealing ? 'is-revealing' : ''}`} aria-label={`Memory: ${memory.title}`}>
    <div className="memory-screen-photo"><img src={memoryAsset(memory.image.display)} alt={memory.alt} draggable={false} /></div>
    <div className="memory-screen-copy" aria-label="Photograph description">
      <div className="memory-screen-meta"><span>{memory.year ?? 'Undated'}{memory.location && ` / ${memory.location}`}</span></div>
      <h2>{memory.title}</h2>
      <p lang="en">{memory.description}</p>
    </div>
  </article>;
}
