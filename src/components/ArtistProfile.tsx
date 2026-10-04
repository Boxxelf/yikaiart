import { useTranslation } from '../i18n/Locale';
import Icon from './Icon';
import { artistStatement, careerSections, collectingIntroduction } from '../content/artist-profile';

export default function ArtistProfile(){
 const { t } = useTranslation();

 return <div className="artist-profile" id="artist-profile">
  <section className="artist-statement" aria-labelledby="statement-title">
   <header><span className="small-label">{t("In the artist’s words")}</span><h2 id="statement-title">{t("Across two worlds.")}</h2><span className="statement-years">{t("China · United States")}<br/>{t("A practice begun in 1975")}</span></header>
   <blockquote>{artistStatement.map(p=><p key={p}>{t(p)}</p>)}<footer>{t("— Yi Kai")}</footer></blockquote>
  </section>
  <section className="artist-collecting" aria-labelledby="collecting-title"><h2 id="collecting-title">{t("Art in the world.")}</h2><p>{t(collectingIntroduction)}</p></section>
  <div className="artist-career">
   <nav className="career-index" aria-label={t("Artist career index")}><span className="small-label">{t("Selected history")}</span>{careerSections.map((s,i)=><a key={s.id} href={`#${s.id}`}><span>{t(String(i+1).padStart(2,'0'))}</span>{t(s.title)}</a>)}</nav>
   <div className="career-records">{careerSections.map((section,i)=><section id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}><header><span>{t(String(i+1).padStart(2,'0'))}</span><h2 id={`${section.id}-title`}>{t(section.title)}</h2></header><ul className={section.id==='special-collections'?'collection-records':''}>{section.items.map((item,j)=>{
    const parts=item.match(/^(\d{4}(?:\s+–\s+\d{4})?)\s+(.+)$/);
    return <li key={j} className={parts?'dated-record':''}>{parts?<><span className="career-year">{t(parts[1])}</span><span>{t(parts[2])}</span></>:t(item)}</li>;
   })}</ul></section>)}</div>
  </div>
  <footer className="profile-colophon"><span>{t("Yi Kai / A life in painting")}</span><a href="#main">{t("Back to the bookshelf ")}<Icon name="up" /></a></footer>
 </div>;
}
