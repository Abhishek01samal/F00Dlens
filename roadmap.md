# Roadmap — Migrate FoodLens AI (code archive) into Cloud

Source: uploaded ZIP `foodlens-ai-insights-91-main.zip` (Vite SPA, Clerk auth, browser-side Gemini calls, localStorage history, empty Supabase).

- [x] Inspect archive, produce migration spec (/tmp/migration-spec.json)
- [x] Enable Cloud; enable email auth; enable Google sign-in
- [x] Install packages (framer-motion, three, tsparticles, react-dropzone)
- [x] Copy components + custom UI into project
- [x] Convert src/index.css (HSL themes) to Tailwind v4 src/styles.css
- [x] Port auth: replace Clerk with Cloud (email/password + Google), keep LoginPage UX
- [x] Move Gemini calls server-side (AI Gateway, gemini-3.8-flash, JSON prompts preserved)
- [x] Routes: index (auth gate inline, ssr:false), root head/Toaster/404
- [x] Build + tests green
- [x] Browser verify: sign-in gate, sign-up (email confirmation), sign-in, app renders, AI analysis works signed-in
- [x] Ledger (.external/migrate-external-project/ledger.json) + temp test users removed

Open (blocked on user input):
- [ ] Clerk user export (emails + original IDs) if existing users should be imported — waiting on user
- [ ] User revokes the exposed Gemini API key from the old project (in Google AI Studio)
