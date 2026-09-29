export const studioPhotographs = [
  { id: 'surrounded-by-paintings', sourceFilename: 'IMG_7056.jpeg', caption: 'Among the paintings.', alt: 'Yi Kai seated beside a piano, surrounded by blue paintings.', width: 3692, height: 2769 },
  { id: 'with-mickey', sourceFilename: 'IMG_7048.jpeg', caption: 'With Mickey Opera Players with Masker.', alt: 'Yi Kai seated with his arms folded beneath Mickey Opera Players with Masker.', width: 3498, height: 2419 },
  { id: 'with-america', sourceFilename: 'IMG_8038.jpeg', caption: 'The artist and his work.', alt: 'Yi Kai seated beneath a red and blue painting shaped like a map of the United States.', width: 3555, height: 2666 },
  { id: 'a-moment-in-the-studio', sourceFilename: 'IMG_7059.jpeg', caption: 'A moment in the studio.', alt: 'Yi Kai smiling with both arms raised in front of purple and blue paintings.', width: 4032, height: 3024 },
] as const;
export const studioAsset = (id: string, size: 800 | 1600 | 2400 = 1600) => `${import.meta.env.BASE_URL}studio/${id}-${size}.webp`;
