import texts from './review-texts.json' with { type: 'json' };
export const reviewSource='https://yikaistudio.com/reviews/';
export type Review={id:string;author:string;byline:string;year:number;role:string;language:string;paragraphs:string[];relatedArchive?:string};
// Complete text supplied by the user. Preserve wording, punctuation and original-language bylines.
export const reviews:Review[]=texts;
export const firstReview=reviews.find(r=>r.id==='david-pagel')!;
