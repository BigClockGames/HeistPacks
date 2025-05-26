
document.addEventListener('DOMContentLoaded', () => {
  const newGameBtn = document.getElementById('newGameBtn');
  const loadGameBtn = document.getElementById('loadGameBtn');
  const settingsBtn = document.getElementById('settingsBtn');

  // Check if save exists
  const hasSave = localStorage.getItem('survivorPacksGame');
  if (!hasSave) {
    loadGameBtn.disabled = true;
  }

  newGameBtn.addEventListener('click', () => {
    // Clear any existing save for new game
    localStorage.removeItem('survivorPacksGame');
    // Redirect to main game
    window.location.href = 'index.html';
  });

  loadGameBtn.addEventListener('click', () => {
    if (hasSave) {
      // Load existing game
      window.location.href = 'index.html';
    }
  });

  settingsBtn.addEventListener('click', () => {
    // Go to main game but open settings tab
    window.location.href = 'index.html?tab=settings';
  });

  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (document.activeElement === newGameBtn) {
        newGameBtn.click();
      } else if (document.activeElement === loadGameBtn && !loadGameBtn.disabled) {
        loadGameBtn.click();
      } else if (document.activeElement === settingsBtn) {
        settingsBtn.click();
      }
    }
  });
});
