// ui/meta.js
// Responsabilidade: Modal de edição da Meta e sincronização com Google Sheets

/**
 * Busca o valor da meta da aba "Configurações" da planilha.
 * Usa localStorage como cache/fallback para exibição imediata.
 * Retorna o valor numérico da meta.
 */
async function fetchMetaValor() {
  // 1. Tenta ler do localStorage (exibição imediata)
  const cached = localStorage.getItem('gentilvoa_meta');
  if (cached) {
    META_VALOR = parseFloat(cached);
  }

  // 2. Busca da planilha em background (fonte de verdade)
  if (CONFIG_CSV_URL) {
    try {
      const response = await fetch(CONFIG_CSV_URL);
      const text = await response.text();
      const linhas = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      // Linha 0: cabeçalho (META)
      // Linha 1: valor
      if (linhas.length >= 2) {
        const valor = parseFloat(
          linhas[1]
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
            .trim()
        );
        if (!isNaN(valor) && valor > 0) {
          META_VALOR = valor;
          localStorage.setItem('gentilvoa_meta', valor.toString());
        }
      }
    } catch (err) {
      console.warn('Não foi possível buscar meta da planilha, usando cache/padrão:', err);
    }
  }

  return META_VALOR;
}

/**
 * Inicializa o modal de edição de meta e os eventos associados.
 */
function initMetaModal() {
  const modal = document.getElementById('meta-modal');
  const btnClose = document.getElementById('btn-close-meta-modal');
  const btnCancel = document.getElementById('btn-cancel-meta');
  const btnSave = document.getElementById('btn-save-meta');
  const targetEl = document.querySelector('.progress-target');
  const inputMeta = document.getElementById('input-meta-valor');

  if (!modal || !btnClose || !btnSave || !targetEl || !inputMeta) return;

  // Clique no "10.5K" abre o modal
  targetEl.addEventListener('click', () => {
    // Preenche o input com o valor atual formatado
    inputMeta.value = 'R$ ' + META_VALOR.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const feedback = document.getElementById('meta-feedback');
    if (feedback) { feedback.textContent = ''; feedback.className = 'proposal-feedback'; }

    btnSave.disabled = false;
    btnSave.textContent = 'Salvar';

    _abreModal(modal);
  });

  // Fecha o modal
  btnClose.addEventListener('click', () => _fechaModal(modal));
  btnCancel.addEventListener('click', () => _fechaModal(modal));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) _fechaModal(modal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      _fechaModal(modal);
    }
  });

  // Máscara de dinheiro no input
  inputMeta.addEventListener('input', _mascaraDinheiroMeta);

  // Salvar
  btnSave.addEventListener('click', () => _salvarMeta(modal));
}

/**
 * Máscara de dinheiro para o campo de meta
 */
function _mascaraDinheiroMeta(e) {
  let v = e.target.value.replace(/\D/g, '');
  if (!v) { e.target.value = ''; return; }

  v = (parseInt(v, 10) / 100).toFixed(2);
  v = v.replace('.', ',');
  v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  e.target.value = 'R$ ' + v;
}

/**
 * Salva a nova meta no localStorage e no Google Sheets
 */
function _salvarMeta(modal) {
  const inputMeta = document.getElementById('input-meta-valor');
  const feedback = document.getElementById('meta-feedback');
  const btnSave = document.getElementById('btn-save-meta');

  // Parse do valor
  const valorStr = inputMeta.value
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();

  const novoValor = parseFloat(valorStr);

  if (isNaN(novoValor) || novoValor <= 0) {
    _showFeedback(feedback, 'Insira um valor válido maior que zero.', 'error');
    return;
  }

  // Estado de loading
  btnSave.disabled = true;
  btnSave.textContent = 'Salvando...';

  // 1. Atualiza localmente imediatamente
  META_VALOR = novoValor;
  localStorage.setItem('gentilvoa_meta', novoValor.toString());

  // Atualiza o display "10.5K" → formato abreviado
  _atualizaDisplayMeta(novoValor);

  // Atualiza a barra de progresso
  _refreshProgresso();

  // 2. Envia para o Google Sheets via Apps Script
  const params = new URLSearchParams({
    action: 'setMeta',
    valor: novoValor.toString(),
  });

  const url = APPS_SCRIPT_URL + '?' + params.toString();
  const img = new Image();

  img.onload = img.onerror = function () {
    setTimeout(() => {
      _showFeedback(feedback, '✓ Meta atualizada com sucesso!', 'success');
      btnSave.disabled = false;
      btnSave.textContent = 'Salvar';

      setTimeout(() => {
        _fechaModal(modal);
        if (feedback) { feedback.textContent = ''; feedback.className = 'proposal-feedback'; }
      }, 1500);
    }, 2000);
  };

  img.src = url;
}

/**
 * Formata o valor numérico em formato abreviado (ex: 10500 → "10.5K")
 */
function _formatarMetaAbreviada(valor) {
  if (valor >= 1000000) {
    const m = valor / 1000000;
    return (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + 'M';
  }
  if (valor >= 1000) {
    const k = valor / 1000;
    return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'K';
  }
  return valor.toLocaleString('pt-BR');
}

/**
 * Atualiza o texto da meta no HTML
 */
function _atualizaDisplayMeta(valor) {
  const targetEl = document.querySelector('.progress-target');
  if (targetEl) {
    targetEl.textContent = _formatarMetaAbreviada(valor);
  }
}

/**
 * Recalcula a barra de progresso com base nos contratos atuais
 */
function _refreshProgresso() {
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');

  if (!progressFill || !progressText) return;

  // Pega o valor exibido no card do gráfico de linha como referência
  const mainValueEl = document.querySelector('.main-value');
  if (!mainValueEl) return;

  const totalRecebido = parseFloat(
    mainValueEl.textContent
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
  ) || 0;

  const porcentagem = (totalRecebido / META_VALOR) * 100;
  const pxExibicao = Math.max(2, Math.min(porcentagem, 100));

  progressFill.style.width = `${pxExibicao}%`;
  progressText.textContent = `${Math.round(porcentagem)}%`;
}
