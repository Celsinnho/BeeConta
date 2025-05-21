# Documentação de Testes - BeeConta

## Introdução

Este documento descreve os testes iniciais para validar a implementação da Fase 1 do sistema BeeConta, que inclui os módulos de Empresas e Grupos Econômicos, Contas Bancárias Globais e Autenticação/Controle de Acesso.

## Ambiente de Testes

- **URL do Supabase**: https://igkgkyvwymjamexlqyic.supabase.co
- **Repositório**: GitHub - BeeConta (privado)
- **Ambiente**: Desenvolvimento

## Casos de Teste

### 1. Autenticação e Controle de Acesso

#### 1.1 Registro de Usuário
- **Objetivo**: Verificar se um novo usuário pode se registrar no sistema
- **Passos**:
  1. Acessar a página de registro
  2. Preencher nome, sobrenome, email e senha
  3. Submeter o formulário
- **Resultado Esperado**: 
  - Usuário criado no Supabase (tabela auth.users)
  - Registro correspondente criado na tabela `usuarios`
  - Email de confirmação enviado

#### 1.2 Login de Usuário
- **Objetivo**: Verificar se um usuário registrado pode fazer login
- **Passos**:
  1. Acessar a página de login
  2. Preencher email e senha
  3. Submeter o formulário
- **Resultado Esperado**: 
  - Usuário autenticado com sucesso
  - Redirecionamento para dashboard
  - Contexto de autenticação preenchido com dados do usuário

#### 1.3 Login com Google
- **Objetivo**: Verificar se um usuário pode fazer login usando Google
- **Passos**:
  1. Acessar a página de login
  2. Clicar no botão "Entrar com Google"
  3. Completar o fluxo de autenticação do Google
- **Resultado Esperado**: 
  - Usuário autenticado com sucesso
  - Registro criado/atualizado na tabela `usuarios`
  - Redirecionamento para dashboard

#### 1.4 Controle de Acesso a Empresas
- **Objetivo**: Verificar se o controle de acesso a empresas funciona corretamente
- **Passos**:
  1. Fazer login como usuário com acesso a múltiplas empresas
  2. Tentar acessar dados de uma empresa autorizada
  3. Tentar acessar dados de uma empresa não autorizada
- **Resultado Esperado**: 
  - Acesso permitido aos dados da empresa autorizada
  - Acesso negado aos dados da empresa não autorizada

### 2. Empresas e Grupos Econômicos

#### 2.1 Criação de Empresa
- **Objetivo**: Verificar se uma nova empresa pode ser criada
- **Passos**:
  1. Fazer login como usuário válido
  2. Acessar formulário de criação de empresa
  3. Preencher dados da empresa
  4. Submeter o formulário
- **Resultado Esperado**: 
  - Empresa criada na tabela `empresas`
  - Acesso de administrador concedido ao usuário criador
  - Empresa disponível para seleção no seletor de empresas

#### 2.2 Criação de Grupo Econômico
- **Objetivo**: Verificar se um novo grupo econômico pode ser criado
- **Passos**:
  1. Fazer login como usuário válido
  2. Acessar formulário de criação de grupo econômico
  3. Preencher dados do grupo
  4. Submeter o formulário
- **Resultado Esperado**: 
  - Grupo criado na tabela `grupos_economicos`
  - Acesso de administrador concedido ao usuário criador

#### 2.3 Associação de Empresa a Grupo
- **Objetivo**: Verificar se uma empresa pode ser associada a um grupo econômico
- **Passos**:
  1. Fazer login como administrador de um grupo
  2. Acessar gerenciador de empresas do grupo
  3. Adicionar uma empresa ao grupo
- **Resultado Esperado**: 
  - Associação criada na tabela `associacoes_empresa_grupo`
  - Empresa visível na lista de empresas do grupo

#### 2.4 Concessão de Acesso a Usuário
- **Objetivo**: Verificar se um acesso pode ser concedido a outro usuário
- **Passos**:
  1. Fazer login como administrador de uma empresa
  2. Acessar gerenciador de usuários da empresa
  3. Conceder acesso a outro usuário
- **Resultado Esperado**: 
  - Acesso registrado na tabela `acessos_usuario_empresa`
  - Usuário com novo acesso pode visualizar a empresa

### 3. Contas Bancárias Globais

#### 3.1 Criação de Conta Bancária Nacional
- **Objetivo**: Verificar se uma nova conta bancária nacional pode ser criada
- **Passos**:
  1. Fazer login e selecionar uma empresa
  2. Acessar formulário de criação de conta bancária
  3. Preencher dados da conta (banco nacional, moeda BRL)
  4. Submeter o formulário
- **Resultado Esperado**: 
  - Conta criada na tabela `contas_bancarias`
  - Conta visível na lista de contas da empresa

#### 3.2 Criação de Conta Bancária Internacional
- **Objetivo**: Verificar se uma nova conta bancária internacional pode ser criada
- **Passos**:
  1. Fazer login e selecionar uma empresa
  2. Acessar formulário de criação de conta bancária
  3. Preencher dados da conta (banco internacional, moeda estrangeira)
  4. Submeter o formulário
- **Resultado Esperado**: 
  - Conta criada na tabela `contas_bancarias` com flag `internacional = true`
  - Moeda corretamente associada à conta

#### 3.3 Carregamento de Saldo em Conta Internacional
- **Objetivo**: Verificar se o carregamento de saldo funciona corretamente
- **Passos**:
  1. Fazer login e selecionar uma empresa
  2. Acessar uma conta bancária internacional
  3. Registrar um carregamento de saldo (ex: USD 1000 = BRL 5600)
- **Resultado Esperado**: 
  - Carregamento registrado na tabela `carregamentos_saldo`
  - Saldo da conta atualizado
  - Taxa de câmbio registrada corretamente

#### 3.4 Transferência entre Contas com Conversão
- **Objetivo**: Verificar se a transferência entre contas com moedas diferentes funciona
- **Passos**:
  1. Fazer login e selecionar uma empresa
  2. Iniciar transferência de uma conta em BRL para uma conta em USD
  3. Confirmar a transferência
- **Resultado Esperado**: 
  - Transações de saída e entrada registradas nas respectivas contas
  - Conversão de moeda aplicada corretamente
  - Saldos atualizados em ambas as contas

#### 3.5 Consumo de Saldo Carregado
- **Objetivo**: Verificar se o consumo de saldo carregado segue o FIFO
- **Passos**:
  1. Fazer login e selecionar uma empresa
  2. Realizar uma transação em conta internacional com múltiplos carregamentos
- **Resultado Esperado**: 
  - Saldo consumido do carregamento mais antigo primeiro
  - Carregamento marcado como "utilizado" quando saldo chega a zero
  - Valor em moeda original e convertido registrados corretamente

## Validação de Integração

### 1. Fluxo Completo de Usuário Novo
- **Objetivo**: Validar o fluxo completo para um novo usuário
- **Passos**:
  1. Registrar novo usuário
  2. Fazer login
  3. Criar empresa
  4. Criar grupo econômico
  5. Associar empresa ao grupo
  6. Criar conta bancária nacional
  7. Criar conta bancária internacional
  8. Realizar carregamento de saldo
  9. Realizar transferência entre contas
- **Resultado Esperado**: 
  - Todas as operações concluídas com sucesso
  - Dados persistidos corretamente no Supabase
  - Interface reflete o estado atual dos dados

### 2. Validação de Políticas RLS
- **Objetivo**: Verificar se as políticas de segurança RLS estão funcionando
- **Passos**:
  1. Criar dois usuários com empresas diferentes
  2. Tentar acessar dados da empresa do outro usuário
- **Resultado Esperado**: 
  - Acesso negado aos dados de empresas não autorizadas
  - Consultas SQL respeitam as políticas RLS

## Resultados dos Testes

| ID | Teste | Status | Observações |
|----|-------|--------|-------------|
| 1.1 | Registro de Usuário | Pendente | |
| 1.2 | Login de Usuário | Pendente | |
| 1.3 | Login com Google | Pendente | |
| 1.4 | Controle de Acesso a Empresas | Pendente | |
| 2.1 | Criação de Empresa | Pendente | |
| 2.2 | Criação de Grupo Econômico | Pendente | |
| 2.3 | Associação de Empresa a Grupo | Pendente | |
| 2.4 | Concessão de Acesso a Usuário | Pendente | |
| 3.1 | Criação de Conta Bancária Nacional | Pendente | |
| 3.2 | Criação de Conta Bancária Internacional | Pendente | |
| 3.3 | Carregamento de Saldo em Conta Internacional | Pendente | |
| 3.4 | Transferência entre Contas com Conversão | Pendente | |
| 3.5 | Consumo de Saldo Carregado | Pendente | |

## Próximos Passos

1. Executar todos os testes listados
2. Documentar resultados e observações
3. Corrigir eventuais problemas identificados
4. Validar correções com novos testes
5. Preparar ambiente para demonstração ao cliente
