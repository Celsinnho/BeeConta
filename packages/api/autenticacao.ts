import { getSupabaseClient } from './supabase';
import { Usuario, RespostaAPI } from './tipos';

// Serviço para gerenciamento de autenticação e usuários
export const ServicoAutenticacao = {
  // Obter dados do usuário atual
  obterUsuarioAtual: async (): Promise<RespostaAPI<Usuario | null>> => {
    try {
      const supabaseClient = getSupabaseClient();
      
      // Verificar se há uma sessão ativa
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session) {
        return { data: null };
      }
      
      try {
        // Buscar dados do usuário - consulta simplificada para evitar erros de parsing
        const { data: dadosUsuario, error: erroUsuario } = await supabaseClient
          .from('usuarios')
          .select('id, nome, sobrenome, nome_exibicao, url_avatar, empresa_padrao_id, admin_sistema')
          .eq('id', session.user.id)
          .single();
        
        if (erroUsuario) {
          console.warn('Erro ao buscar dados do usuário:', erroUsuario);
          // Retornar dados básicos do usuário da sessão se não conseguir buscar da tabela usuarios
          return { 
            data: {
              id: session.user.id,
              email: session.user.email || '',
              nome: session.user.user_metadata?.nome || '',
              sobrenome: session.user.user_metadata?.sobrenome || '',
              nome_exibicao: session.user.user_metadata?.nome_exibicao || session.user.email || '',
              url_avatar: null,
              empresa_padrao_id: null,
              admin_sistema: false
            } 
          };
        }
        
        // Buscar email do usuário da sessão
        const usuarioCompleto: Usuario = {
          id: dadosUsuario.id,
          email: session.user.email || '',
          nome: dadosUsuario.nome,
          sobrenome: dadosUsuario.sobrenome,
          nome_exibicao: dadosUsuario.nome_exibicao,
          url_avatar: dadosUsuario.url_avatar,
          empresa_padrao_id: dadosUsuario.empresa_padrao_id,
          admin_sistema: dadosUsuario.admin_sistema
        };
        
        return { data: usuarioCompleto };
      } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
        // Retornar dados básicos do usuário da sessão em caso de erro
        return { 
          data: {
            id: session.user.id,
            email: session.user.email || '',
            nome: session.user.user_metadata?.nome || '',
            sobrenome: session.user.user_metadata?.sobrenome || '',
            nome_exibicao: session.user.user_metadata?.nome_exibicao || session.user.email || '',
            url_avatar: null,
            empresa_padrao_id: null,
            admin_sistema: false
          } 
        };
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return { error: error as Error };
    }
  },
  
  // Login com email e senha
  login: async (email: string, senha: string): Promise<RespostaAPI<void>> => {
    try {
      const supabaseClient = getSupabaseClient();
      
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password: senha
      });
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: error as Error };
    }
  },
  
  // Login com Google
  loginComGoogle: async (redirectUrl?: string): Promise<RespostaAPI<void>> => {
    try {
      const supabaseClient = getSupabaseClient();
      
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl || `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro no login com Google:', error);
      return { error: error as Error };
    }
  },
  
  // Logout
  logout: async (): Promise<RespostaAPI<void>> => {
    try {
      const supabaseClient = getSupabaseClient();
      
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro no logout:', error);
      return { error: error as Error };
    }
  },
  
  // Registro de novo usuário
  registrar: async (
    email: string, 
    senha: string, 
    nome: string, 
    sobrenome: string
  ): Promise<RespostaAPI<void>> => {
    try {
      const supabaseClient = getSupabaseClient();
      
      const { error } = await supabaseClient.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            sobrenome,
            nome_exibicao: `${nome} ${sobrenome}`
          }
        }
      });
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro no registro:', error);
      return { error: error as Error };
    }
  },
  
  // Atualizar dados do usuário
  atualizarUsuario: async (
    usuarioId: string, 
    dados: Partial<Usuario>
  ): Promise<RespostaAPI<Usuario>> => {
    try {
      const supabaseClient = getSupabaseClient();
      
      const { data, error } = await supabaseClient
        .from('usuarios')
        .update({
          nome: dados.nome,
          sobrenome: dados.sobrenome,
          nome_exibicao: dados.nome_exibicao,
          url_avatar: dados.url_avatar,
          empresa_padrao_id: dados.empresa_padrao_id
        })
        .eq('id', usuarioId)
        .select('id, nome, sobrenome, nome_exibicao, url_avatar, empresa_padrao_id, admin_sistema')
        .single();
      
      if (error) throw error;
      
      // Buscar email do usuário da sessão
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      const usuarioCompleto: Usuario = {
        ...data,
        email: session?.user?.email || ''
      };
      
      return { data: usuarioCompleto };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { error: error as Error };
    }
  },
  
  // Recuperação de senha
  recuperarSenha: async (email: string): Promise<RespostaAPI<void>> => {
    try {
      const supabaseClient = getSupabaseClient();
      
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/redefinir-senha`
      });
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return { error: error as Error };
    }
  },
  
  // Redefinir senha
  redefinirSenha: async (novaSenha: string): Promise<RespostaAPI<void>> => {
    try {
      const supabaseClient = getSupabaseClient();
      
      const { error } = await supabaseClient.auth.updateUser({
        password: novaSenha
      });
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      return { error: error as Error };
    }
  }
};
