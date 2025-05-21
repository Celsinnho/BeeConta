// Arquivo centralizado de tipos para o BeeConta
// Este arquivo serve como fonte única de verdade para todas as interfaces do sistema

// Tipos relacionados a usuários
export interface Usuario {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  nome_exibicao?: string;
  url_avatar?: string;
  empresa_padrao_id?: string;
  admin_sistema: boolean;
}

// Tipos relacionados a empresas
export interface Empresa {
  id?: string;
  nome: string;
  nome_fantasia?: string;
  cnpj_cpf: string;
  tipo_documento: 'CNPJ' | 'CPF' | 'ESTRANGEIRO';
  regime_tributario?: 'SIMPLES' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';
  url_logo?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    pais?: string;
    cep?: string;
  };
  contato?: {
    email?: string;
    telefone?: string;
    website?: string;
    nome_contato?: string;
  };
  status: 'ativo' | 'inativo' | 'pendente';
  data_criacao?: string;
  data_atualizacao?: string;
  empresa_principal?: boolean;
}

// Tipos relacionados a grupos econômicos
export interface GrupoEconomico {
  id?: string;
  nome: string;
  descricao?: string;
  url_logo?: string;
  status: 'ativo' | 'inativo';
  data_criacao?: string;
  data_atualizacao?: string;
}

export interface AssociacaoEmpresaGrupo {
  grupo_id: string;
  empresa_id: string;
  empresa_principal: boolean;
  status: 'ativo' | 'inativo';
  data_criacao?: string;
  data_atualizacao?: string;
  empresa?: Empresa;
}

// Tipos relacionados a contas bancárias
export interface ContaBancaria {
  id?: string;
  empresa_id: string;
  banco_id: string;
  agencia: string;
  conta: string;
  digito?: string;
  tipo_conta: 'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO' | 'PAGAMENTO';
  descricao: string;
  saldo_inicial: number;
  data_saldo_inicial: string;
  moeda_id: string;
  status: 'ativa' | 'inativa' | 'encerrada';
  data_criacao?: string;
  data_atualizacao?: string;
  banco?: Banco;
  moeda?: Moeda;
}

// Tipos relacionados a bancos
export interface Banco {
  id: string;
  codigo: string;
  nome: string;
  url_logo?: string;
  pais: string;
  status: 'ativo' | 'inativo';
}

// Tipos relacionados a moedas
export interface Moeda {
  id: string;
  codigo: string;
  nome: string;
  simbolo: string;
  pais: string;
  status: 'ativa' | 'inativa';
}

// Tipos relacionados a cartões de crédito
export interface CartaoCredito {
  id?: string;
  empresa_id: string;
  banco_id?: string;
  descricao: string;
  bandeira: string;
  ultimos_digitos: string;
  nome_titular: string;
  data_fechamento: number;
  data_vencimento: number;
  limite: number;
  moeda_id: string;
  internacional: boolean;
  status: 'ativo' | 'inativo' | 'bloqueado' | 'cancelado';
  data_criacao?: string;
  data_atualizacao?: string;
  banco?: Banco;
  moeda?: Moeda;
}

// Tipos relacionados a transações financeiras
export interface Transacao {
  id?: string;
  empresa_id: string;
  tipo: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA';
  descricao: string;
  valor: number;
  data_transacao: string;
  data_competencia?: string;
  conta_bancaria_id?: string;
  cartao_credito_id?: string;
  categoria_id?: string;
  status: 'pendente' | 'efetivada' | 'cancelada';
  recorrente: boolean;
  parcela_atual?: number;
  total_parcelas?: number;
  transacao_pai_id?: string;
  observacoes?: string;
  anexos?: string[];
  data_criacao?: string;
  data_atualizacao?: string;
  conta_bancaria?: ContaBancaria;
  cartao_credito?: CartaoCredito;
  categoria?: Categoria;
}

// Tipos relacionados a categorias
export interface Categoria {
  id?: string;
  empresa_id?: string;
  nome: string;
  tipo: 'RECEITA' | 'DESPESA' | 'AMBOS';
  cor?: string;
  icone?: string;
  categoria_pai_id?: string;
  status: 'ativa' | 'inativa';
  data_criacao?: string;
  data_atualizacao?: string;
  categoria_pai?: Categoria;
}

// Tipos para respostas de API
export interface RespostaAPI<T> {
  data?: T;
  error?: Error;
}

// Tipos para acessos e permissões
export interface AcessoUsuarioEmpresa {
  usuario_id: string;
  empresa_id: string;
  nivel_acesso: 'ADMIN' | 'EDITOR' | 'VISUALIZADOR';
  status: 'ativo' | 'inativo' | 'pendente';
  data_criacao?: string;
  data_atualizacao?: string;
  empresas?: Empresa;
}

export interface AcessoUsuarioGrupo {
  usuario_id: string;
  grupo_id: string;
  nivel_acesso: 'ADMIN' | 'EDITOR' | 'VISUALIZADOR';
  status: 'ativo' | 'inativo' | 'pendente';
  data_criacao?: string;
  data_atualizacao?: string;
  grupos_economicos?: GrupoEconomico;
}

// Tipos para relatórios e dashboards
export interface ResumoFinanceiro {
  saldo_total: number;
  receitas_mes_atual: number;
  despesas_mes_atual: number;
  saldo_mes_atual: number;
  receitas_mes_anterior: number;
  despesas_mes_anterior: number;
  saldo_mes_anterior: number;
  variacao_receitas: number;
  variacao_despesas: number;
  variacao_saldo: number;
}

export interface FluxoCaixa {
  data: string;
  saldo_inicial: number;
  receitas: number;
  despesas: number;
  saldo_final: number;
}
