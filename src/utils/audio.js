let audioCtx = null;
let isMuted = false;

// Initialize audio context on first user interaction to comply with browser autoplay policies
export function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

export function initMuteToggle() {
    if (document.getElementById('mute-toggle')) return;

    const btn = document.createElement('button');
    btn.id = 'mute-toggle';
    btn.className = 'theme-toggle mute-toggle'; // reuse theme-toggle styles
    btn.style.right = '4.5rem'; // position left of theme toggle
    btn.setAttribute('aria-label', 'Toggle sound effects');

    const iconSound = `<svg class="icon-sound" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    const iconMute = `<svg class="icon-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;

    btn.innerHTML = isMuted ? iconMute : iconSound;

    btn.addEventListener('click', () => {
        isMuted = !isMuted;
        btn.innerHTML = isMuted ? iconMute : iconSound;
        if (!isMuted) {
            initAudio();
            playPlopSound();
        }
    });

    // Init audio context on any first click in document if not muted
    document.addEventListener('click', () => {
        if (!isMuted) initAudio();
    }, { once: true });

    document.body.appendChild(btn);
}

export function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
}

export function isAudioMuted() {
    return isMuted;
}

// A gentle "plop" or synthesized soft tick for picking a flower
export function playPlopSound() {
    if (isMuted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    // frequency slide down
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

// A soft magical chime for arranging or finishing
export function playChimeSound() {
    if (isMuted || !audioCtx) return;

    const ctx = audioCtx;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C major chord arpeggio

    freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 1);
    });
}

// A rustling noise for wrapping paper
export function playRustleSound() {
    if (isMuted || !audioCtx) return;

    const ctx = audioCtx;
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        // Pinkish noise approximation
        data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter to make it sound like paper
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start();
}
