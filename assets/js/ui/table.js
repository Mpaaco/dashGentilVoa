// ui/table.js
// Responsabilidade: Popular as tabelas de histórico de contratos (principal e modal)

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
        <td colspan="4" style="text-align:center; color: var(--text-muted); padding: 20px;">
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
    </tr>`;
}
