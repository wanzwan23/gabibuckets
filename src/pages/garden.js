import { gardenBouquets, getFlowerById, greeneryImages, greeneryTopImages } from '../data/flowers.js';
import { navigate } from '../router.js';
import { getSavedBouquets, deleteSavedBouquet } from './bouquet.js';
import { isLoggedIn } from '../utils/auth.js';
import { showLoginPrompt } from './profile.js';

// Same seeded random from bouquet.js
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateArrangement(flowerList, seed) {
  const rand = seededRandom(Math.floor(seed));
  const positions = [];
  const canvasWidth = 300;
  const canvasHeight = 300;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight * 0.42;

  flowerList.forEach((flowerId, i) => {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const angle = i * goldenAngle + rand() * 0.8;
    const t = i / Math.max(flowerList.length - 1, 1);
    const radius = 15 + t * 80 + rand() * 25;
    const x = centerX + Math.cos(angle) * radius * 0.85 - 40;
    const y = centerY + Math.sin(angle) * radius * 0.65 - 40;
    const rotation = (rand() - 0.5) * 25;
    const scale = 0.55 + rand() * 0.35;
    const zIndex = 3 + Math.floor(rand() * 12);

    positions.push({
      flowerId,
      x: Math.max(5, Math.min(canvasWidth - 85, x)),
      y: Math.max(canvasHeight * 0.03, Math.min(canvasHeight * 0.60, y)),
      rotation,
      scale,
      zIndex,
    });
  });

  positions.sort((a, b) => a.y - b.y);
  return positions;
}

let currentTab = 'community'; // 'community' | 'my'
let currentSort = 'default'; // 'default' | 'liked'

function renderBouquetCard(bouquet, idx, options = {}) {
  const { isSaved = false } = options;
  const positions = generateArrangement(bouquet.flowers, bouquet.seed || bouquet.id);
  const greeneryIdx = (bouquet.greeneryIndex || 0) % greeneryImages.length;
  const likedStr = localStorage.getItem(`liked_bouquet_${bouquet.id}`);
  const isLiked = likedStr === 'true';
  const baseLikes = isSaved ? 0 : (bouquet.id * 14 + 7);
  const likes = baseLikes + (isLiked ? 1 : 0);

  const dateStr = bouquet.date
    ? new Date(bouquet.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  // Creator attribution
  const creatorName = bouquet.creatorName || bouquet.creator || '';
  const creatorAvatar = bouquet.creatorAvatar || '🌸';
  const creatorLabel = creatorName ? `${creatorAvatar} by ${creatorName}` : '';

  return `
    <div class="garden-card animate-in" style="animation-delay: ${idx * 0.07}s">
      <img
        src="${greeneryImages[greeneryIdx]}"
        alt="Greenery"
        class="bouquet-greenery"
      />
      ${positions.map(p => {
    const flower = getFlowerById(p.flowerId);
    if (!flower) return '';
    return `
          <img
            src="${flower.image}"
            alt="${flower.name}"
            class="bouquet-flower"
            style="
              left: ${p.x}px;
              top: ${p.y}px;
              transform: rotate(${p.rotation}deg) scale(${p.scale});
              z-index: ${p.zIndex};
              width: 80px;
              height: 80px;
            "
          />
        `;
  }).join('')}
      <img
        src="${greeneryTopImages[greeneryIdx % greeneryTopImages.length]}"
        alt=""
        class="bouquet-greenery-top"
      />
      <div class="garden-card-overlay">
        <div style="display: flex; gap: 0.5rem; justify-content: center; width: 100%; flex-wrap: wrap;">
          ${!isSaved ? `
            <button class="garden-card-action-btn like-btn ${isLiked ? 'liked' : ''}" data-like-id="${bouquet.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span class="like-count">${likes}</span>
            </button>
          ` : ''}
          <button class="garden-card-action-btn use-btn" data-bouquet-id="${bouquet.id}" ${isSaved ? 'data-saved="true"' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Use
          </button>
          ${isSaved ? `
            <button class="garden-card-action-btn delete-btn" data-delete-id="${bouquet.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Delete
            </button>
          ` : ''}
        </div>
        <span class="garden-card-creator">${creatorLabel}</span>
        ${dateStr ? `<span class="garden-card-date-label">${dateStr}</span>` : ''}
      </div>
    </div>
  `;
}

export function renderGarden(app) {
  const savedBouquets = getSavedBouquets();
  const hasSaved = savedBouquets.length > 0;

  // Sort community bouquets
  let sortedBouquets = [...gardenBouquets];
  if (currentSort === 'liked') {
    sortedBouquets.sort((a, b) => {
      const aLiked = localStorage.getItem(`liked_bouquet_${a.id}`) === 'true';
      const bLiked = localStorage.getItem(`liked_bouquet_${b.id}`) === 'true';
      const aLikes = a.id * 14 + 7 + (aLiked ? 1 : 0);
      const bLikes = b.id * 14 + 7 + (bLiked ? 1 : 0);
      return bLikes - aLikes;
    });
  }

  app.innerHTML = `
    <div class="page-frame">
      <div class="garden-page">
        <div class="garden-header">
          <a class="logo logo-small" id="logo-home">Digibouquet</a>
          <h1 class="section-title" style="margin-top: 1.5rem;">Our Garden</h1>
          <p class="section-subtitle" style="margin-top: 0.5rem;">
            A peek at some of the bouquets people have made!
          </p>
        </div>

        <!-- Tab Controls -->
        ${hasSaved ? `
          <div class="garden-tabs" id="garden-tabs">
            <button class="garden-tab ${currentTab === 'community' ? 'active' : ''}" data-tab="community">
              🌸 Community
            </button>
            <button class="garden-tab ${currentTab === 'my' ? 'active' : ''}" data-tab="my">
              📌 My Bouquets (${savedBouquets.length})
            </button>
          </div>
        ` : ''}

        <!-- Sort Controls (for community tab) -->
        ${currentTab === 'community' ? `
          <div class="garden-sort" style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem; justify-content: center;">
            <button class="btn btn-small ${currentSort === 'default' ? 'btn-primary' : 'btn-secondary'}" data-sort="default">
              Newest
            </button>
            <button class="btn btn-small ${currentSort === 'liked' ? 'btn-primary' : 'btn-secondary'}" data-sort="liked">
              Most Liked
            </button>
          </div>
        ` : ''}

        <div class="garden-grid" id="garden-grid">
          ${currentTab === 'community'
      ? sortedBouquets.map((bouquet, idx) => renderBouquetCard(bouquet, idx)).join('')
      : savedBouquets.map((bouquet, idx) => renderBouquetCard(bouquet, idx, { isSaved: true })).join('')
    }
        </div>

        ${currentTab === 'my' && savedBouquets.length === 0 ? `
          <div class="garden-empty" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            <p style="font-size: 2rem; margin-bottom: 0.5rem;">🌿</p>
            <p style="font-style: italic;">Your garden is empty. Build a bouquet and save it!</p>
          </div>
        ` : ''}

        <div style="margin-top: 3rem; text-align: center;">
          <button class="btn btn-primary" id="btn-create">
            Build Your Own
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('logo-home').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/');
  });

  document.getElementById('btn-create').addEventListener('click', () => {
    navigate('/bouquet?mode=color');
  });

  // Tab controls
  document.querySelectorAll('.garden-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.tab;
      renderGarden(app);
    });
  });

  // Sort controls
  document.querySelectorAll('[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSort = btn.dataset.sort;
      renderGarden(app);
    });
  });

  // "Use as Template"
  document.querySelectorAll('.use-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bouquetId = parseInt(btn.dataset.bouquetId, 10);
      const isSaved = btn.dataset.saved === 'true';

      let bouquet;
      if (isSaved) {
        bouquet = savedBouquets.find(b => b.id === bouquetId);
      } else {
        bouquet = gardenBouquets.find(b => b.id === bouquetId);
      }
      if (!bouquet) return;

      const params = new URLSearchParams();
      params.set('mode', bouquet.mode || 'color');
      params.set('template', bouquet.flowers.join(','));
      params.set('seed', (bouquet.seed || bouquet.id).toString());
      params.set('g', (bouquet.greeneryIndex || 0).toString());
      navigate(`/bouquet?${params.toString()}`);
    });
  });

  // "Like" functionality
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isLoggedIn()) {
        showLoginPrompt('Sign in to like bouquets!');
        return;
      }
      const bouquetId = btn.dataset.likeId;
      const key = `liked_bouquet_${bouquetId}`;
      const isLiked = localStorage.getItem(key) === 'true';
      const countSpan = btn.querySelector('.like-count');
      let count = parseInt(countSpan.textContent, 10);

      if (isLiked) {
        localStorage.setItem(key, 'false');
        btn.classList.remove('liked');
        btn.querySelector('svg').setAttribute('fill', 'none');
        countSpan.textContent = count - 1;
      } else {
        localStorage.setItem(key, 'true');
        btn.classList.add('liked');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
        countSpan.textContent = count + 1;
        // Add a little bounce animation
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => { btn.style.transform = ''; }, 200);
      }
    });
  });

  // Delete saved bouquet
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.deleteId, 10);
      deleteSavedBouquet(id);
      renderGarden(app);
    });
  });
}
