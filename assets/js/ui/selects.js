// ui/selects.js
// Responsabilidade: Preencher os selects de filtro (ano e mês) com opções dinâmicas

function populaSelects(contratos) {
  const anos = getAnosDisponiveis(contratos);
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth();

  _populaSelectDeAnos(document.getElementById('bar-year-select'), anos, anoAtual);
  _populaSelectDeAnos(document.getElementById('bar-month-year-select'), anos, anoAtual);
  _populaSelectDeMeses(document.getElementById('bar-month-select'), mesAtual);
}

// ─── Privadas ────────────────────────────────────────────────────────────────

function _populaSelectDeAnos(selectEl, anos, anoAtual) {
  if (!selectEl) return;
  anos.forEach(ano => {
    const opt = document.createElement('option');
    opt.value = ano;
    opt.textContent = ano;
    if (ano === anoAtual) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

function _populaSelectDeMeses(selectEl, mesAtual) {
  if (!selectEl) return;
  NOMES_MESES_FULL.forEach((nome, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = nome;
    if (idx === mesAtual) opt.selected = true;
    selectEl.appendChild(opt);
  });
}
