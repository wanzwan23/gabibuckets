import { flowers, getFlowerById, greeneryImages, monoGreeneryImages, greeneryTopImages, monoGreeneryTopImages } from '../data/flowers.js';
import { navigate } from '../router.js';
import html2canvas from 'html2canvas';
import { initAudio, playPlopSound, playChimeSound, playRustleSound } from '../utils/audio.js';
import { celebrate } from '../utils/confetti.js';
import { isLoggedIn, getProfile } from '../utils/auth.js';
import { showLoginPrompt } from './profile.js';
import { openUpiPaymentModal } from '../utils/upi.js';

let selectedFlowers = {}; // { flowerId: count }
let undoStack = [];
let redoStack = [];

let currentStep = 'pick'; // 'pick' | 'arrange' | 'finish'
let currentMode = 'color';
let arrangementSeed = Math.random();
let greeneryIndex = 0;
let bouquetMessage = '';
let wrappingPaperClass = 'wrap-classic';
let currentPositions = null;
let hasPromptedDonation = false;

// Drag state
let dragTarget = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Keyboard shortcut handler ref
let keyboardHandler = null;

const WRAPPING_OPTIONS = [
  { class: 'wrap-classic', label: 'Classic Cream' },
  { class: 'wrap-rose', label: 'Blushing Rose' },
  { class: 'wrap-sage', label: 'Sage Garden' },
  { class: 'wrap-slate', label: 'Midnight Slate' },
  { class: 'vase-glass', label: 'Glass Vase' },
  { class: 'vase-ceramic', label: 'Ceramic Pot' }
];

export const TEMPLATES = [
  {
    id: 'birthday',
    name: '🎂 Birthday',
    flowers: { 'sunflower': 3, 'daisy': 3, 'dahlia': 2 },
    wrap: 'wrap-sage'
  },
  {
    id: 'thinking',
    name: '💭 Thinking of You',
    flowers: { 'hydrangea': 2, 'orchid': 2, 'ranunculus': 3 },
    wrap: 'wrap-classic'
  },
  {
    id: 'sympathy',
    name: '🕊️ Sympathy',
    flowers: { 'lily': 3, 'daisy': 3, 'carnation': 2 },
    wrap: 'wrap-slate'
  },
  {
    id: 'anniversary',
    name: '💕 Anniversary',
    flowers: { 'rose': 4, 'peony': 2, 'tulip': 2 },
    wrap: 'wrap-rose'
  }
];

function getGreeneryImage(index) {
  if (currentMode === 'mono') {
    return monoGreeneryImages[index % monoGreeneryImages.length];
  }
  return greeneryImages[index % greeneryImages.length];
}

function getGreeneryTopImage(index) {
  if (currentMode === 'mono') {
    return monoGreeneryTopImages[index % monoGreeneryTopImages.length];
  }
  return greeneryTopImages[index % greeneryTopImages.length];
}

function getTotalCount() {
  return Object.values(selectedFlowers).reduce((sum, c) => sum + c, 0);
}

function getSelectedFlowerList() {
  const list = [];
  for (const [id, count] of Object.entries(selectedFlowers)) {
    for (let i = 0; i < count; i++) {
      list.push(id);
    }
  }
  return list;
}

// Seeded random for consistent arrangement
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateArrangement(flowerList, seed) {
  const rand = seededRandom(Math.floor(seed * 100000));
  const positions = [];
  const canvasWidth = 520;
  const canvasHeight = 580;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight * 0.42;

  flowerList.forEach((flowerId, i) => {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const angle = i * goldenAngle + rand() * 0.8;
    const t = i / Math.max(flowerList.length - 1, 1);
    const radius = 25 + t * 120 + rand() * 35;
    const x = centerX + Math.cos(angle) * radius * 0.9 - 60;
    const y = centerY + Math.sin(angle) * radius * 0.7 - 60;
    const rotation = (rand() - 0.5) * 30;
    const scale = 0.7 + rand() * 0.4;
    const zIndex = 3 + Math.floor(rand() * 12);

    positions.push({
      flowerId,
      x: Math.max(canvasWidth * 0.05, Math.min(canvasWidth * 0.75, x)),
      y: Math.max(canvasHeight * 0.05, Math.min(canvasHeight * 0.62, y)),
      rotation,
      scale,
      zIndex,
    });
  });

  positions.sort((a, b) => a.y - b.y);
  return positions;
}

// --- Keyboard shortcuts ---
function attachKeyboardShortcuts(app) {
  if (keyboardHandler) {
    document.removeEventListener('keydown', keyboardHandler);
  }
  keyboardHandler = (e) => {
    const isCtrl = e.ctrlKey || e.metaKey;

    // Ctrl+Z = undo, Ctrl+Shift+Z = redo (only on pick step)
    if (currentStep === 'pick' && isCtrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (undoStack.length > 0) {
        redoStack.push({ ...selectedFlowers });
        selectedFlowers = undoStack.pop();
        renderPicker(app);
      }
    }
    if (currentStep === 'pick' && isCtrl && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      if (redoStack.length > 0) {
        undoStack.push({ ...selectedFlowers });
        selectedFlowers = redoStack.pop();
        renderPicker(app);
      }
    }
    if (currentStep === 'pick' && isCtrl && e.key === 'y') {
      e.preventDefault();
      if (redoStack.length > 0) {
        undoStack.push({ ...selectedFlowers });
        selectedFlowers = redoStack.pop();
        renderPicker(app);
      }
    }

    // Escape = go back one step
    if (e.key === 'Escape') {
      if (currentStep === 'arrange') {
        currentStep = 'pick';
        renderPicker(app);
      } else if (currentStep === 'finish') {
        currentStep = 'arrange';
        renderArrangement(app);
      }
    }
  };
  document.addEventListener('keydown', keyboardHandler);
}

// --- Bouquet counter ---
function incrementBouquetCounter() {
  const key = 'digibouquet-created-count';
  const count = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, count + 1);
}

export function getBouquetCount() {
  return parseInt(localStorage.getItem('digibouquet-created-count') || '0', 10);
}

// --- Save to My Garden ---
function saveBouquetToGarden() {
  const profile = getProfile();
  const key = 'digibouquet-my-bouquets';
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  const bouquet = {
    id: Date.now(),
    flowers: getSelectedFlowerList(),
    seed: Math.floor(arrangementSeed * 100000),
    greeneryIndex,
    wrap: wrappingPaperClass,
    mode: currentMode,
    message: bouquetMessage,
    date: new Date().toISOString(),
    creatorName: profile ? profile.name : 'Anonymous',
    creatorAvatar: profile ? profile.avatar : '🌸',
  };
  saved.unshift(bouquet);
  // Keep max 20 saved bouquets
  if (saved.length > 20) saved.pop();
  localStorage.setItem(key, JSON.stringify(saved));
  return bouquet;
}

export function getSavedBouquets() {
  return JSON.parse(localStorage.getItem('digibouquet-my-bouquets') || '[]');
}

export function deleteSavedBouquet(id) {
  const key = 'digibouquet-my-bouquets';
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  const filtered = saved.filter(b => b.id !== id);
  localStorage.setItem(key, JSON.stringify(filtered));
}

// --- Surprise Me ---
function surpriseMe(app) {
  const count = 6 + Math.floor(Math.random() * 5); // 6-10 flowers
  const newSelection = {};
  for (let i = 0; i < count; i++) {
    const randomFlower = flowers[Math.floor(Math.random() * flowers.length)];
    newSelection[randomFlower.id] = (newSelection[randomFlower.id] || 0) + 1;
  }
  undoStack.push({ ...selectedFlowers });
  redoStack = [];
  selectedFlowers = newSelection;
  wrappingPaperClass = WRAPPING_OPTIONS[Math.floor(Math.random() * WRAPPING_OPTIONS.length)].class;
  currentStep = 'arrange';
  arrangementSeed = Math.random();
  currentPositions = null;
  initAudio();
  playChimeSound();
  renderArrangement(app);
}

// --- Drag & Drop in arrangement ---
function setupDragAndDrop() {
  const canvas = document.getElementById('bouquet-canvas');
  if (!canvas) return;

  const flowerEls = canvas.querySelectorAll('.bouquet-flower');

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function onStart(e) {
    if (e.target.classList.contains('bouquet-flower')) {
      e.preventDefault();
      dragTarget = e.target;
      const pos = getPos(e);
      dragOffsetX = pos.x - parseInt(dragTarget.style.left);
      dragOffsetY = pos.y - parseInt(dragTarget.style.top);
      dragTarget.style.zIndex = '100';
      dragTarget.style.cursor = 'grabbing';
      dragTarget.style.transition = 'none';
      dragTarget.style.filter = 'drop-shadow(0 12px 24px rgba(232, 160, 180, 0.5))';
    }
  }

  function onMove(e) {
    if (!dragTarget) return;
    e.preventDefault();
    const pos = getPos(e);
    const newX = Math.max(0, Math.min(canvas.offsetWidth - 60, pos.x - dragOffsetX));
    const newY = Math.max(0, Math.min(canvas.offsetHeight - 60, pos.y - dragOffsetY));
    dragTarget.style.left = `${newX}px`;
    dragTarget.style.top = `${newY}px`;
  }

  function onEnd() {
    if (dragTarget) {
      const idxStr = dragTarget.getAttribute('data-index');
      if (idxStr !== null && currentPositions) {
        const idx = parseInt(idxStr, 10);
        if (currentPositions[idx]) {
          currentPositions[idx].x = parseFloat(dragTarget.style.left) || currentPositions[idx].x;
          currentPositions[idx].y = parseFloat(dragTarget.style.top) || currentPositions[idx].y;
        }
      }
      dragTarget.style.cursor = 'grab';
      dragTarget.style.transition = '';
      dragTarget.style.filter = '';
      dragTarget = null;
    }
  }

  canvas.addEventListener('mousedown', onStart);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onEnd);
  canvas.addEventListener('mouseleave', onEnd);

  canvas.addEventListener('touchstart', onStart, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onEnd);
}

export function renderBouquet(app, params) {
  currentMode = params.get('mode') || 'color';

  // Check for template from garden
  const template = params.get('template');
  if (template && currentStep === 'pick') {
    const urlObj = new URL(window.location.href);
    const fParam = urlObj.searchParams.get('f');
    if (fParam) {
      selectedFlowers = {};
      const list = fParam.split(',').filter(Boolean);
      list.forEach(id => {
        selectedFlowers[id] = (selectedFlowers[id] || 0) + 1;
      });
      undoStack = [];
      redoStack = [];
      const sParam = urlObj.searchParams.get('s');
      if (sParam) arrangementSeed = parseInt(sParam, 10) / 100000;
      const gParam = urlObj.searchParams.get('g');
      if (gParam) greeneryIndex = parseInt(gParam, 10);
      currentPositions = null;
      currentStep = 'arrange';
    }
  }

  attachKeyboardShortcuts(app);

  if (currentStep === 'pick') {
    renderPicker(app);
  } else if (currentStep === 'arrange') {
    renderArrangement(app);
  } else {
    renderFinish(app);
  }
}

function renderPicker(app) {
  const total = getTotalCount();
  const monoClass = currentMode === 'mono' ? 'mono-mode' : '';

  app.innerHTML = `
    <div class="page-frame ${monoClass}">
      <div class="builder-page">
        <div class="builder-header">
          <a class="logo logo-small" id="logo-home">Digibouquet</a>
          <p class="section-title" style="margin-top: 1.5rem;">Pick 6 to 10 blooms</p>

          <div class="template-controls" style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
            ${TEMPLATES.map(t => `
              <button class="btn btn-secondary btn-small btn-template" data-template="${t.id}" title="Auto-fill flowers">
                ${t.name}
              </button>
            `).join('')}
            <button class="btn btn-primary btn-small btn-surprise" id="btn-surprise" title="Random bouquet!">
              🎲 Surprise Me!
            </button>
          </div>

          <p class="shortcut-hint" style="margin-top: 0.5rem; font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.05em;">
            Ctrl+Z to undo · Ctrl+Shift+Z to redo · Esc to go back
          </p>
        </div>
        <div class="flower-grid" id="flower-grid">
          ${flowers.map(f => {
    const count = selectedFlowers[f.id] || 0;
    const imgSrc = currentMode === 'mono' ? f.monoImage : f.image;
    return `
              <div class="flower-card ${count > 0 ? 'selected' : ''}" data-id="${f.id}" tabindex="0" role="button" aria-label="Add ${f.name} to bouquet. Currently selected: ${count}.">
                ${count > 0 ? `<button class="flower-card-remove" data-remove-id="${f.id}" title="Remove one" aria-label="Remove one ${f.name}">−</button>` : ''}
                ${count > 0 ? `<span class="flower-card-badge" aria-hidden="true">${count}</span>` : ''}
                <img src="${imgSrc}" alt="" class="flower-card-img" onload="this.classList.add('loaded')" aria-hidden="true" />
                <span class="flower-card-name" aria-hidden="true">${f.name}</span>
                <span class="flower-card-meaning" aria-hidden="true">${f.meaning}</span>
              </div>
            `;
  }).join('')}
        </div>
        <div class="selection-bar ${total > 0 || undoStack.length > 0 ? 'visible' : ''}" id="selection-bar">
          <div class="undo-redo-controls" style="display: flex; gap: 0.5rem; margin-right: auto;">
            <button class="btn btn-secondary btn-small" id="btn-undo" title="Undo (Ctrl+Z)" ${undoStack.length === 0 ? 'disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
            </button>
            <button class="btn btn-secondary btn-small" id="btn-redo" title="Redo (Ctrl+Shift+Z)" ${redoStack.length === 0 ? 'disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
            </button>
          </div>
          <span class="selection-count">${total} bloom${total !== 1 ? 's' : ''} selected</span>
          <button class="btn btn-primary btn-small" id="btn-arrange" ${total < 6 ? 'disabled' : ''}>
            ${total < 6 ? `Pick ${6 - total} more` : 'Arrange Bouquet'}
          </button>
          <button class="btn btn-secondary btn-small" id="btn-clear">
            Clear
          </button>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('logo-home').addEventListener('click', (e) => {
    e.preventDefault();
    resetBuilder();
    navigate('/');
  });

  // Minus buttons — remove one flower
  document.querySelectorAll('.flower-card-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-remove-id');
      if (selectedFlowers[id] > 0) {
        undoStack.push({ ...selectedFlowers });
        redoStack = [];

        selectedFlowers[id]--;
        if (selectedFlowers[id] === 0) {
          delete selectedFlowers[id];
        }
        initAudio();
        playPlopSound();
        renderPicker(app);
      }
    });
  });

  // Click card to add flower
  document.querySelectorAll('.flower-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.flower-card-remove')) return;

      const id = card.getAttribute('data-id');
      if (getTotalCount() >= 10) return;

      undoStack.push({ ...selectedFlowers });
      redoStack = [];

      selectedFlowers[id] = (selectedFlowers[id] || 0) + 1;
      initAudio();
      playPlopSound();
      renderPicker(app);
    });

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (e.target.closest('.flower-card-remove')) return;
        const id = card.getAttribute('data-id');
        if (getTotalCount() >= 10) return;

        undoStack.push({ ...selectedFlowers });
        redoStack = [];

        selectedFlowers[id] = (selectedFlowers[id] || 0) + 1;
        initAudio();
        playPlopSound();
        renderPicker(app);
      }
    });
  });

  const btnArrange = document.getElementById('btn-arrange');
  if (btnArrange) {
    btnArrange.addEventListener('click', () => {
      if (getTotalCount() >= 6) {
        currentStep = 'arrange';
        arrangementSeed = Math.random();
        currentPositions = null;
        initAudio();
        playChimeSound();
        renderArrangement(app);
      }
    });
  }

  const btnClear = document.getElementById('btn-clear');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (Object.keys(selectedFlowers).length > 0) {
        undoStack.push({ ...selectedFlowers });
        redoStack = [];
      }
      selectedFlowers = {};
      renderPicker(app);
    });
  }

  // Undo / Redo
  const btnUndo = document.getElementById('btn-undo');
  if (btnUndo) {
    btnUndo.addEventListener('click', () => {
      if (undoStack.length > 0) {
        redoStack.push({ ...selectedFlowers });
        selectedFlowers = undoStack.pop();
        renderPicker(app);
      }
    });
  }

  const btnRedo = document.getElementById('btn-redo');
  if (btnRedo) {
    btnRedo.addEventListener('click', () => {
      if (redoStack.length > 0) {
        undoStack.push({ ...selectedFlowers });
        selectedFlowers = redoStack.pop();
        renderPicker(app);
      }
    });
  }

  // Template Buttons
  const templateBtns = document.querySelectorAll('.btn-template');
  templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.getAttribute('data-template');
      const template = TEMPLATES.find(t => t.id === templateId);
      if (template) {
        undoStack.push({ ...selectedFlowers });
        redoStack = [];
        selectedFlowers = { ...template.flowers };
        wrappingPaperClass = template.wrap;
        currentStep = 'arrange';
        arrangementSeed = Math.random();
        currentPositions = null;
        initAudio();
        playChimeSound();
        renderArrangement(app);
      }
    });
  });

  // Surprise Me button
  const btnSurprise = document.getElementById('btn-surprise');
  if (btnSurprise) {
    btnSurprise.addEventListener('click', () => surpriseMe(app));
  }
}

function renderArrangement(app) {
  const flowerList = getSelectedFlowerList();
  if (!currentPositions || currentPositions.length !== flowerList.length) {
    currentPositions = generateArrangement(flowerList, arrangementSeed);
  }
  const positions = currentPositions;
  const monoClass = currentMode === 'mono' ? 'mono-mode' : '';

  // Wrapping paper controls
  const wrapBtns = document.querySelectorAll('.btn-wrap');

  app.innerHTML = `
    <div class="page-frame ${monoClass}">
      <div class="arrangement-page">
        <div class="builder-header">
          <a class="logo logo-small" id="logo-home">Digibouquet</a>
          <p class="drag-hint" style="margin-top: 0.5rem; font-size: 0.7rem; color: var(--text-muted); font-style: italic; letter-spacing: 0.03em;">
            ✨ Drag flowers to reposition them
          </p>
        </div>
        <div class="arrangement-controls">
          <button class="btn btn-primary btn-small" id="btn-rearrange">
            Try a New Arrangement
          </button>
          <button class="btn btn-secondary btn-small" id="btn-greenery">
            Change Greenery
          </button>
        </div>
        
        <div class="wrap-controls" style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
          ${WRAPPING_OPTIONS.map(opt => `
            <button class="btn btn-small ${wrappingPaperClass === opt.class ? 'btn-primary' : 'btn-secondary'} btn-wrap" data-wrap="${opt.class}">
              ${opt.label}
            </button>
          `).join('')}
        </div>

        <div class="bouquet-canvas" id="bouquet-canvas">
          <div class="bouquet-wrap ${wrappingPaperClass}"></div>
          <div class="bouquet-ribbon">
            <div class="bouquet-ribbon-center"></div>
          </div>
          <img
            src="${getGreeneryImage(greeneryIndex)}"
            alt="Greenery"
            class="bouquet-greenery"
            onload="this.classList.add('loaded')"
          />
          ${positions.map((p, i) => {
    const flower = getFlowerById(p.flowerId);
    const flowerImg = currentMode === 'mono' ? flower.monoImage : flower.image;
    return `
              <img
                src="${flowerImg}"
                alt="${flower.name}"
                class="bouquet-flower"
                data-index="${i}"
                onload="this.classList.add('loaded')"
                style="
                  left: ${p.x}px;
                  top: ${p.y}px;
                  transform: rotate(${p.rotation}deg) scale(${p.scale});
                  z-index: ${p.zIndex};
                  animation: bloomIn 0.6s ease ${i * 0.06}s forwards;
                  opacity: 0;
                "
              />
            `;
  }).join('')}
          <img
            src="${getGreeneryTopImage(greeneryIndex)}"
            alt=""
            class="bouquet-greenery-top"
            onload="this.classList.add('loaded')"
          />
        </div>

        <div class="arrangement-nav">
          <button class="btn btn-secondary btn-small" id="btn-back">Back</button>
          <button class="btn btn-primary btn-small" id="btn-next">Next</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('logo-home').addEventListener('click', (e) => {
    e.preventDefault();
    resetBuilder();
    navigate('/');
  });

  document.getElementById('btn-rearrange').addEventListener('click', () => {
    arrangementSeed = Math.random();
    currentPositions = null;
    renderArrangement(app);
  });

  document.getElementById('btn-greenery').addEventListener('click', () => {
    greeneryIndex = (greeneryIndex + 1) % greeneryImages.length;
    renderArrangement(app);
  });

  document.getElementById('btn-back').addEventListener('click', () => {
    currentStep = 'pick';
    renderPicker(app);
  });

  // Handle wrapping paper selection
  wrapBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      wrappingPaperClass = btn.getAttribute('data-wrap');
      renderArrangement(app);
    });
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    currentStep = 'finish';
    initAudio();
    playChimeSound();
    renderFinish(app);
  });

  // Wrapping paper buttons
  document.querySelectorAll('.btn-wrap').forEach(btn => {
    btn.addEventListener('click', () => {
      wrappingPaperClass = btn.dataset.wrap;
      renderArrangement(app);
    });
  });

  // Setup drag & drop after a brief delay so bloom animations finish
  setTimeout(() => setupDragAndDrop(), 400);
}

function renderFinish(app) {
  const flowerList = getSelectedFlowerList();
  if (!currentPositions || currentPositions.length !== flowerList.length) {
    currentPositions = generateArrangement(flowerList, arrangementSeed);
  }
  const positions = currentPositions;
  const monoClass = currentMode === 'mono' ? 'mono-mode' : '';

  app.innerHTML = `
    <div class="page-frame ${monoClass}">
      <div class="finish-page">
        <div class="builder-header">
          <a class="logo logo-small" id="logo-home">Digibouquet</a>
          <p class="section-title" style="margin-top: 1.5rem;">Your Bouquet</p>
        </div>

        <div class="finish-preview ${monoClass}" id="finish-preview">
          <div class="finish-preview-inner">
            <div class="bouquet-wrap ${wrappingPaperClass}"></div>
            <div class="bouquet-ribbon">
              <div class="bouquet-ribbon-center"></div>
            </div>
            <img
              src="${getGreeneryImage(greeneryIndex)}"
              alt="Greenery"
              class="bouquet-greenery"
              onload="this.classList.add('loaded')"
            />
            ${positions.map((p) => {
    const flower = getFlowerById(p.flowerId);
    const flowerImg = currentMode === 'mono' ? flower.monoImage : flower.image;
    return `
                <img
                  src="${flowerImg}"
                  alt="${flower.name}"
                  class="bouquet-flower"
                  onload="this.classList.add('loaded')"
                  style="
                    left: ${p.x}px;
                    top: ${p.y}px;
                    transform: rotate(${p.rotation}deg) scale(${p.scale});
                    z-index: ${p.zIndex};
                  "
                />
              `;
  }).join('')}
            <img
              src="${getGreeneryTopImage(greeneryIndex)}"
              alt=""
              class="bouquet-greenery-top"
              onload="this.classList.add('loaded')"
            />
          </div>
        </div>

        <div class="occasion-tags">
          <button class="occasion-tag" data-msg="Happy Birthday! 🎂 Wishing you a wonderful day filled with joy!">🎂 Birthday</button>
          <button class="occasion-tag" data-msg="You are so loved 💕 Sending all my love your way.">💕 Valentine's</button>
          <button class="occasion-tag" data-msg="Thank you so much 🙏 Your kindness means the world.">🙏 Thank You</button>
          <button class="occasion-tag" data-msg="Get well soon! 💛 Sending warm thoughts your way.">🤒 Get Well</button>
          <button class="occasion-tag" data-msg="Congratulations! 🎓 So proud of everything you've achieved.">🎓 Graduation</button>
          <button class="occasion-tag" data-msg="Just because ✨ You deserve something beautiful today.">✨ Just Because</button>
        </div>

        <div class="message-input-wrap">
          <label for="bouquet-message">Add a message (optional)</label>
          <textarea
            class="message-input"
            id="bouquet-message"
            placeholder="To someone special..."
            maxlength="200"
          >${bouquetMessage}</textarea>
        </div>

        <div class="finish-actions">
          <button class="btn btn-secondary btn-small" id="btn-back-arrange">Back</button>
          <button class="btn btn-primary btn-small" id="btn-download">Download</button>
          <button class="btn btn-primary btn-small btn-share" id="btn-share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 6px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share
          </button>
          <button class="btn btn-secondary btn-small btn-copy-img" id="btn-copy-img">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy
          </button>
          <button class="btn btn-secondary btn-small btn-save-garden" id="btn-save-garden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>Save
          </button>
          <button class="btn btn-secondary btn-small" id="btn-new">Start Over</button>
        </div>
        <div class="share-toast" id="share-toast">Link copied to clipboard!</div>
        <div class="share-toast" id="save-toast">Saved to My Garden!</div>
        <div class="share-toast" id="copy-toast">Image copied to clipboard!</div>
      </div>
    </div>
  `;

  // Fire confetti celebration!
  setTimeout(() => celebrate(), 300);

  if (!hasPromptedDonation) {
    hasPromptedDonation = true;
    setTimeout(() => showDonatePrompt(), 900);
  }

  // Bloom reveal animation — stagger flowers appearing
  const finishFlowers = document.querySelectorAll('#finish-preview .bouquet-flower');
  finishFlowers.forEach((flower, i) => {
    flower.style.opacity = '0';
    flower.style.transform += ' scale(0.5)';
    flower.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    setTimeout(() => {
      flower.style.opacity = '1';
      flower.style.transform = flower.style.transform.replace('scale(0.5)', 'scale(1)');
    }, 200 + i * 120);
  });

  // Occasion tag buttons
  document.querySelectorAll('.occasion-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      const msgInput = document.getElementById('bouquet-message');
      if (msgInput) {
        msgInput.value = btn.dataset.msg;
        bouquetMessage = btn.dataset.msg;
      }
      // Highlight active tag
      document.querySelectorAll('.occasion-tag').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('logo-home').addEventListener('click', (e) => {
    e.preventDefault();
    resetBuilder();
    navigate('/');
  });

  document.getElementById('bouquet-message').addEventListener('input', (e) => {
    bouquetMessage = e.target.value;
  });

  document.getElementById('btn-back-arrange').addEventListener('click', () => {
    currentStep = 'arrange';
    renderArrangement(app);
  });

  document.getElementById('btn-download').addEventListener('click', () => {
    incrementBouquetCounter();
    downloadBouquet();
  });

  document.getElementById('btn-share').addEventListener('click', () => {
    incrementBouquetCounter();
    shareBouquet();
  });

  document.getElementById('btn-save-garden').addEventListener('click', () => {
    if (!isLoggedIn()) {
      showLoginPrompt('Sign in to save bouquets to your garden!');
      return;
    }
    saveBouquetToGarden();
    incrementBouquetCounter();
    const toast = document.getElementById('save-toast');
    if (toast) {
      toast.classList.add('visible');
      setTimeout(() => {
        toast.classList.remove('visible');
        navigate('/garden');
      }, 1500);
    } else {
      setTimeout(() => navigate('/garden'), 1000);
    }
  });

  // Copy Image to clipboard
  document.getElementById('btn-copy-img').addEventListener('click', async () => {
    const preview = document.getElementById('finish-preview');
    if (!preview) return;
    const btn = document.getElementById('btn-copy-img');
    const origText = btn.innerHTML;
    btn.innerHTML = 'Copying...';
    btn.disabled = true;
    try {
      const capturedCanvas = await html2canvas(preview, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise(r => capturedCanvas.toBlob(r, 'image/png'));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      const toast = document.getElementById('copy-toast');
      if (toast) {
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 2500);
      }
    } catch (err) {
      console.error('Copy image failed:', err);
    } finally {
      btn.innerHTML = origText;
      btn.disabled = false;
    }
  });

  document.getElementById('btn-new').addEventListener('click', () => {
    resetBuilder();
    renderPicker(app);
  });
}

async function downloadBouquet() {
  const preview = document.getElementById('finish-preview');
  if (!preview) return;

  const btn = document.getElementById('btn-download');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Preparing...';
  }

  try {
    const capturedCanvas = await html2canvas(preview, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const pad = 60;
    const finalW = capturedCanvas.width + pad * 2;
    const finalH = capturedCanvas.height + pad * 2 + 120;
    const canvas = document.createElement('canvas');
    canvas.width = finalW;
    canvas.height = finalH;
    const ctx = canvas.getContext('2d');

    const isDark = document.body.getAttribute('data-theme') !== 'light';
    ctx.fillStyle = isDark ? '#0D0D0D' : '#F5F0EB';
    ctx.fillRect(0, 0, finalW, finalH);

    ctx.fillStyle = isDark ? '#D4A574' : '#B8864A';
    ctx.font = 'italic 36px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Digibouquet', finalW / 2, 50);

    ctx.drawImage(capturedCanvas, pad, 70);

    if (bouquetMessage) {
      ctx.fillStyle = isDark ? '#A39E98' : '#6B6058';
      ctx.font = 'italic 20px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      const msgY = 70 + capturedCanvas.height + 30;
      ctx.fillText(bouquetMessage, finalW / 2, msgY);
    }

    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
    ctx.fillStyle = isDark ? '#6B6560' : '#9E958B';
    ctx.font = '14px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(dateStr, finalW / 2, finalH - 20);

    const link = document.createElement('a');
    link.download = 'my-bouquet.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Download failed:', err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Download';
    }
  }
}

function resetBuilder() {
  selectedFlowers = {};
  undoStack = [];
  redoStack = [];
  currentStep = 'pick';
  arrangementSeed = Math.random();
  greeneryIndex = 0;
  bouquetMessage = '';
  wrappingPaperClass = 'wrap-classic';
  currentPositions = null;
  hasPromptedDonation = false;
}

function showDonatePrompt() {
  const existing = document.getElementById('donation-prompt-overlay');
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'donation-prompt-overlay';
  overlay.className = 'login-prompt-overlay';
  overlay.innerHTML = `
    <div class="login-prompt-card" role="dialog" aria-modal="true" aria-label="Support Digibouquet">
      <button class="login-prompt-close" type="button" aria-label="Close">&times;</button>
      <div class="login-prompt-icon">💐</div>
      <p class="section-title" style="margin: 0 0 0.7rem;">Your bouquet is ready</p>
      <p class="login-prompt-text" style="margin-bottom: 1.2rem;">
        Would you like to support Digibouquet with a small donation?
      </p>
      <div style="display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap;">
        <button class="btn btn-primary btn-small" id="btn-donate-yes" type="button">Yes, Donate</button>
        <button class="btn btn-secondary btn-small" id="btn-donate-later" type="button">Maybe Later</button>
      </div>
    </div>
  `;

  const closePrompt = () => {
    overlay.classList.remove('visible');
    setTimeout(() => {
      if (overlay.parentElement) {
        overlay.parentElement.removeChild(overlay);
      }
    }, 180);
  };

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closePrompt();
    }
  });

  overlay.querySelector('.login-prompt-close').addEventListener('click', closePrompt);
  overlay.querySelector('#btn-donate-later').addEventListener('click', closePrompt);
  overlay.querySelector('#btn-donate-yes').addEventListener('click', () => {
    closePrompt();
    openUpiPaymentModal();
  });
}

async function generateShareUrl() {
  const flowerList = getSelectedFlowerList();
  const params = new URLSearchParams();

  if (currentMode === 'mono') {
    params.set('mode', 'mono');
  }

  params.set('f', flowerList.join(','));
  params.set('s', Math.floor(arrangementSeed * 100000));
  params.set('g', greeneryIndex);

  const wIndex = WRAPPING_OPTIONS.findIndex(o => o.class === wrappingPaperClass);
  if (wIndex > 0) params.set('w', wIndex);

  if (bouquetMessage) {
    params.set('msg', bouquetMessage);
  }
  const base = window.location.origin + window.location.pathname;
  return `${base}#/view?${params.toString()}`;
}

async function shareBouquet() {
  const shareUrl = generateShareUrl();
  const shareData = {
    title: 'Digibouquet — A Bouquet For You',
    text: bouquetMessage || 'Someone made you a beautiful digital bouquet!',
    url: shareUrl,
  };

  try {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareUrl);
      showShareToast();
    }
  } catch (err) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showShareToast();
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showShareToast();
    }
  }
}

function showShareToast() {
  const toast = document.getElementById('share-toast');
  if (!toast) return;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}

// --- Shared View with Animated Unwrapping Reveal ---
export function renderSharedView(app, params) {
  const flowerIds = (params.get('f') || '').split(',').filter(Boolean);
  const seed = parseInt(params.get('s') || '0', 10) / 100000;
  const gIndex = parseInt(params.get('g') || '0', 10);
  const wIndex = parseInt(params.get('w') || '0', 10);
  const mode = params.get('mode') || 'color';
  const msg = params.get('msg') || '';
  const monoClass = mode === 'mono' ? 'mono-mode' : '';
  const wrapClass = WRAPPING_OPTIONS[wIndex] ? WRAPPING_OPTIONS[wIndex].class : 'wrap-classic';

  if (flowerIds.length === 0) {
    navigate('/');
    return;
  }

  const positions = generateArrangement(flowerIds, seed);
  const greenSrc = mode === 'mono'
    ? monoGreeneryImages[gIndex % monoGreeneryImages.length]
    : greeneryImages[gIndex % greeneryImages.length];
  const greenTopSrc = mode === 'mono'
    ? monoGreeneryTopImages[gIndex % monoGreeneryTopImages.length]
    : greeneryTopImages[gIndex % greeneryTopImages.length];

  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

  app.innerHTML = `
    <div class="page-frame ${monoClass}">
      <div class="finish-page">
        <div class="builder-header">
          <a class="logo logo-small" id="logo-home">Digibouquet</a>
        </div>

        <!-- Reveal Wrapper -->
        <div class="reveal-wrapper" id="reveal-wrapper">
          <!-- Gift overlay (slides away) -->
          <div class="reveal-gift-overlay" id="reveal-overlay">
            <div class="reveal-gift-icon">🎁</div>
            <p class="reveal-gift-text">You've received a bouquet!</p>
            <button class="btn btn-primary" id="btn-reveal">Open Your Gift</button>
          </div>

          <!-- Bouquet (hidden until revealed) -->
          <div class="finish-preview ${monoClass} reveal-hidden" id="finish-preview">
            <div class="bouquet-wrap ${wrapClass}"></div>
            <img src="${greenSrc}" alt="Greenery" class="bouquet-greenery" onload="this.classList.add('loaded')" />
            ${positions.map((p) => {
    const flower = getFlowerById(p.flowerId);
    if (!flower) return '';
    const scale = p.scale * 0.75;
    const flowerImg = mode === 'mono' ? flower.monoImage : flower.image;
    return `
                <img
                  src="${flowerImg}"
                  alt="${flower.name}"
                  class="bouquet-flower reveal-flower"
                  style="
                    left: ${p.x * 0.8}px;
                    top: ${p.y * 0.8}px;
                    transform: rotate(${p.rotation}deg) scale(0);
                    z-index: ${p.zIndex};
                    width: 80px;
                    height: 80px;
                    --final-rotation: ${p.rotation}deg;
                    --final-scale: ${scale};
                  "
                />
              `;
  }).join('')}
            <img src="${greenTopSrc}" alt="" class="bouquet-greenery-top" />
          </div>
        </div>

        <!-- Greeting Card Message -->
        ${msg ? `
        <div class="greeting-card reveal-card-hidden" id="greeting-card">
          <div class="greeting-card-inner">
            <span class="greeting-card-quote">"</span>
            <p class="greeting-card-text">${msg}</p>
            <span class="greeting-card-quote greeting-card-quote-end">"</span>
          </div>
          <p class="greeting-card-date">${dateStr}</p>
        </div>
        ` : ''}

        <div class="finish-actions reveal-actions-hidden" id="reveal-actions" style="margin-top: 2rem;">
          <button class="btn btn-primary" id="btn-make-own">
            Build Your Own Bouquet
          </button>
        </div>
      </div>
    </div>
  `;

  // Event: Reveal animation
  document.getElementById('btn-reveal').addEventListener('click', () => {
    initAudio();
    playRustleSound();
    setTimeout(() => {
      playChimeSound();
    }, 400);

    const overlay = document.getElementById('reveal-overlay');
    const preview = document.getElementById('finish-preview');
    const card = document.getElementById('greeting-card');
    const actions = document.getElementById('reveal-actions');

    // Slide overlay away
    overlay.classList.add('reveal-overlay-hide');

    // Show bouquet
    setTimeout(() => {
      preview.classList.remove('reveal-hidden');
      // Bloom flowers one by one
      const flowers = preview.querySelectorAll('.reveal-flower');
      flowers.forEach((f, i) => {
        setTimeout(() => {
          const rot = f.style.getPropertyValue('--final-rotation');
          const sc = f.style.getPropertyValue('--final-scale');
          f.style.transform = `rotate(${rot}) scale(${sc})`;
          f.style.transition = `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`;
        }, i * 100);
      });
    }, 400);

    // Fire confetti after flowers bloom
    setTimeout(() => {
      celebrate();
    }, 600 + positions.length * 80);

    // Show greeting card
    if (card) {
      setTimeout(() => {
        card.classList.remove('reveal-card-hidden');
      }, 800 + positions.length * 100);
    }

    // Show actions
    setTimeout(() => {
      actions.classList.remove('reveal-actions-hidden');
    }, 1000 + positions.length * 100);
  });

  document.getElementById('logo-home').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/');
  });

  document.getElementById('btn-make-own').addEventListener('click', () => {
    navigate('/bouquet?mode=color');
  });
}
