-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de empresas
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  trading_name VARCHAR(100),
  document_number VARCHAR(20) NOT NULL,
  document_type VARCHAR(10) NOT NULL,
  tax_regime VARCHAR(30),
  address JSONB,
  contact_info JSONB,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  fiscal_info JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Índices para empresas
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_document ON companies(document_number);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_settings ON companies USING GIN (settings);

-- Tabela de grupos econômicos
CREATE TABLE economic_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Índices para grupos econômicos
CREATE INDEX idx_economic_groups_name ON economic_groups(name);
CREATE INDEX idx_economic_groups_status ON economic_groups(status);

-- Tabela de associação entre empresas e grupos
CREATE TABLE company_group_associations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  group_id UUID REFERENCES economic_groups(id) NOT NULL,
  is_main_company BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Índices para associações
CREATE INDEX idx_company_group_company ON company_group_associations(company_id);
CREATE INDEX idx_company_group_group ON company_group_associations(group_id);
CREATE INDEX idx_company_group_main ON company_group_associations(is_main_company);
CREATE UNIQUE INDEX idx_company_group_unique ON company_group_associations(company_id, group_id) WHERE status = 'active';

-- Tabela de usuários estendida do auth.users do Supabase
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(20),
  default_company_id UUID REFERENCES companies(id),
  is_admin BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para usuários
CREATE INDEX idx_users_name ON users(first_name, last_name);
CREATE INDEX idx_users_default_company ON users(default_company_id);
CREATE INDEX idx_users_status ON users(status);

-- Tabela de acesso de usuários a empresas
CREATE TABLE user_company_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  access_level VARCHAR(20) NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Índices para acesso de usuários a empresas
CREATE INDEX idx_user_company_user ON user_company_access(user_id);
CREATE INDEX idx_user_company_company ON user_company_access(company_id);
CREATE INDEX idx_user_company_status ON user_company_access(status);
CREATE UNIQUE INDEX idx_user_company_unique ON user_company_access(user_id, company_id) WHERE status = 'active';

-- Tabela de acesso de usuários a grupos
CREATE TABLE user_group_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  group_id UUID REFERENCES economic_groups(id) NOT NULL,
  access_level VARCHAR(20) NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Índices para acesso de usuários a grupos
CREATE INDEX idx_user_group_user ON user_group_access(user_id);
CREATE INDEX idx_user_group_group ON user_group_access(group_id);
CREATE INDEX idx_user_group_status ON user_group_access(status);
CREATE UNIQUE INDEX idx_user_group_unique ON user_group_access(user_id, group_id) WHERE status = 'active';

-- Trigger para atualizar timestamp de modificação
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas as tabelas principais
CREATE TRIGGER set_timestamp_companies
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_economic_groups
BEFORE UPDATE ON economic_groups
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_company_group_associations
BEFORE UPDATE ON company_group_associations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_user_company_access
BEFORE UPDATE ON user_company_access
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_user_group_access
BEFORE UPDATE ON user_group_access
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Trigger para criar automaticamente o registro na tabela users após criação no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, first_name, last_name, display_name)
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
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_group_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_company_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_access ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para companies
CREATE POLICY "Users can view companies they have access to" ON companies
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_company_access 
      WHERE company_id = companies.id AND status = 'active'
    )
    OR
    auth.uid() IN (
      SELECT user_id FROM user_group_access ug
      JOIN company_group_associations cg ON ug.group_id = cg.group_id
      WHERE cg.company_id = companies.id AND ug.status = 'active' AND cg.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Users can insert companies if they are admins" ON companies
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Users can update companies they have admin access to" ON companies
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_company_access 
      WHERE company_id = companies.id AND status = 'active' AND access_level = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Políticas RLS para economic_groups
CREATE POLICY "Users can view economic groups they have access to" ON economic_groups
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_group_access 
      WHERE group_id = economic_groups.id AND status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Políticas similares para outras tabelas seguiriam o mesmo padrão
