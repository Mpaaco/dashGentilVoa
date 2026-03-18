// ui/loading.js
// Responsabilidade: Controlar o tempo mínimo e a animação de saída da loading screen

function initLoadingScreen() {
  const timeElapsed = window.performance ? window.performance.now() : 0;
  const tempoRestante = Math.max(0, MIN_LOADING_TIME - timeElapsed);

  setTimeout(() => {
    _escondeLoadingScreen();
  }, tempoRestante);
}

// ─── Privadas ────────────────────────────────────────────────────────────────

function _escondeLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;

  loadingScreen.classList.add('fade-out');

  // Remove o elemento após a animação CSS (800ms)
  setTimeout(() => loadingScreen.remove(), 800);
}
