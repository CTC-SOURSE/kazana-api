import { useLang } from '../i18n';
import { WIDGET_URL } from '../lib/http';

export default function BookSend() {
  const { lang } = useLang();
  const src = `${WIDGET_URL}?lang=${lang}`;
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">Bhuka & Tumira</h1>
      <div className="rounded-xl border overflow-hidden">
        <iframe
          key={src}
          src={src}
          title="Kazana Book & Send"
          className="w-full h-[78vh]"
          loading="eager"
          referrerPolicy="no-referrer"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"
        />
      </div>
    </div>
  );
}
