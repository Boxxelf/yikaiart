import catalogue from './works.generated.json';
const definitions = [
  { id: 'now', label: 'NOW', folder: '1. NOW', title: 'The Fragmented Self and the Present' },
  { id: 'robot-ai', label: 'ROBOT / AI', folder: '2. Robot AI', title: 'Machines, Masks, and Social Anxiety' },
  { id: 'opera-players', label: 'OPERA PLAYERS', folder: '3. Opera Players', title: 'Mask, Performance, and Inheritance' },
  { id: 'agree-to-disagree', label: 'AGREE TO DISAGREE', folder: '4. Flags- Agree to Disagree', title: 'Symbols, Flags, and Public Speech' },
  { id: 'tibet', label: 'TIBET', folder: '5. Tibet', title: 'Pilgrims, Monks, and Everyday Devotion' },
  { id: 'land', label: 'LAND', folder: '6. Land', title: 'Landscape After Use' },
] as const;
export const collections = definitions.map(collection => ({ ...collection, count: catalogue.filter(work => work.collectionId === collection.id).length }));
export type CollectionId = typeof definitions[number]['id'];
export const collectionFor = (id: string) => collections.find(c => c.id === id)!;
