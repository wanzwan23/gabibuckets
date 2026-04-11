<p align="center">
  <img src="public/color/flowers/peony.png" alt="Digibouquet hero flower" width="120" />
</p>

<h1 align="center">Digibouquet</h1>

<p align="center">
  Build expressive digital flower bouquets, personalize them, and share them beautifully.
</p>

<p align="center">
  <a href="#"><img alt="Vite" src="https://img.shields.io/badge/Vite-7.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" /></a>
  <a href="#"><img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ESM-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111" /></a>
  <a href="#"><img alt="License MIT" src="https://img.shields.io/badge/License-MIT-2ea44f?style=for-the-badge" /></a>
</p>

---

## Why Digibouquet

Digibouquet is a playful single-page app for crafting digital bouquets that feel personal and gift-worthy. It combines a smooth builder flow, artistic bouquet arrangement, profile and garden features, and easy sharing/export.

## Highlights

- Two bouquet modes: full color and black-and-white.
- Guided builder flow: pick flowers, arrange stems, finish and export.
- Drag-and-drop bouquet arrangement with keyboard shortcuts.
- Smart presets: curated templates and a random "Surprise Me" generator.
- Daily flower combo suggestions on the home page.
- Save bouquets to "My Garden" and browse community bouquets.
- Like community bouquets (sign-in gated via local profile).
- Download bouquet images and copy/share links.
- Light/dark theme toggle with local persistence.
- Optional UPI support modal for contribution.

## Screenshots

<p align="center">
  <img src="screenshots/Screenshot%202026-04-12%20003413.png" alt="Home page" width="47%" />
  <img src="screenshots/Screenshot%202026-04-12%20003423.png" alt="Bouquet picker" width="47%" />
</p>

<p align="center">
  <img src="screenshots/Screenshot%202026-04-12%20003432.png" alt="Bouquet arrangement" width="47%" />
  <img src="screenshots/Screenshot%202026-04-12%20003449.png" alt="Bouquet finish screen" width="47%" />
</p>

<p align="center">
  <img src="screenshots/Screenshot%202026-04-12%20003503.png" alt="Garden page" width="47%" />
  <img src="screenshots/Screenshot%202026-04-12%20003554.png" alt="Profile page" width="47%" />
</p>

<p align="center">
  <img src="screenshots/Screenshot%202026-04-12%20003710.png" alt="Mobile view" width="70%" />
</p>

## Tech Stack

- Vite 7
- Vanilla JavaScript (ES modules)
- HTML and CSS
- html2canvas (image export)

## Project Structure

```text
src/
  data/          # flower data and bouquet templates
  pages/         # SPA page renderers (home, builder, garden, profile, ...)
  utils/         # audio, auth, confetti, UPI helpers
  main.js        # app bootstrap + route map
  router.js      # hash-based SPA router with transitions
  style.css      # global styling and component styles
  theme.js       # theme toggle and persistence
public/
  color/         # colored flower assets
  mono/          # monochrome flower assets
screenshots/     # README showcase captures
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Then open the local URL shown by Vite.

### Build for production

```bash
npm run build
npm run preview
```

## Usage Flow

1. Start on Home and choose color or mono bouquet mode.
2. Pick 6-10 flowers (or use a template/surprise option).
3. Arrange your bouquet and customize wrapping/greenery.
4. Add a message, then download, copy, or share.
5. Save to your profile and view it later in My Garden.

## Notes

- Data and user actions are persisted locally in browser storage.
- Profile, likes, and saved bouquets are local to the current browser.
- UPI configuration is defined in `src/utils/upi.js`.

## License

MIT
