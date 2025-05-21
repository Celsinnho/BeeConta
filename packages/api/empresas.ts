import { supabaseClient, supabaseAdmin } from './supabase';
import { Empresa, GrupoEconomico, AssociacaoEmpresaGrupo, RespostaAPI } from './tipos';

// Re-exportar tipos para uso no frontend
export type { Empresa, GrupoEconomico, AssociacaoEmpresaGrupo } from './tipos';

// Interfaces para tipagem dos resultados do Supabase
interface AcessoUsuarioEmpresaResult {
  empresa_id: string;
  empresas?: Empresa | Empresa[] | null;
}

interface AcessoUsuarioGrupoResult {
  grupo_id: string;
}

interface AssociacaoEmpresaGrupoResult {
  grupo_id: string;
  empresa_id: string;
  empresa_principal: boolean;
  status: string;
  empresa?: Empresa | Empresa[] | null;
}

// Função auxiliar para processar empresas retornadas pelo Supabase
function processarEmpresaResult(empresaData: any): Empresa | null {
  // Verificar se é um objeto válido
  if (!empresaData || typeof empresaData !== 'object') {
    return null;
  }
  
  // Verificar se é um array (caso em que precisamos pegar o primeiro item)
  if (Array.isArray(empresaData)) {
    if (empresaData.length === 0) {
      return null;
    }
    return processarEmpresaResult(empresaData[0]);
  }
  
  // Verificar se tem as propriedades necessárias
  if (!('id' in empresaData) || !('nome' in empresaData)) {
    return null;
  }
  
  // Retornar como Empresa
  return empresaData as Empresa;
}

// Função auxiliar para processar associações empresa-grupo retornadas pelo Supabase
function processarAssociacaoEmpresaGrupoResult(associacaoData: any): AssociacaoEmpresaGrupo | null {
  // Verificar se é um objeto válido
  if (!associacaoData || typeof associacaoData !== 'object') {
    return null;
  }
  
  // Verificar se tem as propriedades necessárias
  if (!('grupo_id' in associacaoData) || !('empresa_id' in associacaoData)) {
    return null;
  }
  
  // Processar empresa se existir
  let empresa: Empresa | null = null;
  if ('empresa' in associacaoData) {
    empresa = processarEmpresaResult(associacaoData.empresa);
  }
  
  // Retornar como AssociacaoEmpresaGrupo
  return {
    grupo_id: associacaoData.grupo_id,
    empresa_id: associacaoData.empresa_id,
    empresa_principal: associacaoData.empresa_principal || false,
    status: associacaoData.status || 'ativo',
    empresa: empresa as Empresa
  };
}

// Serviço para gerenciamento de empresas
export const ServicoEmpresa = {
  // Obter empresa por ID
  obterPorId: async (empresaId: string): Promise<RespostaAPI<Empresa>> => {
    try {
      const { data, error } = await supabaseClient
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .eq('status', 'ativo')
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao obter empresa:', error);
      return { error: error as Error };
    }
  },
  
  // Listar empresas do usuário (acesso direto + via grupos)
  listarEmpresasUsuario: async (usuarioId: string): Promise<RespostaAPI<Empresa[]>> => {
    try {
      // Obter empresas com acesso direto
      const { data: acessosDiretos, error: erroDireto } = await supabaseClient
        .from('acessos_usuario_empresa')
        .select(`
          empresa_id,
          empresas:empresa_id (
            id,
            nome,
            nome_fantasia,
            url_logo,
            status,
            cnpj_cpf,
            tipo_documento
          )
        `)
        .eq('usuario_id', usuarioId)
        .eq('status', 'ativo')
        .eq('empresas.status', 'ativo');
      
      if (erroDireto) throw erroDireto;
      
      // Extrair empresas diretas
      const empresasDiretas: Empresa[] = [];
      if (acessosDiretos) {
        acessosDiretos.forEach((acesso: any) => {
          const empresa = processarEmpresaResult(acesso.empresas);
          if (empresa) {
            empresasDiretas.push(empresa);
          }
        });
      }
      
      // Obter empresas via grupos econômicos
      const { data: acessosGrupos, error: erroGrupo } = await supabaseClient
        .from('acessos_usuario_grupo')
        .select(`
          grupo_id
        `)
        .eq('usuario_id', usuarioId)
        .eq('status', 'ativo');
      
      if (erroGrupo) throw erroGrupo;
      
      // Extrair IDs de empresas diretas para evitar duplicatas
      const idsEmpresasDiretas = new Set(empresasDiretas.map(empresa => empresa.id));
      
      // Extrair empresas dos grupos
      const empresasGrupos: Empresa[] = [];
      
      if (acessosGrupos && acessosGrupos.length > 0) {
        // Obter IDs dos grupos que o usuário tem acesso
        const grupoIds = acessosGrupos.map((acesso: AcessoUsuarioGrupoResult) => acesso.grupo_id);
        
        // Buscar associações empresa-grupo para esses grupos
        const { data: associacoes, error: erroAssociacoes } = await supabaseClient
          .from('associacoes_empresa_grupo')
          .select(`
            empresa_id,
            empresas:empresa_id (
              id,
              nome,
              nome_fantasia,
              url_logo,
              status,
              cnpj_cpf,
              tipo_documento
            )
          `)
          .in('grupo_id', grupoIds)
          .eq('status', 'ativo')
          .eq('empresas.status', 'ativo');
        
        if (erroAssociacoes) throw erroAssociacoes;
        
        if (associacoes) {
          associacoes.forEach((associacao: any) => {
            const empresa = processarEmpresaResult(associacao.empresas);
            if (empresa && !idsEmpresasDiretas.has(empresa.id)) {
              empresasGrupos.push(empresa);
              idsEmpresasDiretas.add(empresa.id);
            }
          });
        }
      }
      
      // Combinar resultados
      return { data: [...empresasDiretas, ...empresasGrupos] };
    } catch (error) {
      console.error('Erro ao listar empresas do usuário:', error);
      return { error: error as Error };
    }
  },
  
  // Criar nova empresa
  criarEmpresa: async (empresa: Empresa, usuarioId: string): Promise<RespostaAPI<Empresa>> => {
    try {
      // Inserir empresa
      const { data, error } = await supabaseClient
        .from('empresas')
        .insert({
          nome: empresa.nome,
          nome_fantasia: empresa.nome_fantasia,
          cnpj_cpf: empresa.cnpj_cpf,
          tipo_documento: empresa.tipo_documento,
          url_logo: empresa.url_logo,
          endereco: empresa.endereco,
          contato: empresa.contato,
          status: 'ativo'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Criar acesso para o usuário
      const { error: erroAcesso } = await supabaseClient
        .from('acessos_usuario_empresa')
        .insert({
          usuario_id: usuarioId,
          empresa_id: data.id,
          nivel_acesso: 'ADMIN',
          status: 'ativo'
        });
      
      if (erroAcesso) throw erroAcesso;
      
      return { data };
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      return { error: error as Error };
    }
  },
  
  // Atualizar empresa existente
  atualizarEmpresa: async (empresaId: string, empresa: Empresa, usuarioId: string): Promise<RespostaAPI<Empresa>> => {
    try {
      // Verificar se o usuário tem acesso de administrador
      const { data: acesso, error: erroAcesso } = await supabaseClient
        .from('acessos_usuario_empresa')
        .select('nivel_acesso')
        .eq('usuario_id', usuarioId)
        .eq('empresa_id', empresaId)
        .eq('status', 'ativo')
        .single();
      
      if (erroAcesso) throw erroAcesso;
      
      if (acesso.nivel_acesso !== 'ADMIN') {
        throw new Error('Usuário não tem permissão para atualizar esta empresa');
      }
      
      // Atualizar empresa
      const { data, error } = await supabaseClient
        .from('empresas')
        .update({
          nome: empresa.nome,
          nome_fantasia: empresa.nome_fantasia,
          cnpj_cpf: empresa.cnpj_cpf,
          tipo_documento: empresa.tipo_documento,
          url_logo: empresa.url_logo,
          endereco: empresa.endereco,
          contato: empresa.contato,
          status: empresa.status
        })
        .eq('id', empresaId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      return { error: error as Error };
    }
  },
  
  // Excluir empresa (marcar como inativa)
  excluirEmpresa: async (empresaId: string, usuarioId: string): Promise<RespostaAPI<void>> => {
    try {
      // Verificar se o usuário tem acesso de administrador
      const { data: acesso, error: erroAcesso } = await supabaseClient
        .from('acessos_usuario_empresa')
        .select('nivel_acesso')
        .eq('usuario_id', usuarioId)
        .eq('empresa_id', empresaId)
        .eq('status', 'ativo')
        .single();
      
      if (erroAcesso) throw erroAcesso;
      
      if (acesso.nivel_acesso !== 'ADMIN') {
        throw new Error('Usuário não tem permissão para excluir esta empresa');
      }
      
      // Marcar empresa como inativa
      const { error } = await supabaseClient
        .from('empresas')
        .update({ status: 'inativo' })
        .eq('id', empresaId);
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      return { error: error as Error };
    }
  }
};

// Função auxiliar para processar grupos econômicos retornados pelo Supabase
function processarGrupoEconomicoResult(grupoData: any): GrupoEconomico | null {
  // Verificar se é um objeto válido
  if (!grupoData || typeof grupoData !== 'object') {
    return null;
  }
  
  // Verificar se é um array (caso em que precisamos pegar o primeiro item)
  if (Array.isArray(grupoData)) {
    if (grupoData.length === 0) {
      return null;
    }
    return processarGrupoEconomicoResult(grupoData[0]);
  }
  
  // Verificar se tem as propriedades necessárias
  if (!('id' in grupoData) || !('nome' in grupoData)) {
    return null;
  }
  
  // Retornar como GrupoEconomico
  return grupoData as GrupoEconomico;
}

// Serviço para gerenciamento de grupos econômicos
export const ServicoGrupoEconomico = {
  // Obter grupo por ID
  obterPorId: async (grupoId: string): Promise<RespostaAPI<GrupoEconomico>> => {
    try {
      const { data, error } = await supabaseClient
        .from('grupos_economicos')
        .select('*')
        .eq('id', grupoId)
        .eq('status', 'ativo')
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao obter grupo econômico:', error);
      return { error: error as Error };
    }
  },
  
  // Listar grupos do usuário
  listarGruposUsuario: async (usuarioId: string): Promise<RespostaAPI<GrupoEconomico[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('acessos_usuario_grupo')
        .select(`
          grupos_economicos:grupo_id (
            id,
            nome,
            descricao,
            url_logo,
            status
          )
        `)
        .eq('usuario_id', usuarioId)
        .eq('status', 'ativo')
        .eq('grupos_economicos.status', 'ativo');
      
      if (error) throw error;
      
      // Extrair grupos
      const grupos: GrupoEconomico[] = [];
      if (data) {
        data.forEach(acesso => {
          const grupo = processarGrupoEconomicoResult(acesso.grupos_economicos);
          if (grupo) {
            grupos.push(grupo);
          }
        });
      }
      
      return { data: grupos };
    } catch (error) {
      console.error('Erro ao listar grupos do usuário:', error);
      return { error: error as Error };
    }
  },
  
  // Criar novo grupo
  criarGrupo: async (grupo: GrupoEconomico, usuarioId: string): Promise<RespostaAPI<GrupoEconomico>> => {
    try {
      // Inserir grupo
      const { data, error } = await supabaseClient
        .from('grupos_economicos')
        .insert({
          nome: grupo.nome,
          descricao: grupo.descricao,
          url_logo: grupo.url_logo,
          status: 'ativo'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Criar acesso para o usuário
      const { error: erroAcesso } = await supabaseClient
        .from('acessos_usuario_grupo')
        .insert({
          usuario_id: usuarioId,
          grupo_id: data.id,
          nivel_acesso: 'ADMIN',
          status: 'ativo'
        });
      
      if (erroAcesso) throw erroAcesso;
      
      return { data };
    } catch (error) {
      console.error('Erro ao criar grupo econômico:', error);
      return { error: error as Error };
    }
  },
  
  // Atualizar grupo existente
  atualizarGrupo: async (grupoId: string, grupo: GrupoEconomico, usuarioId: string): Promise<RespostaAPI<GrupoEconomico>> => {
    try {
      // Verificar se o usuário tem acesso de administrador
      const { data: acesso, error: erroAcesso } = await supabaseClient
        .from('acessos_usuario_grupo')
        .select('nivel_acesso')
        .eq('usuario_id', usuarioId)
        .eq('grupo_id', grupoId)
        .eq('status', 'ativo')
        .single();
      
      if (erroAcesso) throw erroAcesso;
      
      if (acesso.nivel_acesso !== 'ADMIN') {
        throw new Error('Usuário não tem permissão para atualizar este grupo');
      }
      
      // Atualizar grupo
      const { data, error } = await supabaseClient
        .from('grupos_economicos')
        .update({
          nome: grupo.nome,
          descricao: grupo.descricao,
          url_logo: grupo.url_logo,
          status: grupo.status
        })
        .eq('id', grupoId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao atualizar grupo econômico:', error);
      return { error: error as Error };
    }
  },
  
  // Excluir grupo (marcar como inativo)
  excluirGrupo: async (grupoId: string, usuarioId: string): Promise<RespostaAPI<void>> => {
    try {
      // Verificar se o usuário tem acesso de administrador
      const { data: acesso, error: erroAcesso } = await supabaseClient
        .from('acessos_usuario_grupo')
        .select('nivel_acesso')
        .eq('usuario_id', usuarioId)
        .eq('grupo_id', grupoId)
        .eq('status', 'ativo')
        .single();
      
      if (erroAcesso) throw erroAcesso;
      
      if (acesso.nivel_acesso !== 'ADMIN') {
        throw new Error('Usuário não tem permissão para excluir este grupo');
      }
      
      // Marcar grupo como inativo
      const { error } = await supabaseClient
        .from('grupos_economicos')
        .update({ status: 'inativo' })
        .eq('id', grupoId);
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro ao excluir grupo econômico:', error);
      return { error: error as Error };
    }
  },
  
  // Listar empresas de um grupo
  listarEmpresasGrupo: async (grupoId: string): Promise<RespostaAPI<AssociacaoEmpresaGrupo[]>> => {
    try {
      const { data: rawData, error } = await supabaseClient
        .from('associacoes_empresa_grupo')
        .select(`
          grupo_id,
          empresa_id,
          empresa_principal,
          status,
          empresa:empresa_id (
            id,
            nome,
            nome_fantasia,
            url_logo,
            status,
            cnpj_cpf,
            tipo_documento
          )
        `)
        .eq('grupo_id', grupoId)
        .eq('status', 'ativo')
        .eq('empresa.status', 'ativo');
      
      if (error) throw error;
      
      // Processar os resultados para garantir tipagem correta
      const processedData: AssociacaoEmpresaGrupo[] = [];
      
      if (rawData && rawData.length > 0) {
        rawData.forEach((item: any) => {
          const associacao = processarAssociacaoEmpresaGrupoResult(item);
          if (associacao) {
            processedData.push(associacao);
          }
        });
      }
      
      return { data: processedData };
    } catch (error) {
      console.error('Erro ao listar empresas do grupo:', error);
      return { error: error as Error };
    }
  },
  
  // Adicionar empresa ao grupo
  adicionarEmpresaAoGrupo: async (grupoId: string, empresaId: string, empresaPrincipal: boolean = false): Promise<RespostaAPI<AssociacaoEmpresaGrupo>> => {
    try {
      // Verificar se já existe associação
      const { data: associacaoExistente, error: erroVerificacao } = await supabaseClient
        .from('associacoes_empresa_grupo')
        .select('*')
        .eq('grupo_id', grupoId)
        .eq('empresa_id', empresaId)
        .maybeSingle();
      
      if (erroVerificacao) throw erroVerificacao;
      
      if (associacaoExistente) {
        // Atualizar associação existente
        const { data, error } = await supabaseClient
          .from('associacoes_empresa_grupo')
          .update({
            empresa_principal: empresaPrincipal,
            status: 'ativo'
          })
          .eq('grupo_id', grupoId)
          .eq('empresa_id', empresaId)
          .select()
          .single();
        
        if (error) throw error;
        
        return { data };
      } else {
        // Criar nova associação
        const { data, error } = await supabaseClient
          .from('associacoes_empresa_grupo')
          .insert({
            grupo_id: grupoId,
            empresa_id: empresaId,
            empresa_principal: empresaPrincipal,
            status: 'ativo'
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return { data };
      }
    } catch (error) {
      console.error('Erro ao adicionar empresa ao grupo:', error);
      return { error: error as Error };
    }
  },
  
  // Remover empresa do grupo
  removerEmpresaDoGrupo: async (grupoId: string, empresaId: string): Promise<RespostaAPI<void>> => {
    try {
      const { error } = await supabaseClient
        .from('associacoes_empresa_grupo')
        .update({ status: 'inativo' })
        .eq('grupo_id', grupoId)
        .eq('empresa_id', empresaId);
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro ao remover empresa do grupo:', error);
      return { error: error as Error };
    }
  }
};
