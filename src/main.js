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
import { inject } from '@vercel/analytics';

const app = document.getElementById('app');
const SEO_BASE_URL = 'https://digibouquet-sooty.vercel.app';

const SEO_DEFAULT = {
  title: 'Digibouquet | Send a Digital Flower Bouquet',
  description: 'Build and send beautiful, everlasting digital flower bouquets. Pick your blooms, arrange them with love, and share with someone special.',
  path: '/',
};

function upsertMeta(key, value, property = false) {
  const selector = property ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let meta = document.querySelector(selector);
  if (!meta) {
    meta = document.createElement('meta');
    if (property) {
      meta.setAttribute('property', key);
    } else {
      meta.setAttribute('name', key);
    }
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', value);
}

function updateSeo(seo) {
  const merged = { ...SEO_DEFAULT, ...seo };
  const hashPath = merged.path === '/' ? '/' : `/#${merged.path}`;
  const pageUrl = `${SEO_BASE_URL}${hashPath}`;

  document.title = merged.title;
  upsertMeta('description', merged.description);
  upsertMeta('og:title', merged.title, true);
  upsertMeta('og:description', merged.description, true);
  upsertMeta('og:url', pageUrl, true);
  upsertMeta('twitter:title', merged.title);
  upsertMeta('twitter:description', merged.description);
  upsertMeta('twitter:url', pageUrl);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', pageUrl);
}

// Initialize toggles & profile
initThemeToggle();
initMuteToggle();
initProfileButton();
initScrollToTop();
inject();

const router = new Router({
  '/': {
    render: () => {
      updateSeo({
        title: 'Digibouquet | Send a Digital Flower Bouquet',
        description: 'Create personalized digital flower bouquets online. Pick flowers, arrange blooms, and share instantly.',
        path: '/',
      });
      renderHome(app);
    },
  },
  '/bouquet': {
    render: (params) => {
      const mode = params.get('mode') || 'color';
      updateSeo({
        title: `Build Your ${mode === 'mono' ? 'Black & White ' : ''}Bouquet | Digibouquet`,
        description: 'Build your bouquet with 6 to 10 flowers, customize arrangement and wrapping, then download and share your creation.',
        path: '/bouquet',
      });
      renderBouquet(app, params);
    },
  },
  '/garden': {
    render: () => {
      updateSeo({
        title: 'Garden Gallery | Digibouquet',
        description: 'Browse community bouquets and saved creations in the Digibouquet garden gallery.',
        path: '/garden',
      });
      renderGarden(app);
    },
  },
  '/view': {
    render: (params) => {
      updateSeo({
        title: 'Shared Bouquet | Digibouquet',
        description: 'View a shared digital bouquet and create one of your own.',
        path: '/view',
      });
      renderSharedView(app, params);
    },
  },
  '/profile': {
    render: () => {
      updateSeo({
        title: 'My Profile | Digibouquet',
        description: 'Manage your Digibouquet profile and revisit your saved bouquet history.',
        path: '/profile',
      });
      renderProfile(app);
    },
  },
  '/about': {
    render: () => {
      updateSeo({
        title: 'About Digibouquet',
        description: 'Learn about Digibouquet, bouquet design tips, keyboard shortcuts, and flower meanings.',
        path: '/about',
      });
      renderAbout(app);
    },
  },
  '*': {
    render: () => {
      updateSeo({
        title: 'Page Not Found | Digibouquet',
        description: 'The page you are looking for does not exist. Explore Digibouquet and create a floral masterpiece.',
        path: '/',
      });
      renderNotFound(app);
    },
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
