# Blue Rise Group - Teste Técnico Front-End

Aplicação SPA para um painel médico, desenvolvida como resolução do desafio técnico da Blue Rise Group. O projeto contempla um fluxo completo de autenticação JWT e um dashboard com listagem de pacientes.

🔗 **Link do Deploy:** https://teste-brh-front.vercel.app/

## 🚀 Tecnologias Utilizadas
- **Core:** React, Vite, TypeScript
- **Roteamento:** React Router DOM (com proteção de rotas privadas)
- **Estado/Fetching:** React Query e Axios (com interceptors para Refresh Token)
- **Formulários:** React Hook Form + Zod
- **Estilização:** Tailwind CSS + Radix UI (simulando shadcn/ui via `clsx` e `tailwind-merge`)
- **Diferenciais Implementados:**
  - Exportação da lista de pacientes para PDF (`jspdf` + `jspdf-autotable`)
  - Simulação de notificação Real-Time (`socket.io-client`)
  - Deploy na Vercel

## 💻 Como rodar o projeto localmente

1. Clone este repositório:
```
bash git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

2. Acesse a pasta do projeto:
```
bash cd blue-rise-medical-panel
```

3. Instale as dependências:
```
bash npm install
```

4. Crie um arquivo `.env` na raiz do projeto e configure as variáveis de ambiente seguindo o arquivo `.env.example`.

5. Inicie o servidor de desenvolvimento:
```
bash npm run dev
```

6. Acesse `http://localhost:5173` no seu navegador.
