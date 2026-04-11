// Lightweight localStorage-based user profile system
const PROFILE_KEY = 'digibouquet-profile';

const AVATAR_EMOJIS = [
    '🌸', '🌺', '🌻', '🌹', '🌷', '💐',
    '🌿', '🍀', '🌵', '🦋', '🐝', '🌈',
    '✨', '💫', '🎨', '🎵', '🦊', '🐱',
    '🐰', '🦄', '🌙', '☀️', '🍄', '🫧',
];

/**
 * Create or update a user profile
 * @param {string} name — Display name
 * @param {string} avatar — Emoji avatar
 */
export function createProfile(name, avatar) {
    const profile = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: name.trim(),
        avatar: avatar || '🌸',
        createdAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return profile;
}

/**
 * Get the current profile or null
 */
export function getProfile() {
    try {
        const data = localStorage.getItem(PROFILE_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
    return getProfile() !== null;
}

/**
 * Clear the profile (logout)
 */
export function logout() {
    localStorage.removeItem(PROFILE_KEY);
}

/**
 * Get available avatar emojis
 */
export function getAvatarEmojis() {
    return AVATAR_EMOJIS;
}
