const paths = {
  right: 'M4 12h16m-6-6 6 6-6 6',
  left: 'M20 12H4m6-6-6 6 6 6',
  up: 'M12 20V4m-6 6 6-6 6 6',
  down: 'M12 4v16m-6-6 6 6 6-6',
  diagonal: 'M5 19 19 5M5 5h14v14',
  'rotate-left': 'M4 10a8 8 0 1 1 1 8M4 4v6h6',
  'rotate-right': 'M20 10a8 8 0 1 0-1 8m1-14v6h-6',
  close: 'm6 6 12 12M6 18 18 6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  image: 'M3 4h18v16H3zM3 16l6-6 5 5 3-3 4 4',
};
export default function Icon({ name }: { name: keyof typeof paths }) {
  return <svg className={`ui-icon icon-${name}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>;
}
