# BeeConta - Sistema Financeiro Multiempresas

Sistema financeiro completo com suporte multiempresas, grupos econômicos, contas bancárias globais, e integração com WhatsApp.

## Visão Geral

BeeConta é uma solução financeira robusta projetada para empresas de diversos portes, oferecendo:

- Gestão multiempresas e grupos econômicos
- Contas bancárias nacionais e internacionais
- Contas a pagar e receber com agendamento e parcelamento
- Cartões de crédito nacionais e internacionais
- Dashboards intuitivos e relatórios personalizáveis
- Integração com WhatsApp para comandos e documentos
- Interface responsiva para desktop e mobile

## Estrutura do Projeto

```
BeeConta/
├── .github/
│   └── workflows/         # CI/CD pipelines
├── docs/                  # Documentação
├── packages/
│   ├── api/               # Backend e APIs
│   ├── web/               # Frontend web
│   ├── mobile/            # Frontend mobile (futuro)
│   └── common/            # Código compartilhado
├── scripts/               # Scripts de automação
└── supabase/              # Configurações do Supabase
    ├── migrations/        # Migrações de banco de dados
    ├── functions/         # Edge Functions
    └── seed/              # Dados iniciais
```

## Tecnologias

- **Backend**: Supabase (PostgreSQL), Edge Functions
- **Frontend**: React, TypeScript
- **Autenticação**: Supabase Auth
- **Armazenamento**: Supabase Storage
- **Realtime**: Supabase Realtime
- **CI/CD**: GitHub Actions

## Configuração de Desenvolvimento

### Pré-requisitos

- Node.js (v16+)
- npm ou yarn
- Git
- Supabase CLI

### Instalação

1. Clone o repositório
   ```
   git clone https://github.com/seu-usuario/BeeConta.git
   cd BeeConta
   ```

2. Instale as dependências
   ```
   npm install
   ```

3. Configure as variáveis de ambiente
   ```
   cp .env.example .env.local
   ```

4. Inicie o servidor de desenvolvimento
   ```
   npm run dev
   ```

## Módulos

- Gestão de Empresas e Grupos Econômicos
- Contas Bancárias com Suporte Global
- Contas a Pagar
- Contas a Receber
- Cartões de Crédito
- Relatórios e Dashboards
- Integração com WhatsApp

## Licença

Privado - Todos os direitos reservados
