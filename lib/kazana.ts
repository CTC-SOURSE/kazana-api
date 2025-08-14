const DEFAULT_BASE = 'https://kazana-api-production.up.railway.app';
const BASE =
  process.env.NEXT_PUBLIC_KAZANA_API ||
  (typeof window !== 'undefined' && (window as any).__KAZANA_API__) ||
  DEFAULT_BASE;

type Lang = 'en'|'sn'|'nd';
type Opts = RequestInit & { lang?: Lang };
const req = async (path: string, opts: Opts = {}) => {
  const url = `${BASE}${path}${path.includes('?')?'&':'?'}lang=${opts.lang ?? pickLang()}`;
  const r = await fetch(url, { headers:{'Content-Type':'application/json',...(opts.headers||{})}, ...opts });
  const data = await r.json();
  if (!r.ok) throw data;
  return data;
};
export const Kazana = {
  health: ()=>req('/health'),
  createJourney:(b:any,lang?:Lang)=>req('/api/journeys',{method:'POST',body:JSON.stringify(b),lang}),
  search:(q:Record<string,any>,lang?:Lang)=>req('/api/search?'+new URLSearchParams(q as any),{lang}),
  book:(b:any,lang?:Lang)=>req('/api/bookings',{method:'POST',body:JSON.stringify(b),lang}),
  cancelBooking:(id:string,lang?:Lang)=>req(`/api/bookings/${id}/cancel`,{method:'DELETE',lang}),
  driverCancel:(id:string,lang?:Lang)=>req(`/api/journeys/${id}`,{method:'DELETE',lang}),
  createPackage:(b:any,lang?:Lang)=>req('/api/packages',{method:'POST',body:JSON.stringify(b),lang}),
  cancelPackage:(id:string,lang?:Lang)=>req(`/api/packages/${id}/cancel`,{method:'DELETE',lang}),
  stats:()=>req('/api/admin/stats'),
};
function pickLang(): Lang {
  const l=(typeof navigator!=='undefined'&&navigator.language||'en').slice(0,2).toLowerCase();
  return (['en','sn','nd'] as Lang[]).includes(l as Lang)?(l as Lang):'en';
}
