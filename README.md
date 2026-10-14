# Blue Rise Medical Panel

Aplicação SPA para um painel médico, desenvolvida como resolução do desafio técnico front-end da Blue Rise Group. Contempla um fluxo completo de autenticação JWT (login, cadastro e refresh token) e um dashboard com listagem de pacientes.

🔗 **Deploy:** https://teste-brh-front.vercel.app/

## ✨ Funcionalidades

- Cadastro e login com autenticação JWT
- Renovação automática de sessão via refresh token (interceptors do Axios)
- Rotas privadas protegidas
- Dashboard com listagem de pacientes
- Exportação da lista de pacientes para PDF
- Simulação de notificação em tempo real

## 🚀 Tecnologias utilizadas

- **Core:** React, Vite, TypeScript
- **Roteamento:** React Router DOM (com proteção de rotas privadas)
- **Estado/Fetching:** React Query e Axios (com interceptors para Refresh Token)
- **Formulários:** React Hook Form + Zod
- **Estilização:** Tailwind CSS + Radix UI (padrão shadcn/ui via `clsx` e `tailwind-merge`)
- **Diferenciais:**
  - Exportação para PDF (`jspdf` + `jspdf-autotable`)
  - Notificação em tempo real simulada (`socket.io-client`)
  - Deploy na Vercel

## 📁 Estrutura

O código da aplicação fica na pasta `blue-rise-medical-panel`:

```
blue-rise-medical-panel/
├── src/
│   ├── components/   # PrivateRoute e componentes compartilhados
│   ├── lib/          # utilitários
│   ├── pages/        # Login, Register e Dashboard
│   └── services/     # cliente Axios e chamadas à API
└── .env.example      # variáveis de ambiente necessárias
```

## 💻 Como rodar localmente

1. Clone o repositório:

```bash
git clone https://github.com/zielbinho/teste-brh-front.git
```

2. Acesse a pasta do projeto:

```bash
cd teste-brh-front/blue-rise-medical-panel
```

3. Instale as dependências:

```bash
npm install
```

4. Crie um arquivo `.env` na raiz da pasta do projeto, a partir do `.env.example`:

```env
VITE_API_URL=url da api
VITE_API_KEY=chave da api
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

6. Acesse `http://localhost:5173` no navegador.

## 📜 Scripts

| Comando           | O que faz                          |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento |
| `npm run build`   | Verifica os tipos e gera o build     |
| `npm run preview` | Serve o build localmente             |
| `npm run lint`    | Roda o ESLint                        |
