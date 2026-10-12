# LIFE QUEST

Play the possibilities. Prepare for real life.

LIFE QUEST is a mobile-first, local-first decision simulation. It runs in a modern browser without a framework install, account, API key, or network dependency. The initial product focuses on an interconnected playable story, local challenge templates, and replayable alternative choices.

## Run it

Requires Node.js 18 or newer.

```sh
npm start
```

Open <http://localhost:4173>. The app saves progress in this browser’s local storage. Use **Settings → Export your progress** to download a backup, or **Settings → Reset your game** to clear the save.

## Install and deploy the PWA

The project is a dependency-free vanilla JavaScript application (Node.js static server for local development), not a framework build. Create and preview the static production site with Node.js 18 or newer:

```sh
npm run build
npm run preview
```

The build output is `dist/`. It contains the app shell, local scenario code and illustrations, manifest, generated app icons, styles, and client code. It does not include the Node server, `.env` files, or server-side image-generation code. No environment variables, backend, database, account service, or AI provider are required for the static game. `AI_API_KEY` in `.env.example` is reserved for a future server-side scenario provider and is not consumed by the shipped static game. Optional image generation uses `LIFE_QUEST_VISUAL_API_URL`, `LIFE_QUEST_VISUAL_API_KEY`, and `LIFE_QUEST_VISUAL_ADMIN_TOKEN` on a separately hosted Node server only; these must never be set as frontend build variables. Filesystem-cached generated visuals are not part of the static deployment workflow.

### Vercel

1. Push the project to a GitHub repository.
2. Import that repository in Vercel. The included `vercel.json` runs `npm run build` and publishes `dist/` as a static site.
3. Deploy with no environment variables for the core game. Use the Vercel HTTPS URL to install from a compatible browser.

### GitHub Pages

The included Actions workflow builds and deploys on pushes to the `main` branch. Push the repository to GitHub, then set **Settings → Pages → Build and deployment → Source → GitHub Actions**. This app currently serves root-scoped URLs and service-worker scope, so use a `username.github.io` user-site repository or attach a custom domain at the root. A project Pages URL shaped like `username.github.io/repository/` needs base-path support and is not supported by this build.

### Installation and offline boundaries

Use the **Install LIFE QUEST** control in the welcome screen or the install icon in the top bar; when the browser exposes its install prompt, the game opens it after the user's tap. Otherwise, the panel gives the browser-specific Add to Home Screen steps. On iOS, open the deployed site in Safari and use **Share → Add to Home Screen**. Installation requires HTTPS, except for localhost development.

The service worker precaches the app shell, core scenario code, icons, styles, and the five bundled authored scene illustrations. The build derives a new cache version from shell content, activates it immediately, and offers an in-app reload notice when an already-open controlled app receives the update. Navigation falls back to the cached shell when offline. It deliberately bypasses `/api/` and does not cache generated-image manifests, arbitrary network responses, localStorage saves, or account/sync data. Core authored scenarios can run offline after the first successful load. Audio preferences and saved progress remain in browser localStorage on the same device; no background track files are supplied, and offline AI generation or cloud features are not provided.

`manifest.webmanifest` points to original locally generated PNG icons. The icon generator uses only Node built-ins and runs as part of the production build. Use production HTTPS hosting for browser installability checks; a successful build alone does not guarantee a browser will offer installation.

## Checks

```sh
npm test
npm run check
```

## Structure

- `src/app.js` — UI, navigation, and browser persistence.
- `src/audio.js` — centralized local-track playback, crossfades, sound cues, and local preferences.
- `src/audio-catalog.js` — per-mode music pools and game-screen to audio-state mapping.
- `src/styles.css` — responsive game interface and screen styles.
- `src/scenarios.js` — 15 authored scenarios and challenge templates.
- `src/engine.js` — deterministic state transitions, validation, and comparisons.
- `src/ai-service.js` — local challenge fallback and strict schema validation for a future server provider.
- `src/visuals.js` — scenario and outcome visual references, consistent art direction, and generated-reference validation.
- `src/avatar.js` — versioned avatar configuration, validation, randomizer, and deterministic SVG renderer.
- `src/scene-data.js` — structured, authored protagonist scene directions tied to existing scenario IDs and choice IDs.
- `server/visual-generation.js` — optional authenticated server-side image generation and local cache.
- `assets/visuals/` — lightweight original fallback illustrations for the first five connected story scenes.
- `assets/generated/manifest.json` — generated-image cache index; empty by default.
- `assets/audio/` — categorized locations for original or properly licensed soundtrack assets.
- `test/engine.test.js` — balance, transition, unlock, branch, and scenario-schema checks.
- `test/visuals.test.js` — visual mapping and secure image-generation/cache checks.
- `test/avatar.test.js` — avatar configuration, inclusive option availability, randomizer, and SVG safety checks.
- `test/scene-data.test.js` — connected scene coverage, choice/outcome mapping, supported poses, and temporary outfit isolation.
- `server.mjs` — tiny static server for local play.

## Implemented

- Profile onboarding with four starting stages.
- A guided avatar creation and review step during onboarding, with later editing from the dashboard and settings.
- A deterministic layered SVG portrait with curated skin tones, face and eye features, ten hairstyles, hair colors, body frames, six outfit styles, clothing colors, accessories, optional pronouns, and an editable character name.
- Avatar appearance updates immediately while editing and supports randomize, reset, and single-step undo. Versioned appearance settings are validated, migrated with defaults, and saved in the existing `life-quest-save-v1` profile in local storage.
- The same portrait appears on the dashboard, Life Journey decisions, consequence screens, alternative-path comparisons, and achievements. Existing scenario backgrounds remain curated scene art; player appearance is not falsely composited into those static illustrations.
- Five connected decisions now use a protagonist-led scene layout: first salary, skill development, salary review, side-business planning, and a team conversation. Each uses a distinct environment, scene description, props, and authored visual treatment for every existing choice.
- The scene renderer pairs the saved avatar with reusable apartment, study, office, small-business, and conversation-room environments. Choice selection previews the matching scene beat; the existing deterministic scenario engine still calculates the consequence. Alternative-future cards use the same avatar and choice-specific scene directions.
- Scene avatars support neutral, thinking, working, celebrating, concerned-through-worried-expression, talking, studying, and presenting poses, plus neutral, happy, curious, surprised, worried, reflective, and confident expressions. Office clothing can be a temporary render override and never changes the saved profile.
- Three modes: Life Journey, Real-Life Challenges, and Explore Alternative Futures.
- Fifteen interconnected scenarios spanning money, work, business, family, relationships, time, and risk assessment.
- Deterministic choice effects, balance guards, progression XP, skills, achievements, decision history, and local save/reset/export.
- Built-in challenge templates with optional free-text context.
- Side-by-side original and alternative resource comparisons; alternative runs are recorded separately and do not replace the original path.
- A validated AI-service interface and offline fallback. No live AI provider is connected.
- Five connected scenarios have consistent Lagos-set illustrations, player-character continuity, scene descriptions, alt text, and choice/outcome-specific visual prompt metadata.
- Situation, selected-decision, consequence, reflection, and original-versus-alternative screens resolve visuals by scenario and outcome. Missing assets get a designed fallback card; SVG art is local and small.
- Optional admin-triggered image generation stores API credentials on the server, validates PNG output and local asset paths, and caches successes so a scene is generated only once. Normal play never calls the image provider.

## Future work and limits

- The simulation is intentionally a fictional reflection tool. Game amounts are illustrative and do not forecast real outcomes or provide professional advice.
- Cloud accounts/sync, live AI, generated dialogue, multiplayer, and monetization are not connected.
- Time and wellbeing are simple game indicators, not real measurements. Delayed event scheduling and a true calendar/tick system are reserved for a later iteration.
- The scenario engine has deterministic unlocks, but later chapters currently become available along a shared authored chain rather than branching into unique authored trees.
- Initial fallback artwork is custom vector illustration rather than photorealistic generated art. No image-generation provider is configured by default; the game remains fully playable with local art and fallback cards.
- Avatar art is original stylized vector SVG, rendered locally without uploads, dependencies, or an AI service. It is a portrait system, not a full-body scene compositor. Hairstyle/outfit art is simplified for the current illustration style, and a broader named-pronoun or additional option catalog may be useful in a later accessibility/content pass.
- The five protagonist environments are authored CSS/vector compositions rather than generated or photographic backgrounds. Supporting characters are described in the scene text and remain part of future art work; this first pass focuses the stage on the player avatar and objects. Poses are lightweight SVG gestures and transitions, not skeletal animation. No AI scene provider is configured or needed.

### Optional visual generation

The optional adapter uses a server-only, OpenAI-compatible image endpoint that accepts `POST` JSON `{ "prompt": "…", "response_format": "b64_json", "output_format": "png" }` with a bearer API key and returns `{ "data": [{ "b64_json": "…" }] }`. Set `LIFE_QUEST_VISUAL_API_URL`, `LIFE_QUEST_VISUAL_API_KEY`, and a private `LIFE_QUEST_VISUAL_ADMIN_TOKEN` in the server environment. The configured provider must return PNG data in that format; no provider is assumed or contacted until configured.

Use the authenticated admin endpoint to pre-generate and cache one approved visual; for example, `POST /api/visuals/generate` with `Authorization: Bearer <admin-token>` and JSON `{ "scenarioId": "first-pay", "imageKey": "celebrate" }`. Valid image keys are `introduction`, `decision`, or one of that scene’s choice IDs. The generated file and manifest entry are stored under `assets/generated/`; the browser receives only local asset paths, never provider credentials. Keep these files in the deployment’s persistent writable storage.

### Audio

- The previous background layer was a sustained three-oscillator chord whose only variation was a chord change every 10.5 seconds. Most screens shared the same few states, so it sounded static and repetitive rather than like a modern game soundtrack.
- A central player now supports separate local music pools for menu, Life Journey, challenges, decisions, outcomes, achievements, and alternative futures. It selects without immediate repeats, crossfades between decks, fades while the tab is hidden, and resumes only after a user gesture. Playback and resource failures are contained so they cannot block gameplay.
- **No background music tracks or recorded sound effects are currently installed.** The catalog is intentionally empty and the game does not substitute synthesized tones for a soundtrack. Short Web Audio UI cues remain (selection, confirm, reveal, achievements, dialog, error, and success); they are sound cues, not background music.
- Add original or properly licensed files to the categories listed in `assets/audio/README.md`, then register their same-origin `/assets/audio/...` paths in `src/audio-catalog.js`. Expected track names are documented there. Prefer small, loop-ready OGG/MP3 files and include license/source notes before shipping.
- The audio panel independently controls music and effects volumes, their toggles, and master mute. A quick mute button is available on gameplay screens. Preferences are stored in `life-quest-audio-v1`.
- Until those assets are supplied, settings clearly report that music is unavailable; the rest of the game and its silent mode remain fully playable. No external service or dependency is required.
