export const reviewSource='https://yikaistudio.com/reviews/';
export type Review={id:string;author:string;year:number;role:string;summary:string;translated?:boolean;quote?:string;relatedArchive?:string};
// Editorial summaries, not quotations. Names and historical roles follow the source archive.
export const reviews:Review[]=[
 {id:'tammi-schneider',author:'Tammi J. Schneider',year:2015,role:'Academic',summary:'Humanity and technology meet in vibrant, complex paintings.'},
 {id:'alice-king',author:'Alice King',year:2015,role:'Gallery founder',summary:'Symbols and rhythmic colour explore our interconnected lives.',translated:true},
 {id:'david-pagel',author:'David Pagel',year:2015,role:'Art critic',summary:'Contradiction sustains an open-ended journey through painting.',quote:'the journey is more important than destination'},
 {id:'andi-campognone',author:'Andi Campognone',year:2014,role:'Museum director',summary:'Painting offers shared hope across different cultural experiences.'},
 {id:'robert-jacobson',author:'Robert D. Jacobson',year:1999,role:'Curator',summary:'Cultural inheritance becomes a distinctive, evolving artistic language.',relatedArchive:'archive-gallery-guide-west'},
 {id:'mary-abbe',author:'Mary Abbe',year:1999,role:'Art critic',summary:'American symbols make room for enduring cultural roots.'},
 {id:'ruth-appelhof',author:'Ruth Stevens Appelhof',year:1996,role:'Museum director',summary:'An evolving process brings cultures into spontaneous conversation.',relatedArchive:'archive-gallery-guide-west'},
 {id:'dolly-fiterman',author:'Dolly Fiterman',year:1996,role:'Gallery director',summary:'Cultural exchange connects people, their environment and identity.',relatedArchive:'archive-dolly-fiterman'},
 {id:'stewart-turnquist',author:'Stewart Turnquist',year:1996,role:'Curator',summary:'Chinese traditions meet expressive gesture and exuberant colour.'},
 {id:'susan-tai',author:'Susan Tai',year:1992,role:'Curator',summary:'Technical assurance supports an individual vision of life.'},
 {id:'yen-shui-long',author:'Yen Shui-Long',year:1989,role:'Artist',summary:'An especially accomplished exhibition among visiting Chinese artists.',translated:true},
 {id:'mo-yan',author:'Mo Yan',year:1988,role:'Writer',summary:'Dreamlike colour releases a vivid world of ideas.',translated:true},
 {id:'liu-haisu',author:'Liu Haisu',year:1987,role:'Artist',summary:'Nature becomes a starting point for artistic invention.',translated:true},
];
export const firstReview=reviews.find(r=>r.id==='david-pagel')!;
