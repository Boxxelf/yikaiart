import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/Locale';

export default function BackToTop() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 400);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  if (!visible) return null;

  return <button type="button" className="back-to-top" onClick={() => {
    document.querySelector<HTMLElement>('.wordmark')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }}><span aria-hidden="true">↑</span>{t('Return to top')}</button>;
}
