import { artistStatement, careerSections, collectingIntroduction } from '../content/artist-profile';

export default function ArtistProfile(){
 return <div className="artist-profile" id="artist-profile">
  <section className="artist-statement" aria-labelledby="statement-title">
   <header><span className="small-label">In the artist’s words</span><h2 id="statement-title">Across two worlds.</h2><span className="statement-years">China · United States<br/>A practice begun in 1975</span></header>
   <blockquote>{artistStatement.map(p=><p key={p}>{p}</p>)}<footer>— Yi Kai</footer></blockquote>
  </section>
  <section className="artist-collecting" aria-labelledby="collecting-title"><h2 id="collecting-title">Art in the world.</h2><p>{collectingIntroduction}</p></section>
  <div className="artist-career">
   <nav className="career-index" aria-label="Artist career index"><span className="small-label">Selected history</span>{careerSections.map((s,i)=><a key={s.id} href={`#${s.id}`}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</a>)}</nav>
   <div className="career-records">{careerSections.map((section,i)=><section id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}><header><span>{String(i+1).padStart(2,'0')}</span><h2 id={`${section.id}-title`}>{section.title}</h2></header><ul className={section.id==='special-collections'?'collection-records':''}>{section.items.map((item,j)=>{
    const parts=item.match(/^(\d{4}(?:\s+–\s+\d{4})?)\s+(.+)$/);
    return <li key={j} className={parts?'dated-record':''}>{parts?<><span className="career-year">{parts[1]}</span><span>{parts[2]}</span></>:item}</li>;
   })}</ul></section>)}</div>
  </div>
  <footer className="profile-colophon"><span>Yi Kai / A life in painting</span><a href="#main">Back to the bookshelf ↑</a></footer>
 </div>;
}
