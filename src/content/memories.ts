import catalogue from './memories.json';
export type MemoryKind = 'photo' | 'exhibition-material';
export type Memory = {
  id: string; sourceFilename: string; kind: MemoryKind; year: number | null;
  dateSource: string; location: string; title: string; description: string;
  descriptionOriginal: string; alt: string; reviewStatus: string; reviewNotes: string;
  image: { thumbnail: string; display: string; width: number; height: number };
};
export const memories = (catalogue as Memory[]).slice().sort((a,b) => (a.year ?? 9999) - (b.year ?? 9999));
export const firstMemory = memories.find(m => m.id === 'houston-2026')!;
export const memoryAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
