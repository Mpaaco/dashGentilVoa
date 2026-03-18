// charts/charts.js
// Responsabilidade: Configuração e atualização dinâmica dos gráficos (Chart.js)

let barChartInstance = null;
let lineChartInstance = null;

// ─── Helpers de Agregação ────────────────────────────────────────────────────

/**
 * Modo Anual: soma de valor por mês para o ano selecionado
 */
function agregaAnual(contratos, ano) {
  const totais = Array(12).fill(0);
  contratos.forEach(c => {
    if (c.dataInicio && c.dataInicio.getFullYear() === ano) {
      totais[c.dataInicio.getMonth()] += c.valor;
    }
  });
  return { labels: NOMES_MESES, data: totais };
}

/**
 * Modo Mensal: soma de valor por dia para mês/ano selecionado
 */
function agregaMensal(contratos, mes, ano) {
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const totais = Array(diasNoMes).fill(0);
  contratos.forEach(c => {
    if (
      c.dataInicio &&
      c.dataInicio.getMonth() === mes &&
      c.dataInicio.getFullYear() === ano
    ) {
      totais[c.dataInicio.getDate() - 1] += c.valor;
    }
  });
  return {
    labels: Array.from({ length: diasNoMes }, (_, i) => String(i + 1)),
    data: totais,
  };
}

/**
 * Retorna lista ordenada de anos distintos presentes nos contratos
 */
function getAnosDisponiveis(contratos) {
  const anos = new Set();
  contratos.forEach(c => { if (c.dataInicio) anos.add(c.dataInicio.getFullYear()); });
  const anoAtual = new Date().getFullYear();
  anos.add(anoAtual); // Garante que o ano atual sempre aparece
  return [...anos].sort((a, b) => b - a); // Mais recente primeiro
}

// ─── Configuração Base do Gráfico de Barras ──────────────────────────────────

function buildBarConfig(labels, data) {
  const max = Math.max(...data, 500);
  const teto = Math.ceil(max / 500) * 500;

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Recebidos',
        data,
        backgroundColor: '#C95B16',
        hoverBackgroundColor: '#FF751F',
        borderRadius: 20,
        borderSkipped: false,
        barThickness: 24,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: ctx => ` R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: teto,
          ticks: {
            stepSize: teto / 4,
            callback: value => value === 0 ? '0' : (value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value),
            color: '#777',
            font: { size: 11, weight: 'bold' },
            padding: 10,
          },
          border: { display: false },
          grid: { color: '#e0e0e0', tickColor: 'transparent', borderDash: [5, 5], drawBorder: false }
        },
        x: {
          ticks: { color: '#333', font: { size: 10, weight: 'bold' } },
          border: { display: false },
          grid: { display: false, drawBorder: false }
        }
      }
    }
  };
}

// ─── Gráfico de Barras ───────────────────────────────────────────────────────

function initBarChart(contratos) {
  const anoAtual = new Date().getFullYear();
  const { labels, data } = agregaAnual(contratos, anoAtual);
  const barCtx = document.getElementById('barChart').getContext('2d');
  barChartInstance = new Chart(barCtx, buildBarConfig(labels, data));
}

function setBarChartAnual(contratos, ano) {
  if (!barChartInstance) return;
  const { labels, data } = agregaAnual(contratos, ano);
  const max = Math.max(...data, 500);
  const teto = Math.ceil(max / 500) * 500;
  barChartInstance.data.labels = labels;
  barChartInstance.data.datasets[0].data = data;
  barChartInstance.options.scales.y.max = teto;
  barChartInstance.update();
}

function setBarChartMensal(contratos, mes, ano) {
  if (!barChartInstance) return;
  const { labels, data } = agregaMensal(contratos, mes, ano);
  const max = Math.max(...data, 100);
  const teto = Math.ceil(max / 100) * 100;
  barChartInstance.data.labels = labels;
  barChartInstance.data.datasets[0].data = data;
  barChartInstance.options.scales.y.max = teto;
  barChartInstance.update();
}

// ─── Gráfico de Linha ────────────────────────────────────────────────────────

function initLineChart(contratos) {
  const anoAtual = new Date().getFullYear();
  const { data: mensal } = agregaAnual(contratos, anoAtual);
  const lineCtx = document.getElementById('lineChart').getContext('2d');

  lineChartInstance = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: NOMES_MESES,
      datasets: [{
        label: 'Recebido no Mês',
        data: mensal,
        borderColor: '#FF751F',
        borderWidth: 3,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHitRadius: 50,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 10, bottom: 20, left: 10, right: 10 } },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            title: ctx => NOMES_MESES_FULL[ctx[0].dataIndex],
            label: ctx => ` R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          display: true,
          ticks: { display: false },
          border: { display: false },
          grid: { color: '#e0e0e0', tickColor: 'transparent', borderDash: [5, 5], drawBorder: false }
        },
        x: { display: false, grid: { display: false } }
      }
    }
  });
}

function updateLineChartAnual(contratos, ano) {
  if (!lineChartInstance) return;
  const { data: mensal } = agregaAnual(contratos, ano);
  lineChartInstance.data.datasets[0].data = mensal;
  lineChartInstance.update();
}
