export const collections = [
  { id: 'now', label: 'NOW', folder: '1. NOW', count: 26, title: 'The Fragmented Self and the Present' },
  { id: 'robot-ai', label: 'ROBOT / AI', folder: '2. Robot AI', count: 18, title: 'Machines, Masks, and Social Anxiety' },
  { id: 'opera-players', label: 'OPERA PLAYERS', folder: '3. Opera Players', count: 18, title: 'Mask, Performance, and Inheritance' },
  { id: 'agree-to-disagree', label: 'AGREE TO DISAGREE', folder: '4. Flags- Agree to Disagree', count: 14, title: 'Symbols, Flags, and Public Speech' },
  { id: 'tibet', label: 'TIBET', folder: '5. Tibet', count: 18, title: 'Pilgrims, Monks, and Everyday Devotion' },
  { id: 'land', label: 'LAND', folder: '6. Land', count: 19, title: 'Landscape After Use' },
] as const;
export type CollectionId = typeof collections[number]['id'];
export const collectionFor = (id: string) => collections.find(c => c.id === id)!;
