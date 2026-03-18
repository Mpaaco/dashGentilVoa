// api/data.js
// Responsabilidade: Buscar e parsear o CSV do Google Sheets

/**
 * Converte "R$ 1.234,56" → 1234.56
 */
function parseValor(str) {
  if (!str) return 0;
  return parseFloat(
    str
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
  ) || 0;
}

/**
 * Converte "DD/MM/YYYY" → Date
 */
function parseData(str) {
  if (!str) return null;
  const [d, m, y] = str.trim().split('/');
  return new Date(Number(y), Number(m) - 1, Number(d));
}

/**
 * Parse de linha CSV respeitando campos entre aspas
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Busca e parseia o CSV. Retorna array de contratos.
 * Cada contrato: { contratante, projeto, dataInicio, dataFim, valor, valorRaw, responsavel, documento }
 */
async function fetchContratos() {
  const response = await fetch(CSV_URL);
  const text = await response.text();

  const linhas = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Linha 0: título da planilha
  // Linha 1: cabeçalho (Contratante, Projeto, Data Início, Data Fim, Valor, Responsável, Documento)
  // Linha 2+: dados reais
  const dados = linhas.slice(2);

  return dados.map(linha => {
    const cols = parseCSVLine(linha);
    return {
      contratante:  cols[0] || '',
      projeto:      cols[1] || '',
      dataInicio:   parseData(cols[2]),
      dataFim:      parseData(cols[3]),
      valor:        parseValor(cols[4]),
      valorRaw:     (cols[4] || '').trim(),
      responsavel:  cols[5] || '',
      documento:    cols[6] || '',
    };
  }).filter(c => c.contratante.length > 0);
}
