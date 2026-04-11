import { navigate } from '../router.js';
import { getBouquetCount } from './bouquet.js';
import { flowers } from '../data/flowers.js';
import { handleUpiPayment } from '../utils/upi.js';

let petalCanvas = null;
let petalCtx = null;
let petals = [];
let animFrame = null;

const PETAL_COLORS = [
  'rgba(232, 160, 180, 0.3)',
  'rgba(242, 198, 208, 0.25)',
  'rgba(200, 155, 123, 0.2)',
  'rgba(143, 185, 150, 0.2)',
  'rgba(212, 165, 116, 0.2)',
];

class Petal {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h - h;
    this.size = Math.random() * 12 + 6;
    this.speedY = Math.random() * 0.6 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.rotation = Math.random() * 360;
    this.rotSpeed = (Math.random() - 0.5) * 1.5;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = Math.random() * 0.02 + 0.01;
    this.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    this.w = w;
    this.h = h;
  }

  update() {
    this.y += this.speedY;
    this.wobble += this.wobbleSpeed;
    this.x += this.speedX + Math.sin(this.wobble) * 0.5;
    this.rotation += this.rotSpeed;

    if (this.y > this.h + 20) {
      this.y = -20;
      this.x = Math.random() * this.w;
    }
    if (this.x > this.w + 20) this.x = -20;
    if (this.x < -20) this.x = this.w + 20;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    // Petal shape
    ctx.ellipse(0, 0, this.size, this.size / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function startPetals() {
  if (petalCanvas) return;

  petalCanvas = document.createElement('canvas');
  petalCanvas.id = 'petal-canvas';
  petalCanvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  `;

  const homePage = document.querySelector('.home-page');
  if (homePage) {
    homePage.style.position = 'relative';
    homePage.insertBefore(petalCanvas, homePage.firstChild);
  }

  petalCtx = petalCanvas.getContext('2d');

  function resize() {
    if (!petalCanvas || !petalCanvas.parentElement) return;
    petalCanvas.width = petalCanvas.parentElement.offsetWidth;
    petalCanvas.height = petalCanvas.parentElement.offsetHeight;
  }
  resize();

  // Create petals
  petals = [];
  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = new Petal(petalCanvas.width, petalCanvas.height);
    p.y = Math.random() * petalCanvas.height; // Distribute initially
    petals.push(p);
  }

  function animate() {
    if (!petalCtx || !petalCanvas) return;
    petalCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
    petals.forEach(p => {
      p.update();
      p.draw(petalCtx);
    });
    animFrame = requestAnimationFrame(animate);
  }

  animFrame = requestAnimationFrame(animate);
}

function stopPetals() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  if (petalCanvas && petalCanvas.parentElement) {
    petalCanvas.parentElement.removeChild(petalCanvas);
  }
  petalCanvas = null;
  petalCtx = null;
  petals = [];
}

export function renderHome(app) {
  // Clean up petals from previous render
  stopPetals();

  const count = getBouquetCount();
  const statsHtml = count > 0 ? `
    <div class="stats-badge animate-in animate-delay-4" style="margin-top: 1rem;">
      <span class="stats-icon">💐</span>
      <span class="stats-text">${count} bouquet${count !== 1 ? 's' : ''} created</span>
    </div>
  ` : '';

  // Today's Pick — deterministic daily rotation
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const pick1 = flowers[(dayOfYear * 3) % flowers.length];
  const pick2 = flowers[(dayOfYear * 3 + 1) % flowers.length];
  const pick3 = flowers[(dayOfYear * 3 + 2) % flowers.length];

  const todaysPickHtml = `
    <div class="todays-pick animate-in animate-delay-4">
      <h3 class="todays-pick-title">✨ Today's Pick</h3>
      <div class="todays-pick-flowers">
        <div class="todays-pick-flower">
          <img src="${pick1.image}" alt="${pick1.name}" />
          <span>${pick1.name}</span>
        </div>
        <span class="todays-pick-plus">+</span>
        <div class="todays-pick-flower">
          <img src="${pick2.image}" alt="${pick2.name}" />
          <span>${pick2.name}</span>
        </div>
        <span class="todays-pick-plus">+</span>
        <div class="todays-pick-flower">
          <img src="${pick3.image}" alt="${pick3.name}" />
          <span>${pick3.name}</span>
        </div>
      </div>
      <button class="btn btn-secondary btn-small" id="btn-todays-pick">Try This Combo</button>
    </div>
  `;

  app.innerHTML = `
    <div class="page-frame">
      <div class="home-page">
        <img
          src="/color/flowers/peony.png"
          alt="Peony"
          class="home-hero-flower"
          id="hero-flower"
        />
        <div class="home-logo-wrap animate-in animate-delay-1">
          <span class="logo logo-large">Digibouquet</span>
        </div>
        <p class="tagline home-tagline animate-in animate-delay-2">
          beautiful flowers<br>delivered digitally
        </p>
        <div class="home-actions animate-in animate-delay-3">
          <button class="btn btn-primary" id="btn-color">
            Build a Bouquet
          </button>
          <button class="btn btn-secondary" id="btn-mono">
            Build it in Black & White
          </button>
          <button class="btn-link" id="btn-garden">
            View Garden
          </button>
        </div>
        ${statsHtml}
        ${todaysPickHtml}
        <div class="home-footer animate-in animate-delay-4">
          <span class="home-footer-credit">
            a digital flower bouquet builder · <a class="about-link" id="btn-about">About</a> · <a href="#" class="donate-link" id="btn-upi-home">💳 Pay via UPI</a>
          </span>
        </div>
      </div>
    </div>
  `;

  // Start floating petals
  setTimeout(() => startPetals(), 100);

  document.getElementById('btn-color').addEventListener('click', () => {
    stopPetals();
    navigate('/bouquet?mode=color');
  });

  document.getElementById('btn-mono').addEventListener('click', () => {
    stopPetals();
    navigate('/bouquet?mode=mono');
  });

  document.getElementById('btn-garden').addEventListener('click', () => {
    stopPetals();
    navigate('/garden');
  });

  document.getElementById('btn-todays-pick').addEventListener('click', () => {
    stopPetals();
    // Navigate to bouquet builder with these 3 flowers pre-loaded
    const flowerIds = [pick1.id, pick1.id, pick2.id, pick2.id, pick3.id, pick3.id];
    const params = new URLSearchParams();
    params.set('mode', 'color');
    params.set('template', flowerIds.join(','));
    params.set('seed', dayOfYear.toString());
    navigate(`/bouquet?${params.toString()}`);
  });

  document.getElementById('btn-about').addEventListener('click', (e) => {
    e.preventDefault();
    stopPetals();
    navigate('/about');
  });

  document.getElementById('btn-upi-home').addEventListener('click', handleUpiPayment);
}
