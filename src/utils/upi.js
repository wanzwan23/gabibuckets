const UPI_ID = 'aditya262701@okicici';
const UPI_PAYEE_NAME = 'Digibouquet';
const UPI_NOTE = 'Support Digibouquet';
const UPI_QR_SIZE = 240;

let activeUpiModal = null;

function buildUpiLink() {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE_NAME,
    tn: UPI_NOTE,
  });
  return `upi://pay?${params.toString()}`;
}

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function getUpiQrUrl() {
  const upiLink = buildUpiLink();
  const encoded = encodeURIComponent(upiLink);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${UPI_QR_SIZE}x${UPI_QR_SIZE}&margin=8&data=${encoded}`;
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  // Fallback for non-secure contexts.
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textArea);
  return copied;
}

function closeUpiModal() {
  if (!activeUpiModal) return;

  const modal = activeUpiModal;
  activeUpiModal = null;

  modal.classList.remove('visible');
  setTimeout(() => {
    if (modal.parentElement) {
      modal.parentElement.removeChild(modal);
    }
  }, 180);
}

function showUpiModal() {
  closeUpiModal();

  const overlay = document.createElement('div');
  overlay.className = 'upi-modal-overlay';
  overlay.innerHTML = `
    <div class="upi-modal-card" role="dialog" aria-modal="true" aria-label="UPI Payment">
      <button class="upi-modal-close" type="button" aria-label="Close">&times;</button>
      <div class="upi-modal-icon">💳</div>
      <h3 class="upi-modal-title">Pay via UPI</h3>
      <p class="upi-modal-text">Scan this QR in any UPI app or copy the UPI ID.</p>
      <img class="upi-modal-qr" src="${getUpiQrUrl()}" alt="UPI QR code for payment" loading="lazy" />
      <p class="upi-modal-upi-id" id="upi-id-text">${UPI_ID}</p>
      <div class="upi-modal-actions">
        <button class="btn btn-secondary" id="btn-copy-upi" type="button">Copy UPI ID</button>
        <a class="btn btn-primary" href="${buildUpiLink()}">Open UPI App</a>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  activeUpiModal = overlay;

  const onEscape = (event) => {
    if (event.key === 'Escape') {
      closeUpiModal();
      document.removeEventListener('keydown', onEscape);
    }
  };

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeUpiModal();
      document.removeEventListener('keydown', onEscape);
    }
  });

  overlay.querySelector('.upi-modal-close').addEventListener('click', () => {
    closeUpiModal();
    document.removeEventListener('keydown', onEscape);
  });

  overlay.querySelector('#btn-copy-upi').addEventListener('click', async () => {
    const copyBtn = overlay.querySelector('#btn-copy-upi');
    try {
      await copyText(UPI_ID);
      copyBtn.textContent = 'Copied';
    } catch {
      copyBtn.textContent = 'Copy Failed';
    }

    setTimeout(() => {
      copyBtn.textContent = 'Copy UPI ID';
    }, 1200);
  });

  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });
  document.addEventListener('keydown', onEscape);
}

export async function handleUpiPayment(event) {
  event.preventDefault();

  if (isMobileDevice()) {
    window.location.href = buildUpiLink();
    return;
  }

  showUpiModal();
}

export { UPI_ID };
