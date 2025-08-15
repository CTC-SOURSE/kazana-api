import { NavLink } from 'react-router-dom';
import { t, useLang } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { lang } = useLang();
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-bold">{t('title', lang)}</NavLink>
        <nav className="flex items-center gap-3">
          <NavLink to="/book-send" className="px-3 py-1 rounded hover:bg-gray-100">
            {t('navBookSend', lang)}
          </NavLink>
          <NavLink to="/admin" className="px-3 py-1 rounded hover:bg-gray-100">
            {t('navAdmin', lang)}
          </NavLink>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
