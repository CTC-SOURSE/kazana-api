import { useEffect, useState } from 'react';
export type Lang = 'en' | 'sn' | 'nd';
const FALLBACK: Lang = 'en';

export const messages: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Book & Send',
    subtitle: 'Complete booking widget for rides and packages.',
    needRide: 'I need a ride',
    imDriving: 'I am driving',
    sendPackage: 'Send package',
    origin: 'Origin',
    destination: 'Destination',
    seats: 'Seats',
    language: 'Language',
    pickupStart: 'Pickup window start',
    pickupEnd: 'Pickup window end',
    noteText: 'Note: We search all drivers and groups for your time window.',
    findRides: 'Find rides',
    myBookings: 'My bookings',
    myPosts: 'My posts',
    navBookSend: 'Book & Send',
    navAdmin: 'Admin',
    demoAs: 'Demo as'
  },
  sn: {
    title: 'Bhuka & Tumira',
    subtitle: 'Chishandiso chekubhuka nzendo nemapakeji.',
    needRide: 'Ndiri kuda rwendo',
    imDriving: 'Ndiri kudhiraivha',
    sendPackage: 'Tumira paki',
    origin: 'Kubva',
    destination: 'Kwaunoenda',
    seats: 'Zvigaro',
    language: 'Mutauro',
    pickupStart: 'Nguva yekutora kutanga',
    pickupEnd: 'Nguva yekutora kuguma',
    noteText: 'Cherechedza: Tinoongorora vatyairi vese nemapoka panguva yawatsvaga.',
    findRides: 'Tsvaga nzendo',
    myBookings: 'Mabhukingi angu',
    myPosts: 'Zvandakaisa',
    navBookSend: 'Bhuka & Tumira',
    navAdmin: 'Admin',
    demoAs: 'Ratidza se'
  },
  nd: {
    title: 'Bhuka & Thumela',
    subtitle: 'Iwiji yokubhuka uhambo lamaphakheji.',
    needRide: 'Ngidinga uhambo',
    imDriving: 'Ngiyashayela',
    sendPackage: 'Thumela iphakheji',
    origin: 'Indawo yokuqala',
    destination: 'Indawo oya kuyo',
    seats: 'Izihlalo',
    language: 'Ulimi',
    pickupStart: 'Isikhathi sokuqala sokuthatha',
    pickupEnd: 'Isikhathi sokuphela sokuthatha',
    noteText: 'Qaphela: Sifunisisa bonke abashayeli lamaqembu ngesikhathi osikhethileyo.',
    findRides: 'Sesha uhambo',
    myBookings: 'Ukubhuka kwami',
    myPosts: 'Okuthunyelwe kwami',
    navBookSend: 'Bhuka & Thumela',
    navAdmin: 'Admin',
    demoAs: 'Bonisa njengokuthi'
  }
};

const emitter = new EventTarget();

export const getLang = (): Lang => {
  try {
    const v = localStorage.getItem('lang');
    if (v === 'en' || v === 'sn' || v === 'nd') return v;
  } catch {}
  return FALLBACK;
};

export const setLang = (lang: Lang) => {
  try { localStorage.setItem('lang', lang); } catch {}
  emitter.dispatchEvent(new Event('langchange'));
};

export const t = (key: string, lang: Lang = getLang()): string =>
  messages[lang]?.[key] ?? messages[FALLBACK][key] ?? key;

export const useLang = () => {
  const [lang, set] = useState<Lang>(getLang());
  useEffect(() => {
    const h = () => set(getLang());
    emitter.addEventListener('langchange', h);
    return () => emitter.removeEventListener('langchange', h);
  }, []);
  return { lang, setLang };
};

export const LANG_LABEL: Record<Lang, string> = { en: 'English', sn: 'Shona', nd: 'Ndebele' };
