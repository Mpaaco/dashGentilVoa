// features/download.js
// Responsabilidade: Exportar resumo dos contratos em .xlsx via SheetJS

function downloadExcel(contratos) {
  const header = ['Contratante', 'Projeto', 'Data Início', 'Data Fim', 'Valor'];

  const rows = contratos.map(c => [
    c.contratante,
    c.projeto,
    c.dataInicio ? c.dataInicio.toLocaleDateString('pt-BR') : '',
    c.dataFim    ? c.dataFim.toLocaleDateString('pt-BR')    : '',
    c.valorRaw   || `R$ ${c.valor.toFixed(2).replace('.', ',')}`,
  ]);

  const wsData = [header, ...rows];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Largura das colunas em caracteres
  ws['!cols'] = [
    { wch: 25 }, // Contratante
    { wch: 25 }, // Projeto
    { wch: 14 }, // Data Início
    { wch: 14 }, // Data Fim
    { wch: 14 }, // Valor
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Contratos');
  XLSX.writeFile(wb, 'resumo-gentilvoa.xlsx');
}

function initDownload(contratos) {
  const btn = document.querySelector('.download-btn');
  if (!btn) return;
  btn.addEventListener('click', () => downloadExcel(contratos));
}
