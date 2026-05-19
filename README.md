# Finance Campos — Dashboard Financeiro

> Finance Campos é uma plataforma moderna de controle financeiro pessoal, desenvolvida com foco em design dark mode, usabilidade e segurança de dados. A aplicação permite gerenciar receitas, despesas e acompanhar métricas financeiras em tempo real por meio de uma interface fluida e profissional.

🔗 **Deploy:** [finance-dashboard-eta-lake.vercel.app](https://finance-dashboard-eta-lake.vercel.app)

---

## 🚀 Funcionalidades

* **Autenticação Segura** — Login e cadastro integrados ao Supabase Auth; cada usuário acessa apenas o próprio painel.
* **Row Level Security (RLS)** — Políticas de segurança a nível de linha no PostgreSQL garantem isolamento total entre os dados de diferentes usuários.
* **Dashboard Visual Dinâmico** — Gráficos interativos (Recharts) com evolução financeira dos últimos 6 meses e distribuição de gastos por categoria.
* **Gestão de Transações** — Adição e exclusão de receitas e despesas com categorização e filtros por período.
* **Design Dark Premium** — Interface responsiva e elegante construída sobre o ecossistema Material UI (MUI).

---

## 🛠️ Tecnologias

| Camada | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **Front-end** | React.js | Construção da interface |
| **Front-end** | Material UI (MUI) | Componentes e sistema de design |
| **Front-end** | Recharts | Gráficos e visualizações |
| **Front-end** | Context API + useReducer | Gerenciamento de estado global |
| **Back-end / BaaS** | Supabase | Autenticação e infraestrutura em nuvem |
| **Banco de Dados** | PostgreSQL | Persistência relacional das transações |

---

## 📝 Sobre o Projeto

Desenvolvido como projeto pessoal para estudo de React com MUI, integração com Supabase e boas práticas de segurança em aplicações financeiras.