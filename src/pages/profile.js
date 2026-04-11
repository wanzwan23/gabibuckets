import { navigate } from '../router.js';
import { createProfile, getProfile, logout, getAvatarEmojis, isLoggedIn } from '../utils/auth.js';
import { getSavedBouquets, getBouquetCount } from './bouquet.js';

let selectedAvatar = '🌸';

export function renderProfile(app) {
    const profile = getProfile();

    if (profile) {
        renderProfileView(app, profile);
    } else {
        renderSignIn(app);
    }
}

function renderSignIn(app) {
    const emojis = getAvatarEmojis();

    app.innerHTML = `
    <div class="page-frame">
      <div class="profile-page">
        <div class="builder-header">
          <a class="logo logo-small" id="logo-home">Digibouquet</a>
        </div>

        <div class="signin-card animate-in">
          <div class="signin-avatar-preview" id="avatar-preview">${selectedAvatar}</div>
          <h2 class="signin-title">Create Your Profile</h2>
          <p class="signin-subtitle">Pick a name and avatar to save bouquets and join the garden community</p>

          <form class="signin-form" id="signin-form">
            <div class="signin-field">
              <label for="profile-name">Your Name</label>
              <input
                type="text"
                id="profile-name"
                class="signin-input"
                placeholder="e.g. Flora"
                maxlength="20"
                required
                autocomplete="off"
              />
            </div>

            <div class="signin-field">
              <label>Pick an Avatar</label>
              <div class="avatar-grid" id="avatar-grid">
                ${emojis.map(emoji => `
                  <button
                    type="button"
                    class="avatar-option ${emoji === selectedAvatar ? 'selected' : ''}"
                    data-avatar="${emoji}"
                  >${emoji}</button>
                `).join('')}
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-signin" id="btn-signin" disabled>
              Let's Go!
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

    // Logo → home
    document.getElementById('logo-home').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/');
    });

    // Avatar selection
    document.querySelectorAll('.avatar-option').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedAvatar = btn.dataset.avatar;
            document.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            document.getElementById('avatar-preview').textContent = selectedAvatar;
        });
    });

    // Enable button when name is typed
    const nameInput = document.getElementById('profile-name');
    const submitBtn = document.getElementById('btn-signin');
    nameInput.addEventListener('input', () => {
        submitBtn.disabled = nameInput.value.trim().length < 1;
    });

    // Form submit
    document.getElementById('signin-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        if (!name) return;

        createProfile(name, selectedAvatar);

        // Update the header profile button
        updateHeaderProfileButton();

        // Navigate to profile view
        renderProfileView(app, getProfile());
    });
}

function renderProfileView(app, profile) {
    const bouquetCount = getBouquetCount();
    const savedBouquets = getSavedBouquets();
    const likeCount = countLikes();
    const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    app.innerHTML = `
    <div class="page-frame">
      <div class="profile-page">
        <div class="builder-header">
          <a class="logo logo-small" id="logo-home">Digibouquet</a>
        </div>

        <div class="profile-card animate-in">
          <div class="profile-avatar-large">${profile.avatar}</div>
          <h2 class="profile-name">${profile.name}</h2>
          <p class="profile-member-since">Member since ${memberSince}</p>

          <div class="profile-stats">
            <div class="profile-stat">
              <span class="profile-stat-value">${bouquetCount}</span>
              <span class="profile-stat-label">Bouquets</span>
            </div>
            <div class="profile-stat">
              <span class="profile-stat-value">${savedBouquets.length}</span>
              <span class="profile-stat-label">Saved</span>
            </div>
            <div class="profile-stat">
              <span class="profile-stat-value">${likeCount}</span>
              <span class="profile-stat-label">Likes</span>
            </div>
          </div>
        </div>

        ${savedBouquets.length > 0 ? `
          <div class="profile-history animate-in" style="animation-delay: 0.15s;">
            <h3 class="section-title" style="margin-bottom: 1rem;">My Bouquet History</h3>
            <div class="profile-history-list">
              ${savedBouquets.map(b => {
        const date = new Date(b.date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        const flowerNames = [...new Set(b.flowers)].map(id => id.charAt(0).toUpperCase() + id.slice(1));
        return `
                <div class="history-item">
                  <div class="history-item-icon">💐</div>
                  <div class="history-item-details">
                    <span class="history-item-flowers">${flowerNames.join(', ')}</span>
                    <span class="history-item-date">${date}</span>
                  </div>
                  ${b.message ? `<span class="history-item-message">"${b.message}"</span>` : ''}
                </div>
              `;
    }).join('')}
            </div>
          </div>
        ` : ''}

        <div class="profile-actions animate-in" style="animation-delay: 0.25s;">
          <button class="btn btn-primary" id="btn-build">Build a Bouquet</button>
          <button class="btn btn-secondary" id="btn-garden">View Garden</button>
          <button class="btn btn-secondary btn-logout" id="btn-logout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  `;

    document.getElementById('logo-home').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/');
    });

    document.getElementById('btn-build').addEventListener('click', () => {
        navigate('/bouquet?mode=color');
    });

    document.getElementById('btn-garden').addEventListener('click', () => {
        navigate('/garden');
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        logout();
        updateHeaderProfileButton();
        renderSignIn(app);
    });
}

function countLikes() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('liked_bouquet_') && localStorage.getItem(key) === 'true') {
            count++;
        }
    }
    return count;
}

// --- Header Profile Button ---
export function initProfileButton() {
    updateHeaderProfileButton();
}

export function updateHeaderProfileButton() {
    let btn = document.getElementById('profile-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'profile-btn';
        btn.className = 'profile-header-btn';
        btn.addEventListener('click', () => navigate('/profile'));
        document.body.appendChild(btn);
    }

    const profile = getProfile();
    if (profile) {
        btn.innerHTML = `<span class="profile-header-avatar">${profile.avatar}</span>`;
        btn.setAttribute('aria-label', `Profile: ${profile.name}`);
        btn.title = profile.name;
    } else {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        btn.setAttribute('aria-label', 'Sign In');
        btn.title = 'Sign In';
    }
}

// Login prompt modal
export function showLoginPrompt(message) {
    // Remove existing prompt if any
    const existing = document.getElementById('login-prompt');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'login-prompt';
    modal.className = 'login-prompt-overlay';
    modal.innerHTML = `
    <div class="login-prompt-card">
      <button class="login-prompt-close" id="prompt-close">×</button>
      <div class="login-prompt-icon">🌸</div>
      <p class="login-prompt-text">${message || 'Sign in to save your bouquets and like others!'}</p>
      <button class="btn btn-primary" id="prompt-signin">Sign In</button>
      <button class="btn-link" id="prompt-cancel" style="margin-top: 0.5rem;">Maybe Later</button>
    </div>
  `;
    document.body.appendChild(modal);

    // Animate in
    requestAnimationFrame(() => modal.classList.add('visible'));

    document.getElementById('prompt-signin').addEventListener('click', () => {
        modal.remove();
        navigate('/profile');
    });

    document.getElementById('prompt-close').addEventListener('click', () => {
        modal.classList.remove('visible');
        setTimeout(() => modal.remove(), 300);
    });

    document.getElementById('prompt-cancel').addEventListener('click', () => {
        modal.classList.remove('visible');
        setTimeout(() => modal.remove(), 300);
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }
    });
}
