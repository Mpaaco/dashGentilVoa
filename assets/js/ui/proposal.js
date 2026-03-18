// ui/proposal.js
// Responsabilidade: Modal de Nova Proposta — abertura, validação e envio para Google Sheets

function initProposalModal() {
  const btnOpen = document.getElementById('btn-open-proposal-modal');
  const btnClose = document.getElementById('btn-close-proposal-modal');
  const modal = document.getElementById('proposal-modal');
  const form = document.getElementById('proposal-form');

  if (!btnOpen || !btnClose || !modal || !form) return;

  // Abre o modal
  btnOpen.addEventListener('click', (e) => {
    e.preventDefault();
    _abreModal(modal);
  });

  // Fecha o modal (X)
  btnClose.addEventListener('click', () => _fechaModal(modal));

  // Fecha ao clicar no overlay
  modal.addEventListener('click', (e) => {
    if (e.target === modal) _fechaModal(modal);
  });

  // Fecha com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      _fechaModal(modal);
    }
  });

  // Submissão do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    _enviarProposta(form, modal);
  });

  // Máscara de dinheiro no campo Valor
  const inputValor = document.getElementById('input-valor');
  if (inputValor) {
    inputValor.addEventListener('input', _mascaraDinheiro);
  }
}

// ─── Envio para Google Sheets ────────────────────────────────────────────────

function _enviarProposta(form, modal) {
  const btnSubmit = form.querySelector('.btn-submit-proposal');
  const feedback = document.getElementById('proposal-feedback');

  // Coleta os valores
  const payload = {
    contratante: form.contratante.value.trim(),
    projeto:     form.projeto.value.trim(),
    dataInicio:  _formatDateBR(form.dataInicio.value.trim()),
    dataFim:     _formatDateBR(form.dataFim.value.trim()),
    valor:       form.valor.value.trim(),
    responsavel: form.responsavel.value.trim(),
    documento:   form.documento.value.trim(),
  };

  // Validação — todos os campos são obrigatórios
  const camposVazios = Object.entries(payload).filter(([_, v]) => !v);
  if (camposVazios.length > 0) {
    _showFeedback(feedback, 'Todos os campos são obrigatórios.', 'error');
    return;
  }

  // Estado de loading
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Enviando...';
  _showFeedback(feedback, '', 'hidden');

  // Envia via Image GET — 100% imune a CORS
  // O navegador carrega a "imagem" (na verdade faz GET no Apps Script)
  // e segue todos os redirects automaticamente
  const params = new URLSearchParams(payload);
  const url = APPS_SCRIPT_URL + '?' + params.toString();

  const img = new Image();

  img.onload = img.onerror = function () {
    // Aguarda 3s para o CSV do Google Sheets atualizar antes de re-buscar
    setTimeout(async () => {
      _showFeedback(feedback, '✓ Proposta enviada com sucesso!', 'success');
      form.reset();
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Enviar';

      // Atualiza tabelas, gráficos e progresso com os novos dados
      await refreshDashboard();

      setTimeout(() => {
        _fechaModal(modal);
        _showFeedback(feedback, '', 'hidden');
      }, 1500);
    }, 3000);
  };

  img.src = url;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _formatDateBR(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function _showFeedback(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = 'proposal-feedback';
  if (type !== 'hidden') {
    el.classList.add(`proposal-feedback--${type}`);
  }
}

/**
 * Máscara de dinheiro brasileiro: R$ X.XXX,XX
 * Formata o valor automaticamente enquanto o usuário digita
 */
function _mascaraDinheiro(e) {
  let v = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
  if (!v) { e.target.value = ''; return; }

  v = (parseInt(v, 10) / 100).toFixed(2); // Converte centavos
  v = v.replace('.', ','); // Troca ponto por vírgula
  v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona pontos de milhar

  e.target.value = 'R$ ' + v;
}
