import { LANG_LABEL, useLang, setLang } from '../i18n';

export default function LanguageSwitcher() {
  const { lang } = useLang();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as any)}
      className="border rounded px-2 py-1 text-sm"
      aria-label="Language"
    >
      <option value="en">{LANG_LABEL.en}</option>
      <option value="sn">{LANG_LABEL.sn}</option>
      <option value="nd">{LANG_LABEL.nd}</option>
    </select>
  );
}
