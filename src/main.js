import './style.css';
import { Router } from './router.js';
import { renderHome } from './pages/home.js';
import { renderBouquet, renderSharedView } from './pages/bouquet.js';
import { renderGarden } from './pages/garden.js';
import { renderProfile, initProfileButton } from './pages/profile.js';
import { renderAbout } from './pages/about.js';
import { renderNotFound } from './pages/notfound.js';
import { initThemeToggle } from './theme.js';
import { initMuteToggle } from './utils/audio.js';

const app = document.getElementById('app');

// Initialize toggles & profile
initThemeToggle();
initMuteToggle();
initProfileButton();
initScrollToTop();

const router = new Router({
  '/': {
    render: () => renderHome(app),
  },
  '/bouquet': {
    render: (params) => renderBouquet(app, params),
  },
  '/garden': {
    render: () => renderGarden(app),
  },
  '/view': {
    render: (params) => renderSharedView(app, params),
  },
  '/profile': {
    render: () => renderProfile(app),
  },
  '/about': {
    render: () => renderAbout(app),
  },
  '*': {
    render: () => renderNotFound(app),
  },
});

router.start();

// --- Scroll to Top Button ---
function initScrollToTop() {
  if (document.getElementById('scroll-top-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'scroll-top-btn';
  btn.className = 'scroll-top-btn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(btn);

  let scrollTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, 50);
  });
}
