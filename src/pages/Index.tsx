import { t, useLang } from '../i18n';
import { useNavigate } from 'react-router-dom';

export default function IndexPage() {
  const { lang } = useLang();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold">{t('title', lang)}</h1>
      <p className="text-gray-600 mb-6">{t('subtitle', lang)}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <form className="rounded-xl border p-4">
          <div className="mb-3">
            <label className="block text-sm mb-1">{t('origin', lang)}</label>
            <input className="w-full border rounded px-3 py-2" placeholder={t('origin', lang)} />
          </div>
          <div className="mb-3">
            <label className="block text-sm mb-1">{t('destination', lang)}</label>
            <input className="w-full border rounded px-3 py-2" placeholder={t('destination', lang)} />
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">{t('pickupStart', lang)}</label>
              <input type="datetime-local" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">{t('pickupEnd', lang)}</label>
              <input type="datetime-local" className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">{t('seats', lang)}</label>
            <input type="number" min={1} className="w-full border rounded px-3 py-2" />
          </div>
          <p className="text-xs text-gray-500 mb-3">{t('noteText', lang)}</p>
          <button type="button" className="w-full rounded bg-black text-white py-2">
            {t('findRides', lang)}
          </button>
        </form>

        <div className="rounded-xl border p-4 space-y-3">
          <button className="w-full border rounded py-2">{t('needRide', lang)}</button>
          <button className="w-full border rounded py-2">{t('imDriving', lang)}</button>
          <button
            className="w-full rounded bg-black text-white py-2"
            onClick={() => navigate('/book-send')}
          >
            {t('sendPackage', lang)}
          </button>
          <div className="pt-2 text-sm text-gray-600 flex gap-4">
            <span>{t('myBookings', lang)}</span>
            <span>{t('myPosts', lang)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
