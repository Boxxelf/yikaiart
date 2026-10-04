import { useTranslation } from '../../i18n/Locale';
import { useEffect, useState } from 'react';
import { collectionAsset, type Holding } from '../../content/holdings';
export default function ArchiveImage({item,large=false,eager=false}:{item:Holding;large?:boolean;eager?:boolean}){
 const { t } = useTranslation();

 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[item.id,large]);
 if(failed)return <span className="editorial-image-unavailable">{t("Image unavailable")}<br/><span>{t(item.title)}</span></span>;
 return <img src={collectionAsset(large?item.image.display:item.image.thumbnail)} alt={t(item.alt)} width={item.image.width} height={item.image.height} loading={eager?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>;
}
