# 🚀 Dashboard GentilVoa

Dashboard de acompanhamento de contratos, metas e valores da **GentilVoa** — desenvolvido com HTML, CSS e JavaScript puro.

## ✨ Funcionalidades

- **Login seguro** — Autenticação por e-mail com hash SHA-256 (sem exposição de dados)
- **Barra de meta** — Progresso visual com gradiente e foguete animado
- **Gráfico de barras** — Valores recebidos por mês/ano com filtros dinâmicos
- **Gráfico de linha** — Desempenho mensal ao longo do ano
- **Histórico de contratos** — Tabela com dados em tempo real do Google Sheets
- **Nova proposta** — Modal para cadastrar contratos diretamente na planilha
- **Download Excel** — Exportação dos dados via SheetJS
- **Loading screen** — Tela de carregamento com logo flutuante e barra de progresso

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Estrutura | HTML5 semântico |
| Estilo | CSS3 (variáveis, glassmorphism, animações) |
| Lógica | JavaScript ES6+ (Vanilla) |
| Gráficos | [Chart.js](https://www.chartjs.org/) |
| Planilha | [SheetJS](https://sheetjs.com/) |
| Dados | Google Sheets (CSV público) |
| Escrita | Google Apps Script |
| Fonte | [Inter (Google Fonts)](https://fonts.google.com/specimen/Inter) |

## 📁 Estrutura do Projeto

```
dash_gentilvoa/
├── index.html                  # Dashboard principal
├── login.html                  # Página de login
├── assets/
│   ├── css/
│   │   ├── style.css           # Estilos do dashboard
│   │   └── login.css           # Estilos da login page
│   ├── img/                    # Logos, backgrounds, ícones
│   └── js/
│       ├── main.js             # Ponto de entrada / orquestrador
│       ├── toggles.js          # Toggles e seletores de período
│       ├── config/
│       │   └── constants.js    # URLs, metas, constantes globais
│       ├── api/
│       │   └── data.js         # Fetch e parse do CSV
│       ├── auth/
│       │   ├── auth.js         # Validação SHA-256 e sessão
│       │   └── login-handler.js# Lógica do formulário de login
│       ├── charts/
│       │   └── charts.js       # Configuração Chart.js
│       ├── ui/
│       │   ├── loading.js      # Tela de carregamento
│       │   ├── modal.js        # Modal de histórico
│       │   ├── proposal.js     # Modal de nova proposta
│       │   ├── selects.js      # Selects dinâmicos
│       │   └── table.js        # Tabelas de contratos
│       └── features/
│           └── download.js     # Exportação Excel
└── README.md
```

## 🚀 Como Usar

1. Abra `login.html` no navegador
2. Insira o e-mail autorizado
3. Acesse o dashboard com dados em tempo real

## 👥 Créditos

Desenvolvido por **CO&SO** para **GentilVoa**.
