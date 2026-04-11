import { navigate } from '../router.js';
import { handleUpiPayment } from '../utils/upi.js';

export function renderAbout(app) {
  app.innerHTML = `
    <div class="page-frame">
      <div class="about-page">
        <div class="builder-header">
          <a class="logo logo-small" id="logo-home">Digibouquet</a>
        </div>

        <div class="about-card animate-in">
          <div class="about-icon">💐</div>
          <h2 class="about-title">About Digibouquet</h2>
          <p class="about-text">
            A digital flower bouquet builder — pick your blooms,
            arrange them with love, and send them to someone special.
            No water needed. 🌿
          </p>
        </div>

        <div class="about-card animate-in" style="animation-delay: 0.1s;">
          <h3 class="about-section-title">💡 Bouquet Tips</h3>
          <ul class="about-tips-list">
            <li>
              <strong>Odd numbers</strong> — Bouquets with 7 or 9 flowers look more natural
            </li>
            <li>
              <strong>Mix textures</strong> — Pair big roses with small daisies for depth
            </li>
            <li>
              <strong>Color harmony</strong> — Stick to 2-3 colors for an elegant look
            </li>
            <li>
              <strong>Add variety</strong> — Use at least 3 different flower types
            </li>
            <li>
              <strong>Drag to arrange</strong> — Reposition flowers after placing them
            </li>
            <li>
              <strong>Try the templates</strong> — Start with "Blushing Rose" or "Sunlit Field"
            </li>
          </ul>
        </div>

        <div class="about-card animate-in" style="animation-delay: 0.2s;">
          <h3 class="about-section-title">⌨️ Keyboard Shortcuts</h3>
          <table class="shortcuts-table">
            <tbody>
              <tr>
                <td class="shortcut-key"><kbd>Ctrl</kbd> + <kbd>Z</kbd></td>
                <td>Undo flower selection</td>
              </tr>
              <tr>
                <td class="shortcut-key"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd></td>
                <td>Redo flower selection</td>
              </tr>
              <tr>
                <td class="shortcut-key"><kbd>Esc</kbd></td>
                <td>Go back one step</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="about-card animate-in" style="animation-delay: 0.3s;">
          <h3 class="about-section-title">🌼 Flower Meanings</h3>
          <div class="meanings-grid">
            <div class="meaning-item">🌹 <strong>Rose</strong><br>Passion & true love</div>
            <div class="meaning-item">🌻 <strong>Sunflower</strong><br>Adoration & loyalty</div>
            <div class="meaning-item">🌷 <strong>Tulip</strong><br>Perfect deep love</div>
            <div class="meaning-item">🌸 <strong>Peony</strong><br>Romance & prosperity</div>
            <div class="meaning-item">🌼 <strong>Daisy</strong><br>Innocence & purity</div>
            <div class="meaning-item">🌺 <strong>Lily</strong><br>Pure love & devotion</div>
            <div class="meaning-item">💮 <strong>Orchid</strong><br>Refinement & beauty</div>
            <div class="meaning-item">🏵️ <strong>Dahlia</strong><br>Elegance & strength</div>
            <div class="meaning-item">🌼 <strong>Carnation</strong><br>Fascination & love</div>
            <div class="meaning-item">🌸 <strong>Anemone</strong><br>Anticipation</div>
            <div class="meaning-item">💐 <strong>Ranunculus</strong><br>Charm & allure</div>
            <div class="meaning-item">🌺 <strong>Zinnia</strong><br>Lasting affection</div>
          </div>
        </div>

        <div class="about-support animate-in" style="animation-delay: 0.4s;">
          <div class="about-support-content">
            <h3 class="about-support-title">Support this Project</h3>
            <p class="about-support-text">
              If you enjoyed building a digital bouquet, consider supporting the creator.
               Your donations help keep the server running and the flowers blooming! ☕
            </p>
            <a href="#" id="btn-upi-about" class="btn btn-donate">
              Pay via UPI
            </a>
          </div>
        </div>

        <div class="about-actions animate-in" style="animation-delay: 0.5s;">
          <button class="btn btn-primary" id="btn-build">Build a Bouquet</button>
          <button class="btn btn-secondary" id="btn-garden-about">View Garden</button>
        </div>

        <div class="about-footer animate-in" style="animation-delay: 0.5s;">
          <p class="about-footer-text">
            Made with 🌸 — A digital flower bouquet builder
          </p>
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

  document.getElementById('btn-garden-about').addEventListener('click', () => {
    navigate('/garden');
  });

  document.getElementById('btn-upi-about').addEventListener('click', handleUpiPayment);
}
