# MyLove · قصائد من القلب 💗

An interactive, full-screen **3D romantic poetry** website. Poem titles glide
continuously around a glowing heart outline; click one to open an elegant,
accessible dialog with the full poem. Fully **Arabic / RTL** aware.

Built with **React + Vite + TypeScript + Tailwind CSS v4 + Three.js /
React Three Fiber + @react-three/drei + Framer Motion + Lucide React**.
No Next.js, no SSR — a pure client-side single-page app.

## Features

- Full-screen React Three Fiber scene: glowing heart outline, orbiting poem
  titles, floating glow particles, a star field, soft lighting and a gentle
  faux-bloom.
- Poem titles travel smoothly around a mathematically-generated heart curve,
  each with its own offset; they slow on hover and while a dialog is open.
- Correct Arabic shaping + RTL for titles and poems (titles use drei `<Html/>`
  so the browser shapes the text — troika 3D text cannot join Arabic letters).
- Animated intro screen, minimal transparent header, optional background-music
  toggle, pointer-driven parallax camera (disabled on mobile).
- Accessible poem modal (`role="dialog"`, Escape / backdrop / button to close).
- Responsive + performance-conscious (memoized geometry, refs in `useFrame`,
  DPR cap, lazy-loaded scene, reduced particle counts on mobile).
- Graceful fallbacks for missing audio, slow fonts and unavailable WebGL.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (default http://localhost:5173).

### Production build

```bash
npm run build      # type-checks then bundles to ./dist
npm run preview    # serve the production build locally
```

## Assets

- **Arabic font** — `public/fonts/NotoNaskhArabic-Regular.ttf`. If it is
  missing, the app falls back to a system Arabic font (text still shapes
  correctly).
- **Background music** — optional. Drop an MP3 at
  `public/audio/background-music.mp3`. When absent, the sound toggle simply
  stays disabled — the app never crashes. Music never autoplays; it starts only
  after the user taps the sound button.

## Project structure

```text
src/
├── components/
│   ├── AudioControl.tsx      # music toggle (useAudio + lucide icons)
│   ├── BackgroundParticles.tsx
│   ├── CameraController.tsx
│   ├── HeartPath.tsx         # glowing, breathing heart outline
│   ├── IntroScreen.tsx
│   ├── LoadingScreen.tsx     # Suspense fallback
│   ├── LoveExperience.tsx    # top-level orchestrator (state + overlays)
│   ├── LoveScene.tsx         # lazy-loaded R3F <Canvas>
│   ├── PoemDialog.tsx        # accessible animated modal
│   └── PoemTitle.tsx         # one title orbiting the heart
├── data/poems.ts
├── hooks/{useAudio,useIsMobile,useWebGLSupport}.ts
├── types/poem.ts
├── utils/heartCurve.ts       # parametric heart curve + sampler
├── App.tsx                   # WebGL gate + fallback
├── main.tsx
└── index.css                 # Tailwind v4 theme + Arabic @font-face
```

## Editing the poems

Edit `src/data/poems.ts`. Each poem is `{ id, title, content }`; use real line
breaks in `content` (they are preserved via `white-space: pre-line`).
