-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de empresas
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  nome_fantasia VARCHAR(100),
  numero_documento VARCHAR(20) NOT NULL,
  tipo_documento VARCHAR(10) NOT NULL,
  regime_tributario VARCHAR(30),
  endereco JSONB,
  informacoes_contato JSONB,
  url_logo TEXT,
  configuracoes JSONB DEFAULT '{}'::jsonb,
  informacoes_fiscais JSONB,
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para empresas
CREATE INDEX idx_empresas_nome ON empresas(nome);
CREATE INDEX idx_empresas_documento ON empresas(numero_documento);
CREATE INDEX idx_empresas_status ON empresas(status);
CREATE INDEX idx_empresas_configuracoes ON empresas USING GIN (configuracoes);

-- Tabela de grupos econômicos
CREATE TABLE grupos_economicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  url_logo TEXT,
  configuracoes JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para grupos econômicos
CREATE INDEX idx_grupos_economicos_nome ON grupos_economicos(nome);
CREATE INDEX idx_grupos_economicos_status ON grupos_economicos(status);

-- Tabela de associação entre empresas e grupos
CREATE TABLE associacoes_empresa_grupo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) NOT NULL,
  grupo_id UUID REFERENCES grupos_economicos(id) NOT NULL,
  empresa_principal BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para associações
CREATE INDEX idx_associacoes_empresa ON associacoes_empresa_grupo(empresa_id);
CREATE INDEX idx_associacoes_grupo ON associacoes_empresa_grupo(grupo_id);
CREATE INDEX idx_associacoes_principal ON associacoes_empresa_grupo(empresa_principal);
CREATE UNIQUE INDEX idx_associacoes_unico ON associacoes_empresa_grupo(empresa_id, grupo_id) WHERE status = 'ativo';

-- Tabela de usuários estendida do auth.users do Supabase
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users,
  nome VARCHAR(100) NOT NULL,
  sobrenome VARCHAR(100) NOT NULL,
  nome_exibicao VARCHAR(100),
  url_avatar TEXT,
  telefone VARCHAR(20),
  empresa_padrao_id UUID REFERENCES empresas(id),
  admin_sistema BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'ativo',
  preferencias JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para usuários
CREATE INDEX idx_usuarios_nome ON usuarios(nome, sobrenome);
CREATE INDEX idx_usuarios_empresa_padrao ON usuarios(empresa_padrao_id);
CREATE INDEX idx_usuarios_status ON usuarios(status);

-- Tabela de acesso de usuários a empresas
CREATE TABLE acessos_usuario_empresa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) NOT NULL,
  empresa_id UUID REFERENCES empresas(id) NOT NULL,
  nivel_acesso VARCHAR(20) NOT NULL,
  permissoes JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID REFERENCES usuarios(id),
  atualizado_por UUID REFERENCES usuarios(id)
);

-- Índices para acesso de usuários a empresas
CREATE INDEX idx_acessos_usuario_empresa_usuario ON acessos_usuario_empresa(usuario_id);
CREATE INDEX idx_acessos_usuario_empresa_empresa ON acessos_usuario_empresa(empresa_id);
CREATE INDEX idx_acessos_usuario_empresa_status ON acessos_usuario_empresa(status);
CREATE UNIQUE INDEX idx_acessos_usuario_empresa_unico ON acessos_usuario_empresa(usuario_id, empresa_id) WHERE status = 'ativo';

-- Tabela de acesso de usuários a grupos
CREATE TABLE acessos_usuario_grupo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) NOT NULL,
  grupo_id UUID REFERENCES grupos_economicos(id) NOT NULL,
  nivel_acesso VARCHAR(20) NOT NULL,
  permissoes JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID REFERENCES usuarios(id),
  atualizado_por UUID REFERENCES usuarios(id)
);

-- Índices para acesso de usuários a grupos
CREATE INDEX idx_acessos_usuario_grupo_usuario ON acessos_usuario_grupo(usuario_id);
CREATE INDEX idx_acessos_usuario_grupo_grupo ON acessos_usuario_grupo(grupo_id);
CREATE INDEX idx_acessos_usuario_grupo_status ON acessos_usuario_grupo(status);
CREATE UNIQUE INDEX idx_acessos_usuario_grupo_unico ON acessos_usuario_grupo(usuario_id, grupo_id) WHERE status = 'ativo';

-- Trigger para atualizar timestamp de modificação
CREATE OR REPLACE FUNCTION atualizar_coluna_modificacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas as tabelas principais
CREATE TRIGGER set_timestamp_empresas
BEFORE UPDATE ON empresas
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_grupos_economicos
BEFORE UPDATE ON grupos_economicos
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_associacoes_empresa_grupo
BEFORE UPDATE ON associacoes_empresa_grupo
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_acessos_usuario_empresa
BEFORE UPDATE ON acessos_usuario_empresa
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

CREATE TRIGGER set_timestamp_acessos_usuario_grupo
BEFORE UPDATE ON acessos_usuario_grupo
FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_modificacao();

-- Trigger para criar automaticamente o registro na tabela usuarios após criação no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, sobrenome, nome_exibicao)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos_economicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE associacoes_empresa_grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE acessos_usuario_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE acessos_usuario_grupo ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para empresas
CREATE POLICY "Usuários podem visualizar empresas às quais têm acesso" ON empresas
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT usuario_id FROM acessos_usuario_empresa 
      WHERE empresa_id = empresas.id AND status = 'ativo'
    )
    OR
    auth.uid() IN (
      SELECT usuario_id FROM acessos_usuario_grupo ug
      JOIN associacoes_empresa_grupo eg ON ug.grupo_id = eg.grupo_id
      WHERE eg.empresa_id = empresas.id AND ug.status = 'ativo' AND eg.status = 'ativo'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND admin_sistema = true
    )
  );

CREATE POLICY "Usuários podem inserir empresas se forem administradores" ON empresas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND admin_sistema = true
    )
  );

CREATE POLICY "Usuários podem atualizar empresas às quais têm acesso de administrador" ON empresas
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT usuario_id FROM acessos_usuario_empresa 
      WHERE empresa_id = empresas.id AND status = 'ativo' AND nivel_acesso = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND admin_sistema = true
    )
  );

-- Políticas RLS para grupos_economicos
CREATE POLICY "Usuários podem visualizar grupos econômicos aos quais têm acesso" ON grupos_economicos
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT usuario_id FROM acessos_usuario_grupo 
      WHERE grupo_id = grupos_economicos.id AND status = 'ativo'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND admin_sistema = true
    )
  );

-- Políticas similares para outras tabelas seguiriam o mesmo padrão
