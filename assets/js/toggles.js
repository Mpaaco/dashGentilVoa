// toggles.js
// Responsabilidade: Lógica dos botões de toggle e seletores de período

function initToggles(contratos) {
  const btnAnual  = document.getElementById('btn-anual');
  const btnMensal = document.getElementById('btn-mensal');
  const filterAnual  = document.getElementById('filter-anual');
  const filterMensal = document.getElementById('filter-mensal');
  const yearSelect      = document.getElementById('bar-year-select');
  const monthSelect     = document.getElementById('bar-month-select');
  const monthYearSelect = document.getElementById('bar-month-year-select');

  // ─── Helpers para ler os selects ─────────────────────────────────────────

  function getAnoAnual()  { return parseInt(yearSelect.value);      }
  function getMesMensal() { return parseInt(monthSelect.value);     }
  function getAnoMensal() { return parseInt(monthYearSelect.value); }

  // ─── Atualizações dos gráficos ───────────────────────────────────────────

  function atualizaAnual() {
    const ano = getAnoAnual();
    setBarChartAnual(contratos, ano);
    updateLineChartAnual(contratos, ano); // Mantém o gráfico de linha sincronizado
  }

  function atualizaMensal() {
    setBarChartMensal(contratos, getMesMensal(), getAnoMensal());
  }

  // ─── Toggle Anual / Mensal ────────────────────────────────────────────────

  btnAnual.addEventListener('click', () => {
    btnAnual.classList.add('active');
    btnMensal.classList.remove('active');
    filterAnual.classList.remove('hidden');
    filterMensal.classList.add('hidden');
    atualizaAnual();
  });

  btnMensal.addEventListener('click', () => {
    btnMensal.classList.add('active');
    btnAnual.classList.remove('active');
    filterMensal.classList.remove('hidden');
    filterAnual.classList.add('hidden');
    atualizaMensal();
  });

  // ─── Eventos dos selects ──────────────────────────────────────────────────

  yearSelect.addEventListener('change', atualizaAnual);
  monthSelect.addEventListener('change', atualizaMensal);
  monthYearSelect.addEventListener('change', atualizaMensal);

  // ─── Toggle do gráfico de linhas (Recebido / Enviado) ─────────────────────
  const lineToggles = document.querySelectorAll('.right-chart .toggle-btn');
  lineToggles.forEach(btn => {
    btn.addEventListener('click', e => {
      lineToggles.forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
}
