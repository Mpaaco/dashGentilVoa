// ui/modal.js
// Responsabilidade: Inicialização e controle do modal de histórico completo

function initHistoryModal() {
  const btnOpen = document.getElementById('btn-open-history-modal');
  const btnClose = document.getElementById('btn-close-history-modal');
  const modal = document.getElementById('history-modal');

  if (!btnOpen || !btnClose || !modal) return;

  btnOpen.addEventListener('click', (e) => {
    e.preventDefault();
    _abreModal(modal);
  });

  btnClose.addEventListener('click', () => _fechaModal(modal));

  // Fecha ao clicar no overlay (fora da janela)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) _fechaModal(modal);
  });

  // Fecha com a tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      _fechaModal(modal);
    }
  });
}

// ─── Privadas ────────────────────────────────────────────────────────────────

function _abreModal(modal) {
  modal.classList.remove('hidden');
  // Força reflow para a transição funcionar após remover o hidden
  void modal.offsetHeight;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function _fechaModal(modal) {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  // Aguarda a transição terminar antes de esconder completamente
  modal.addEventListener('transitionend', () => {
    if (!modal.classList.contains('is-open')) {
      modal.classList.add('hidden');
    }
  }, { once: true });
}
