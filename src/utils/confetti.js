// Lightweight canvas-based confetti burst — zero dependencies
const COLORS = [
    '#e8a0b4', '#d4a574', '#f2c6d0', '#8fb996',
    '#c89b7b', '#FFD700', '#FF6B8A', '#87CEEB',
    '#DDA0DD', '#98D8C8'
];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = -Math.random() * 14 - 4;
        this.gravity = 0.3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 12;
        this.size = Math.random() * 8 + 4;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.opacity = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        // Shapes: 0 = rect, 1 = circle, 2 = petal
        this.shape = Math.floor(Math.random() * 3);
        this.wobble = Math.random() * 10;
        this.wobbleSpeed = Math.random() * 0.1 + 0.05;
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.99;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.decay;
        this.wobble += this.wobbleSpeed;
    }

    draw(ctx) {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;

        if (this.shape === 0) {
            // Rectangle confetti
            ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        } else if (this.shape === 1) {
            // Circle
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Petal shape
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size / 2, this.size / 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

let canvas = null;
let ctx = null;
let particles = [];
let animFrame = null;

function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
}

function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(p => p.opacity > 0);
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    if (particles.length > 0) {
        animFrame = requestAnimationFrame(animate);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animFrame = null;
    }
}

/**
 * Fire a confetti burst from a point.
 * @param {number} x - X coordinate (defaults to center)
 * @param {number} y - Y coordinate (defaults to top third)
 * @param {number} count - Number of particles
 */
export function fireConfetti(x, y, count = 80) {
    ensureCanvas();

    const cx = x ?? canvas.width / 2;
    const cy = y ?? canvas.height * 0.35;

    for (let i = 0; i < count; i++) {
        particles.push(new Particle(cx, cy));
    }

    if (!animFrame) {
        animFrame = requestAnimationFrame(animate);
    }
}

/**
 * Fire celebration confetti from multiple points
 */
export function celebrate() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    fireConfetti(w * 0.3, h * 0.3, 50);
    setTimeout(() => fireConfetti(w * 0.7, h * 0.3, 50), 150);
    setTimeout(() => fireConfetti(w * 0.5, h * 0.25, 40), 300);
}
