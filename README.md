<div align="center">

<img src="public/color/flowers/peony.png" alt="Digibouquet Logo" width="140" style="margin-bottom: 20px;" />

# 🌷 Digibouquet

**Craft, personalize, and share digital flower bouquets that never wilt.**

<p align="center">
  <a href="https://digibouquet-sooty.vercel.app/"><img alt="Live Demo" src="https://img.shields.io/badge/🟢_Live_Demo-Online-success?style=for-the-badge" /></a>
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ESM-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111" />
  <img alt="MIT License" src="https://img.shields.io/badge/License-MIT-2ea44f?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-the-experience"><b>Experience</b></a> • 
  <a href="#-features"><b>Features</b></a> • 
  <a href="#-tech-stack"><b>Tech</b></a> • 
  <a href="#-getting-started"><b>Deploy</b></a>
</p>

---

<img src="public/og-image.png" alt="Digibouquet Cover" width="100%" style="border-radius: 12px; margin-top: 15px; border: 1px solid #ddd;" />

</div>

<br/>

## 📖 The Story

**Digibouquet** is a modern, interactive web platform where people can design expressive floral arrangements, deeply personalize them, and share them instantly with friends and loved ones. Built with pure JavaScript and a focus on smooth drag-and-drop mechanics, the app provides a playful, emotional, and satisfying gifting experience. It’s completely free, requires no water, and the memories last forever.

> _"For gifting moments that do not fade."_

---

## ✨ Features & Walkthrough

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🎨 1. Build Mode</h3>
      <p>Start your arrangement by curating a mood. Choose between vibrant full-color bouquets or sleek monochrome styles depending on your recipient.</p>
    </td>
    <td width="50%" valign="top">
      <img src="screenshots/Screenshot 2026-04-12 003554.png" alt="Home screen" width="100%" style="border-radius:8px" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <img src="screenshots/Screenshot%202026-04-12%20003423.png" alt="Flower picker" width="100%" style="border-radius:8px" />
    </td>
    <td width="50%" valign="top">
      <h3>🌺 2. Smart Picking</h3>
      <p>Select 6 to 10 unique flowers from an expansive library. Not feeling creative? Use quick templates or tap "Surprise Me" for an algorithmic layout.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>✨ 3. Interactive Canvas</h3>
      <p>Drag, drop, arrange, and rotate flowers on a dynamic canvas. The app handles natural z-index layering to make your bouquet look professionally composed.</p>
    </td>
    <td width="50%" valign="top">
      <img src="screenshots/Screenshot%202026-04-12%20003432.png" alt="Arrangement canvas" width="100%" style="border-radius:8px" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <img src="screenshots/Screenshot 2026-04-12 003710.png" alt="Finish bouquet" width="100%" style="border-radius:8px" />
    </td>
    <td width="50%" valign="top">
      <h3>🎀 4. Polish & Share</h3>
      <p>Wrap it up! Add greenery, pick a ribbon, and attach a heartfelt text message. Then instantly download the image, copy it to clipboard, or share a direct link.</p>
    </td>
  </tr>
</table>

### 💎 Additional Gems
- **The Garden**: Explore a community gallery of generated bouquets and save your own.
- **Local Profiles**: Keep an isolated history of everything you’ve created with custom avatars.
- **Micro-Interactions**: Features a dark/light theme toggle, ambient audio mode, celebratory confetti, and fluid page transitions.

<br>

<div align="center">
  <img src="screenshots/Screenshot%202026-04-12%20003710.png" alt="Responsive Layouts" width="70%" style="border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.1);" />
  <p><i>Flawless responsive design for mobile, tablet, and desktop.</i></p>
</div>

<br>

---

## 💻 Tech Stack

Digibouquet is built to be fast, lightweight, and completely decentralized from heavy frameworks. 

- **Bundler**: `Vite 7`
- **Logic**: Vanilla JavaScript (`ES Modules`)
- **Styling**: Modern HTML5 + Custom CSS Variables
- **Exporting**: `html2canvas` for precise screenshot rendering
- **Routing**: Custom Hash-based SPA Router with state transitions

---

## 🚀 Getting Started

Want to run the garden locally? It takes less than a minute.

### Prerequisites
- Node.js 18.x or newer
- npm 9.x or newer

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/digibouquet.git

# Enter the directory
cd digibouquet

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Your app will be running at `http://localhost:5173`.

---

## 🌐 Deploying

### Option 1: Vercel (Recommended)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option 2: Netlify
Set the **Build command** to `npm run build` and **Publish directory** to `dist`.

---

## 🔍 SEO & Accessibility
- Fully integrated JSON-LD structured data.
- Open Graph imagery, Twitter cards, and semantic HTML structure.
- ARIA accessibility guidelines enforced on custom interactive components.

---

<div align="center">
  <p>Built with ❤️ and ☕. Released under the <b>MIT License</b>.</p>
</div>
