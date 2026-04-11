import { navigate } from '../router.js';

export function renderNotFound(app) {
    app.innerHTML = `
    <div class="page-frame">
      <div class="notfound-page">
        <div class="notfound-flower">🥀</div>
        <h1 class="notfound-title">404</h1>
        <p class="notfound-subtitle">Lost in the garden?</p>
        <p class="notfound-text">
          This path doesn't lead anywhere.<br>
          Let's get you back to the flowers.
        </p>
        <div class="notfound-actions">
          <button class="btn btn-primary" id="btn-go-home">Back to Home</button>
          <button class="btn btn-secondary" id="btn-go-garden">Visit Garden</button>
        </div>
      </div>
    </div>
  `;

    document.getElementById('btn-go-home').addEventListener('click', () => {
        navigate('/');
    });

    document.getElementById('btn-go-garden').addEventListener('click', () => {
        navigate('/garden');
    });
}
