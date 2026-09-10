import catalogue from './works.json';
import type { CollectionId } from './collections';
export type Work = {
  id: string; sourceFilename: string; sourceFolder: string; collectionId: CollectionId;
  displayTitle: string; dimensions?: string; dimensionSource?: string; featuredOrder?: number;
  image: { thumbnail: string; medium: string; display: string; width: number; height: number; originalAspectRatio: number; placeholder: string; alt: string };
};
export const works = catalogue as Work[];
export const featuredWorks = works.filter(w => w.featuredOrder).sort((a, b) => a.featuredOrder! - b.featuredOrder!);
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
