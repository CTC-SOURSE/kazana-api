# Kazana ride-share – minimal patch (frontend)

## New files you can add via GitHub Web:
- `src/i18n.ts`
- `src/lib/http.ts`
- `src/lib/api.ts`
- `src/components/LanguageSwitcher.tsx`
- `src/pages/BookSend.tsx`

## Minimal manual edits (web editor)
1) **Header component** (or App header area):
   - Import: `import LanguageSwitcher from './components/LanguageSwitcher';`
   - Import: `import { t, useLang } from './i18n';`
   - Render `<LanguageSwitcher />` in the right side.
   - Replace hard-coded nav labels with `{t('navBookSend', lang)}` and `{t('navAdmin', lang)}`.
2) **Router** (usually in `src/App.tsx`):
   - Add route: `<Route path="/book-send" element={<BookSend />} />`
   - Import the page: `import BookSend from './pages/BookSend';`
3) **Home page** (e.g., `src/pages/Index.tsx`):
   - Import `{ t, useLang }` from `../i18n`.
   - Wrap ALL labels with `t('key', lang)` and change the Send Package button to `navigate('/book-send')`.

## Build env
Create a frontend env var in Vite:
- In GitHub → Settings → Secrets → Actions: add `VITE_API_BASE=https://kazana-api-production.up.railway.app`

Commit and redeploy. Language persists in localStorage and iframe uses the selected language.
