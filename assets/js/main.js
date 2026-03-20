// main.js
// Ponto de entrada: orquestra o carregamento e inicialização de todos os módulos
// Ordem de dependência: constants → data → charts → ui → features → toggles → main

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Busca o valor da meta da planilha (ou localStorage/padrão)
  try {
    await fetchMetaValor();
    _atualizaDisplayMeta(META_VALOR);
  } catch (err) {
    console.warn('Usando meta padrão:', err);
  }

  // 2. Busca contratos do Google Sheets
  let contratos = [];
  try {
    contratos = await fetchContratos();
  } catch (err) {
    console.error('Erro ao carregar dados da planilha:', err);
  }

  // 3. Popula os selects de filtro com opções dinâmicas
  populaSelects(contratos);

  // 4. Inicializa os gráficos com dados reais
  initBarChart(contratos);
  initLineChart(contratos);

  // 5. Inicializa os toggles e eventos dos selects
  initToggles(contratos);

  // 6. Inicializa o download de Excel
  initDownload(contratos);

  // 7. Atualiza o valor "Recebido até Hoje" e a barra de progresso
  _atualizaMetaEProgresso(contratos);

  // 8. Popula a tabela de Histórico de Contratos
  populaTabela(contratos);

  // 9. Inicializa Modal do Header (Histórico)
  initHistoryModal();

  // 10. Inicializa Modal de Nova Proposta
  initProposalModal();

  // 11. Inicializa Modal de Exclusão de Contratos
  initDeleteModal();

  // 12. Inicializa Modal de Edição de Meta
  initMetaModal();

  // 13. Lógica da Tela de Loading (Mínimo de 15 segundos)
  initLoadingScreen();
});

// ─── Privadas ────────────────────────────────────────────────────────────────

function _atualizaMetaEProgresso(contratos) {
  const totalRecebido = contratos.reduce((acc, c) => acc + (c.valor || 0), 0);

  // Atualiza o valor exibido no card do gráfico de linha
  const mainValueEl = document.querySelector('.main-value');
  if (mainValueEl) {
    mainValueEl.textContent = totalRecebido.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Atualiza a barra de progresso / meta
  const porcentagem = (totalRecebido / META_VALOR) * 100;
  // Mínimo 2% (para o foguete não desaparecer), máximo 100%
  const pxExibicao = Math.max(2, Math.min(porcentagem, 100));

  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');

  if (progressFill && progressText) {
    progressFill.style.width = `${pxExibicao}%`;
    progressText.textContent = `${Math.round(porcentagem)}%`;
  }
}

// ─── Refresh Global ──────────────────────────────────────────────────────────

/**
 * Re-busca os dados da planilha e atualiza tabelas, gráficos e progresso.
 * Chamada após envio de nova proposta para refletir os dados atualizados.
 */
async function refreshDashboard() {
  try {
    const contratos = await fetchContratos();

    // Atualiza as tabelas (principal e modal)
    populaTabela(contratos);

    // Atualiza gráficos
    const anoAtual = new Date().getFullYear();
    setBarChartAnual(contratos, anoAtual);
    updateLineChartAnual(contratos, anoAtual);

    // Atualiza meta e progresso
    _atualizaMetaEProgresso(contratos);

  } catch (err) {
    console.error('Erro ao atualizar dashboard:', err);
  }
}
