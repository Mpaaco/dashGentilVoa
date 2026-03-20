// ui/table.js
// Responsabilidade: Popular as tabelas de histórico de contratos (principal e modal)
// Inclui funcionalidade de exclusão de contratos

// Variável para armazenar o contratante pendente de exclusão
let _pendingDeleteContratante = null;

function populaTabela(contratos) {
  const tbodyPrincipal = document.querySelector('.history-section .history-table tbody');
  const tbodyModal = document.getElementById('modal-history-tbody');

  if (!tbodyPrincipal && !tbodyModal) return;

  const htmlContent = geraHtmlTabela(contratos);

  if (tbodyPrincipal) tbodyPrincipal.innerHTML = htmlContent;
  if (tbodyModal) tbodyModal.innerHTML = htmlContent;
}

function geraHtmlTabela(contratos) {
  if (contratos.length === 0) {
    return `
      <tr>
        <td colspan="5" style="text-align:center; color: var(--text-muted); padding: 20px;">
          Nenhum contrato encontrado.
        </td>
      </tr>`;
  }

  // Ordena por data mais recente
  const ordenados = [...contratos].sort((a, b) => {
    if (!a.dataInicio) return 1;
    if (!b.dataInicio) return -1;
    return b.dataInicio - a.dataInicio;
  });

  return ordenados.map(c => _geraLinhaTabela(c)).join('');
}

// ─── Inicialização do Modal de Exclusão ──────────────────────────────────────

function initDeleteModal() {
  const modal = document.getElementById('delete-confirm-modal');
  const btnClose = document.getElementById('btn-close-delete-modal');
  const btnCancel = document.getElementById('btn-cancel-delete');
  const btnConfirm = document.getElementById('btn-confirm-delete');

  if (!modal || !btnClose || !btnCancel || !btnConfirm) return;

  // Fecha o modal (X)
  btnClose.addEventListener('click', () => _fechaModal(modal));
  btnCancel.addEventListener('click', () => _fechaModal(modal));

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

  // Confirmar exclusão
  btnConfirm.addEventListener('click', () => _executarExclusao());
}

// ─── Exclusão de Contrato ────────────────────────────────────────────────────

function _abrirDeleteModal(contratante) {
  _pendingDeleteContratante = contratante;

  const modal = document.getElementById('delete-confirm-modal');
  const nameEl = document.getElementById('delete-contratante-name');
  const feedback = document.getElementById('delete-feedback');
  const btnConfirm = document.getElementById('btn-confirm-delete');

  if (nameEl) nameEl.textContent = `"${contratante}"?`;
  if (feedback) { feedback.textContent = ''; feedback.className = 'proposal-feedback'; }
  if (btnConfirm) { btnConfirm.disabled = false; btnConfirm.textContent = 'Excluir'; }

  _abreModal(modal);
}

function _executarExclusao() {
  if (!_pendingDeleteContratante) return;

  const modal = document.getElementById('delete-confirm-modal');
  const feedback = document.getElementById('delete-feedback');
  const btnConfirm = document.getElementById('btn-confirm-delete');

  // Estado de loading
  btnConfirm.disabled = true;
  btnConfirm.textContent = 'Excluindo...';

  const params = new URLSearchParams({
    action: 'delete',
    contratante: _pendingDeleteContratante,
  });

  const url = APPS_SCRIPT_URL + '?' + params.toString();
  const img = new Image();

  img.onload = img.onerror = function () {
    setTimeout(async () => {
      _showFeedback(feedback, '✓ Contrato excluído com sucesso!', 'success');
      btnConfirm.disabled = false;
      btnConfirm.textContent = 'Excluir';
      _pendingDeleteContratante = null;

      // Atualiza o dashboard
      await refreshDashboard();

      setTimeout(() => {
        _fechaModal(modal);
        if (feedback) { feedback.textContent = ''; feedback.className = 'proposal-feedback'; }
      }, 1500);
    }, 3000);
  };

  img.src = url;
}

// ─── Privadas ────────────────────────────────────────────────────────────────

function _geraLinhaTabela(contrato) {
  const iniciais = contrato.contratante
    .split(' ')
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();

  const dataFormatada = contrato.dataInicio
    ? contrato.dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const valorFormatado = contrato.valorRaw ||
    `R$ ${contrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const nomeDoc = contrato.documento ? contrato.documento.trim() : '—';
  const temDoc = nomeDoc !== '—' && nomeDoc.length > 0;

  const queryDrive = `type:pdf title:"${contrato.contratante}.pdf"`;
  const linkDrive = `https://drive.google.com/drive/u/0/search?q=${encodeURIComponent(queryDrive)}`;

  const celulaDocumento = temDoc
    ? `<a href="${linkDrive}" target="_blank" class="pdf-link">${contrato.contratante}.pdf</a>
       <a href="${linkDrive}" target="_blank" style="text-decoration: none;">
         <svg class="pdf-icon" width="20" height="20" viewBox="0 0 24 24" fill="#e67e22">
           <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path>
           <polyline points="14 2 14 8 20 8" fill="none" stroke="#e67e22" stroke-width="2"></polyline>
           <text x="7" y="18" fill="white" font-size="6" font-weight="bold">PDF</text>
         </svg>
       </a>`
    : '<span style="color:var(--text-muted)">—</span>';

  // Escapa aspas no nome do contratante para uso no onclick
  const contratanteEscaped = contrato.contratante.replace(/'/g, "\\'").replace(/"/g, '&quot;');

  return `
    <tr>
      <td>
        <div class="contractor-info">
          <div class="contractor-avatar"><span>${iniciais}</span></div>
          <span class="contractor-name">${contrato.contratante}</span>
        </div>
      </td>
      <td>${dataFormatada}</td>
      <td>${valorFormatado}</td>
      <td>${celulaDocumento}</td>
      <td>
        <button class="btn-delete-contract" onclick="_abrirDeleteModal('${contratanteEscaped}')" title="Excluir contrato">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </td>
    </tr>`;
}
