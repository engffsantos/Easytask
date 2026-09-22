# EasyTask 🚀

Aplicativo moderno, responsivo e inteligente para cadastro e gerenciamento de tarefas pessoais com prioridades, previsão do tempo integrada e decomposição automática de atividades via Inteligência Artificial (Google Gemini).

---

## ✨ Funcionalidades Principais

* **📱 Mobile-First & Responsivo:** Interface otimizada com layout fluido para smartphones, tablets e desktop.
* **🎨 Design Moderno & Clean Code:** Construído com Tailwind CSS v4, suporte a tema Claro/Escuro (Dark Mode), transições e animações suaves via CSS e Framer Motion.
* **🤖 Decomposição de Tarefas com IA (Gemini):** Quebra tarefas complexas em passos sequenciais e objetivos (3 a 7 subtarefas acionáveis) via rota server-side segura.
* **🔒 Autenticação & Dados Privados (Firebase):**
  * Login com Google via Firebase Authentication.
  * Armazenamento em tempo real com Firestore Database.
  * Regras de segurança estritas (Firestore Security Rules) garantindo que cada usuário acesse apenas seus próprios dados.
* **📅 Mini Calendário Dinâmico:** Navegação rápida por data selecionada (Ontem, Hoje, Amanhã ou dias específicos).
* **🌦️ Integração com Clima (Open-Meteo):** Exibição de temperatura e condições do tempo baseadas na localização para facilitar o planejamento diário.
* **🏷️ Filtros & Busca Avançada:** Filtros por categoria (Trabalho, Pessoal, Estudos, Saúde, Finanças, Outros), nível de prioridade (Baixa, Média, Alta) e status de conclusão.
* **✅ Gestão de Subtarefas:** Acompanhamento de progresso percentual com checklist interativo.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **React 19** + **TypeScript**
* **Vite 6** (Bundler ultrarrápido)
* **Tailwind CSS v4** (Estilização utilitária moderna e gradientes)
* **Lucide React** (Ícones limpos e consistentes)
* **Motion** (Animações fluidas)

### Backend & Serviços
* **Node.js** + **Express** (com `vite.middlewares` integrados em desenvolvimento)
* **@google/genai SDK** (Modelo `gemini-3.8-flash` para quebra de atividades no backend)
* **Firebase Firestore** (Banco de dados NoSQL em tempo real)
* **Firebase Authentication** (Autenticação segura com Google OAuth)
* **Open-Meteo API** (Dados meteorológicos sem necessidade de chave)

### Qualidade & Testes
* **Vitest** (Testes unitários e de integração automatizados)
* **TypeScript Compiler (`tsc`)** (Checagem estática rigorosa de tipos)

---

## 📂 Estrutura do Projeto

```text
├── server.ts                    # Servidor Express com rotas de API (/api/tasks/breakdown) e SSR Vite
├── firestore.rules              # Regras de segurança do Firebase Firestore
├── index.html                   # Ponto de entrada HTML com meta tags e fontes
├── package.json                 # Dependências e scripts do projeto
├── vite.config.ts               # Configuração do Vite e plugins
├── src/
│   ├── App.tsx                  # Componente raiz com orquestração de estado e autenticação
│   ├── main.tsx                 # Inicialização do React DOM
│   ├── index.css                # Configurações globais de CSS, fontes e Tailwind
│   ├── types.ts                 # Interfaces e tipos TypeScript (Task, Subtask, Priority, etc.)
│   ├── components/              # Componentes de interface modulares
│   │   ├── BreakdownModal.tsx   # Modal de pré-visualização de subtarefas geradas pela IA
│   │   ├── CalendarStrip.tsx    # Seletor dinâmico de datas em formato de fita
│   │   ├── Header.tsx           # Barra superior com perfil do usuário e alternador de tema
│   │   ├── TaskCard.tsx         # Cartão individual de exibição da tarefa
│   │   ├── TaskFilters.tsx      # Barra de pesquisa e filtros por status/categoria/prioridade
│   │   ├── TaskForm.tsx         # Formulário com botão "Quebrar com IA"
│   │   ├── TaskList.tsx         # Listagem agrupada e estados vazios (empty state)
│   │   ├── TaskSummary.tsx      # Métricas e contadores de produtividade
│   │   └── ThemeToggle.tsx      # Alternador de tema claro/escuro
│   ├── lib/
│   │   └── firebase.ts          # Inicialização do Firebase Auth e Firestore
│   ├── services/
│   │   ├── aiBreakdownService.ts # Cliente frontend para chamada do serviço de IA
│   │   ├── firestoreService.ts   # Operações de CRUD de tarefas no Firestore
│   │   └── weatherService.ts     # Integração resiliente com a API do Open-Meteo
│   └── utils/
│       ├── date.ts              # Utilitários de formatação de datas em pt-BR
│       ├── taskBreakdown.ts     # Validações e sanitização estrita de subtarefas da IA
│       ├── taskFilters.ts       # Algoritmos de busca, ordenação e filtragem
│       └── validation.ts        # Validações de entradas do usuário
└── tests/                       # Suíte de testes automatizados com Vitest
    ├── aiBreakdownService.test.ts
    ├── date.test.ts
    ├── firebaseErrors.test.ts
    ├── securityRulesCompliance.test.ts
    ├── taskBreakdown.test.ts
    ├── taskFilters.test.ts
    ├── validation.test.ts
    └── weatherService.test.ts
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* **npm** ou gerenciador de pacotes equivalente

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:
```env
# Chave da API do Google Gemini (obrigatória para a função "Quebrar com IA")
GEMINI_API_KEY=sua_chave_aqui

# Porta do servidor (opcional, padrão: 3000)
PORT=3000
```

### 3. Iniciar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em seu navegador através de: `http://localhost:3000`

### 4. Executar os Testes Automatizados
```bash
npm test
```

### 5. Checagem de Tipos e Linter
```bash
npm run lint
```

### 6. Build para Produção
```bash
npm run build
npm start
```

---

## 🛡️ Segurança e Boas Práticas

* **Zero Exposição de Chaves:** A chave `GEMINI_API_KEY` é acessada estritamente no backend (`server.ts`) e nunca é enviada ao navegador.
* **Sanitização de Dados:** Todas as respostas geradas pela IA passam por validação estruturada com schemas estritos e remoção de caracteres de controle antes de serem gravadas no banco de dados.
* **Controle de Acesso (RBAC/Multi-tenant):** As regras do Firestore (`firestore.rules`) garantem isolamento total entre usuários autenticados via `request.auth.uid`.

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de produtividade pessoal.
