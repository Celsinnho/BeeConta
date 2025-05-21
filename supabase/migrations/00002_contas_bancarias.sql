-- Tabela de moedas
CREATE TABLE moedas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(10) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  simbolo VARCHAR(10) NOT NULL,
  decimal_places INTEGER NOT NULL DEFAULT 2,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para moedas
CREATE INDEX idx_moedas_codigo ON moedas(codigo);
CREATE UNIQUE INDEX idx_moedas_codigo_unico ON moedas(codigo) WHERE ativo = TRUE;

-- Tabela de taxas de câmbio
CREATE TABLE taxas_cambio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moeda_origem VARCHAR(10) NOT NULL,
  moeda_destino VARCHAR(10) NOT NULL,
  taxa DECIMAL(19, 6) NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fonte VARCHAR(100),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para taxas de câmbio
CREATE INDEX idx_taxas_cambio_moedas ON taxas_cambio(moeda_origem, moeda_destino);
CREATE INDEX idx_taxas_cambio_data ON taxas_cambio(data_hora);

-- Tabela de bancos
CREATE TABLE bancos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(20),
  nome VARCHAR(100) NOT NULL,
  pais VARCHAR(2) NOT NULL,
  url_logo TEXT,
  suporta_api BOOLEAN DEFAULT FALSE,
  configuracao_api JSONB,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para bancos
CREATE INDEX idx_bancos_codigo ON bancos(codigo);
CREATE INDEX idx_bancos_nome ON bancos(nome);
CREATE INDEX idx_bancos_pais ON bancos(pais);

-- Tabela de contas bancárias
CREATE TABLE contas_bancarias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) NOT NULL,
  banco_id UUID REFERENCES bancos(id) NOT NULL,
  tipo_conta VARCHAR(30) NOT NULL,
  numero_conta VARCHAR(30) NOT NULL,
  digito_conta VARCHAR(5),
  agencia VARCHAR(20),
  digito_agencia VARCHAR(5),
  descricao VARCHAR(100),
  moeda_codigo VARCHAR(10) NOT NULL,
  saldo_atual DECIMAL(19, 6) DEFAULT 0,
  saldo_disponivel DECIMAL(19, 6) DEFAULT 0,
  limite DECIMAL(19, 6) DEFAULT 0,
  data_saldo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  internacional BOOLEAN DEFAULT FALSE,
  iban VARCHAR(50),
  swift VARCHAR(20),
  routing_number VARCHAR(20),
  dados_adicionais JSONB,
  configuracoes JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para contas bancárias
CREATE INDEX idx_contas_bancarias_empresa ON contas_bancarias(empresa_id);
CREATE INDEX idx_contas_bancarias_banco ON contas_bancarias(banco_id);
CREATE INDEX idx_contas_bancarias_moeda ON contas_bancarias(moeda_codigo);
CREATE INDEX idx_contas_bancarias_status ON contas_bancarias(status);
CREATE INDEX idx_contas_bancarias_internacional ON contas_bancarias(internacional);

-- Tabela de carregamentos de saldo (para contas internacionais)
CREATE TABLE carregamentos_saldo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conta_bancaria_id UUID REFERENCES contas_bancarias(id) NOT NULL,
  valor_original DECIMAL(19, 6) NOT NULL,
  moeda_original VARCHAR(10) NOT NULL,
  valor_convertido DECIMAL(19, 6) NOT NULL,
  moeda_convertida VARCHAR(10) NOT NULL,
  taxa_cambio DECIMAL(19, 6) NOT NULL,
  data_carregamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  saldo_restante DECIMAL(19, 6) NOT NULL,
  descricao TEXT,
  comprovante_url TEXT,
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para carregamentos de saldo
CREATE INDEX idx_carregamentos_conta ON carregamentos_saldo(conta_bancaria_id);
CREATE INDEX idx_carregamentos_data ON carregamentos_saldo(data_carregamento);
CREATE INDEX idx_carregamentos_status ON carregamentos_saldo(status);

-- Tabela de transações bancárias
CREATE TABLE transacoes_bancarias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conta_bancaria_id UUID REFERENCES contas_bancarias(id) NOT NULL,
  tipo_transacao VARCHAR(30) NOT NULL,
  valor DECIMAL(19, 6) NOT NULL,
  valor_original DECIMAL(19, 6),
  moeda_original VARCHAR(10),
  taxa_cambio DECIMAL(19, 6),
  data_transacao TIMESTAMP WITH TIME ZONE NOT NULL,
  data_compensacao TIMESTAMP WITH TIME ZONE,
  descricao TEXT,
  categoria VARCHAR(50),
  referencia_externa VARCHAR(100),
  contraparte JSONB,
  carregamento_id UUID REFERENCES carregamentos_saldo(id),
  comprovante_url TEXT,
  anexos JSONB,
  dados_adicionais JSONB,
  status VARCHAR(20) DEFAULT 'pendente',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para transações bancárias
CREATE INDEX idx_transacoes_conta ON transacoes_bancarias(conta_bancaria_id);
CREATE INDEX idx_transacoes_data ON transacoes_bancarias(data_transacao);
CREATE INDEX idx_transacoes_tipo ON transacoes_bancarias(tipo_transacao);
CREATE INDEX idx_transacoes_status ON transacoes_bancarias(status);
CREATE INDEX idx_transacoes_carregamento ON transacoes_bancarias(carregamento_id);

-- Tabela de cartões de crédito
CREATE TABLE cartoes_credito (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) NOT NULL,
  conta_bancaria_id UUID REFERENCES contas_bancarias(id),
  tipo_cartao VARCHAR(30) NOT NULL,
  bandeira VARCHAR(30) NOT NULL,
  ultimos_digitos VARCHAR(4) NOT NULL,
  nome_titular VARCHAR(100) NOT NULL,
  data_validade DATE NOT NULL,
  limite_total DECIMAL(19, 6) NOT NULL,
  limite_disponivel DECIMAL(19, 6) NOT NULL,
  dia_fechamento INTEGER NOT NULL,
  dia_vencimento INTEGER NOT NULL,
  moeda_codigo VARCHAR(10) NOT NULL,
  internacional BOOLEAN DEFAULT FALSE,
  virtual BOOLEAN DEFAULT FALSE,
  dados_adicionais JSONB,
  configuracoes JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para cartões de crédito
CREATE INDEX idx_cartoes_empresa ON cartoes_credito(empresa_id);
CREATE INDEX idx_cartoes_conta ON cartoes_credito(conta_bancaria_id);
CREATE INDEX idx_cartoes_moeda ON cartoes_credito(moeda_codigo);
CREATE INDEX idx_cartoes_status ON cartoes_credito(status);
CREATE INDEX idx_cartoes_internacional ON cartoes_credito(internacional);

-- Tabela de faturas de cartão
CREATE TABLE faturas_cartao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cartao_id UUID REFERENCES cartoes_credito(id) NOT NULL,
  data_fechamento DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  valor_total DECIMAL(19, 6) NOT NULL,
  valor_pago DECIMAL(19, 6) DEFAULT 0,
  valor_minimo DECIMAL(19, 6),
  status VARCHAR(20) DEFAULT 'aberta',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para faturas de cartão
CREATE INDEX idx_faturas_cartao ON faturas_cartao(cartao_id);
CREATE INDEX idx_faturas_vencimento ON faturas_cartao(data_vencimento);
CREATE INDEX idx_faturas_status ON faturas_cartao(status);

-- Tabela de transações de cartão
CREATE TABLE transacoes_cartao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cartao_id UUID REFERENCES cartoes_credito(id) NOT NULL,
  fatura_id UUID REFERENCES faturas_cartao(id),
  data_transacao TIMESTAMP WITH TIME ZONE NOT NULL,
  valor DECIMAL(19, 6) NOT NULL,
  valor_original DECIMAL(19, 6),
  moeda_original VARCHAR(10),
  taxa_cambio DECIMAL(19, 6),
  descricao TEXT NOT NULL,
  estabelecimento VARCHAR(100),
  categoria VARCHAR(50),
  parcelas INTEGER DEFAULT 1,
  numero_parcela INTEGER DEFAULT 1,
  referencia_externa VARCHAR(100),
  comprovante_url TEXT,
  dados_adicionais JSONB,
  status VARCHAR(20) DEFAULT 'pendente',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para transações de cartão
CREATE INDEX idx_transacoes_cartao_cartao ON transacoes_cartao(cartao_id);
CREATE INDEX idx_transacoes_cartao_fatura ON transacoes_cartao(fatura_id);
CREATE INDEX idx_transacoes_cartao_data ON transacoes_cartao(data_transacao);
CREATE INDEX idx_transacoes_cartao_status ON transacoes_cartao(status);

-- Aplicar trigger de atualização de timestamp
CREATE TRIGGER set_timestamp_moedas
BEFORE UPDATE ON moedas
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_taxas_cambio
BEFORE UPDATE ON taxas_cambio
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_bancos
BEFORE UPDATE ON bancos
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_contas_bancarias
BEFORE UPDATE ON contas_bancarias
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_carregamentos_saldo
BEFORE UPDATE ON carregamentos_saldo
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_transacoes_bancarias
BEFORE UPDATE ON transacoes_bancarias
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_cartoes_credito
BEFORE UPDATE ON cartoes_credito
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_faturas_cartao
BEFORE UPDATE ON faturas_cartao
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_transacoes_cartao
BEFORE UPDATE ON transacoes_cartao
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

-- Habilitar RLS em todas as tabelas
ALTER TABLE moedas ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxas_cambio ENABLE ROW LEVEL SECURITY;
ALTER TABLE bancos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE carregamentos_saldo ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas_cartao ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes_cartao ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para contas_bancarias
CREATE POLICY "Usuários podem visualizar contas bancárias das empresas às quais têm acesso" ON contas_bancarias
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM acessos_usuario_empresa
      WHERE usuario_id = auth.uid()
      AND empresa_id = contas_bancarias.empresa_id
      AND status = 'ativo'
    )
    OR
    EXISTS (
      SELECT 1 FROM acessos_usuario_grupo ug
      JOIN associacoes_empresa_grupo eg ON ug.grupo_id = eg.grupo_id
      WHERE ug.usuario_id = auth.uid()
      AND eg.empresa_id = contas_bancarias.empresa_id
      AND ug.status = 'ativo'
      AND eg.status = 'ativo'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND admin_sistema = true
    )
  );

-- Inserir moedas padrão
INSERT INTO moedas (codigo, nome, simbolo, decimal_places)
VALUES 
  ('BRL', 'Real Brasileiro', 'R$', 2),
  ('USD', 'Dólar Americano', '$', 2),
  ('EUR', 'Euro', '€', 2),
  ('GBP', 'Libra Esterlina', '£', 2),
  ('JPY', 'Iene Japonês', '¥', 0),
  ('CAD', 'Dólar Canadense', 'C$', 2),
  ('AUD', 'Dólar Australiano', 'A$', 2),
  ('CHF', 'Franco Suíço', 'Fr', 2),
  ('CNY', 'Yuan Chinês', '¥', 2),
  ('ARS', 'Peso Argentino', '$', 2);

-- Inserir bancos brasileiros comuns
INSERT INTO bancos (codigo, nome, pais, suporta_api)
VALUES 
  ('001', 'Banco do Brasil', 'BR', false),
  ('104', 'Caixa Econômica Federal', 'BR', false),
  ('033', 'Santander', 'BR', false),
  ('341', 'Itaú', 'BR', false),
  ('237', 'Bradesco', 'BR', false),
  ('260', 'Nubank', 'BR', false),
  ('336', 'C6 Bank', 'BR', false),
  ('077', 'Inter', 'BR', false),
  ('655', 'Votorantim', 'BR', false),
  ('212', 'Banco Original', 'BR', false),
  ('748', 'Sicoob', 'BR', false),
  ('756', 'Sicoob Confederação', 'BR', false),
  ('000', 'Conta Simples', 'BR', false);

-- Inserir bancos internacionais comuns
INSERT INTO bancos (codigo, nome, pais, suporta_api)
VALUES 
  ('CHASUS33', 'JPMorgan Chase', 'US', false),
  ('BOFAUS3N', 'Bank of America', 'US', false),
  ('WFBIUS6S', 'Wells Fargo', 'US', false),
  ('CITIUS33', 'Citibank', 'US', false),
  ('HSBCUS33', 'HSBC USA', 'US', false),
  ('BARCGB22', 'Barclays Bank', 'GB', false),
  ('DEUTDEFF', 'Deutsche Bank', 'DE', false),
  ('BNPAFRPP', 'BNP Paribas', 'FR', false),
  ('MIDLGB22', 'HSBC UK', 'GB', false),
  ('NWBKGB2L', 'NatWest', 'GB', false),
  ('TRWIGB22', 'Wise (TransferWise)', 'GB', false),
  ('REVOGB21', 'Revolut', 'GB', false),
  ('PYPLGB2L', 'PayPal UK', 'GB', false);
