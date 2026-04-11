<div align="center">

<img src="public/color/flowers/peony.png" alt="Digibouquet flower" width="120" />

# Digibouquet

### Craft and share digital flower bouquets with heart.

<p>
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ESM-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111" />
  <img alt="MIT License" src="https://img.shields.io/badge/License-MIT-2ea44f?style=for-the-badge" />
</p>

<p>
  <a href="https://digibouquet.vercel.app/"><b>Live Demo</b></a>
  ·
  <a href="#-features"><b>Features</b></a>
  ·
  <a href="#-screenshots"><b>Screenshots</b></a>
  ·
  <a href="#-deploy"><b>Deploy</b></a>
</p>

</div>

---

## Bloom Story

Digibouquet is a modern bouquet builder where people can design expressive floral arrangements, personalize them, and share them instantly. It is playful, emotional, and built for gifting moments that do not fade.

## Features

| Experience | What it does |
| --- | --- |
| Build Mode | Choose color or monochrome bouquet styles |
| Smart Picking | Pick 6-10 flowers, use templates, or tap Surprise Me |
| Arrangement Canvas | Drag and place flowers with natural layered composition |
| Polish | Choose wraps, greenery, and a bouquet message |
| Share Tools | Download image, copy image, and share links |
| Garden | Explore community bouquets and save your own |
| Profile | Create local profile with avatar and bouquet history |
| Quality of Life | Theme toggle, audio toggle, keyboard shortcuts |

## Screenshots

<p align="center">
  <img src="screenshots/Screenshot%202026-04-12%20003413.png" alt="Home screen" width="47%" />
  <img src="screenshots/Screenshot%202026-04-12%20003423.png" alt="Flower picker" width="47%" />
</p>

<p align="center">
  <img src="screenshots/Screenshot%202026-04-12%20003432.png" alt="Arrangement canvas" width="47%" />
  <img src="screenshots/Screenshot%202026-04-12%20003449.png" alt="Finish bouquet" width="47%" />
</p>

<p align="center">
  <img src="screenshots/Screenshot%202026-04-12%20003503.png" alt="Garden gallery" width="47%" />
  <img src="screenshots/Screenshot%202026-04-12%20003554.png" alt="Profile view" width="47%" />
</p>

<p align="center">
  <img src="screenshots/Screenshot%202026-04-12%20003710.png" alt="Responsive mobile layout" width="72%" />
</p>

## Tech Stack

- Vite 7
- Vanilla JavaScript (ES modules)
- HTML + CSS
- html2canvas for bouquet export

## Project Structure

```text
src/
  data/        flower catalog and bouquet presets
  pages/       route-level page renderers
  utils/       audio, auth, confetti, upi helpers
  main.js      app bootstrap and route mapping
  router.js    hash-based SPA router with transitions
  style.css    UI styling and animations
  theme.js     dark and light theme persistence
public/
  color/       colored flower assets
  mono/        monochrome flower assets
screenshots/   README visual gallery
```

## Run Locally

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Install

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Deploy

### Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Netlify

- Build command: npm run build
- Publish directory: dist

## SEO Included

- Route-aware title and description updates
- Open Graph and Twitter metadata
- Canonical URLs
- robots.txt and sitemap.xml
- JSON-LD structured data for web application

## License

MIT
