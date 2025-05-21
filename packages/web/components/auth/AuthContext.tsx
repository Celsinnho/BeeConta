import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Empresa, RespostaAPI } from '../../../api/tipos';
import { ServicoAutenticacao } from '../../../api/autenticacao';
import { ServicoEmpresa } from '../../../api/empresas';
import { supabaseClient } from '../../../api/supabase';

// Criação do contexto
type AuthContextType = {
  usuario: Usuario | null;
  empresaAtiva: Empresa | null;
  empresasDisponiveis: Empresa[];
  carregando: boolean;
  erro: string | null;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  loginComGoogle: () => Promise<{ sucesso: boolean; erro?: string }>;
  logout: () => Promise<void>;
  atualizarUsuario: (dados: Partial<Usuario>) => Promise<{ sucesso: boolean; erro?: string }>;
  alterarEmpresaAtiva: (empresaId: string) => Promise<boolean>;
  recarregarEmpresas: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [empresaAtiva, setEmpresaAtiva] = useState<Empresa | null>(null);
  const [empresasDisponiveis, setEmpresasDisponiveis] = useState<Empresa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Efeito para verificar sessão atual
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        // Buscar dados do usuário atual usando o serviço centralizado
        const { data: usuarioAtual, error: erroUsuario } = await ServicoAutenticacao.obterUsuarioAtual();
        
        if (erroUsuario) throw erroUsuario;
        
        if (usuarioAtual) {
          setUsuario(usuarioAtual);
          
          // Carregar empresas disponíveis
          await carregarEmpresas(usuarioAtual.id);
          
          // Definir empresa ativa (padrão ou primeira disponível)
          if (usuarioAtual.empresa_padrao_id) {
            await definirEmpresaAtiva(usuarioAtual.empresa_padrao_id);
          } else if (empresasDisponiveis.length > 0) {
            await definirEmpresaAtiva(empresasDisponiveis[0].id!);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setErro('Falha ao carregar dados do usuário');
      } finally {
        setCarregando(false);
      }
    };
    
    verificarSessao();
    
    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Buscar dados do usuário atual usando o serviço centralizado
          const { data: usuarioAtual, error: erroUsuario } = await ServicoAutenticacao.obterUsuarioAtual();
          
          if (erroUsuario) {
            console.error('Erro ao buscar dados do usuário:', erroUsuario);
            setErro('Falha ao carregar dados do usuário');
            setCarregando(false);
            return;
          }
          
          if (usuarioAtual) {
            setUsuario(usuarioAtual);
            
            // Carregar empresas disponíveis
            await carregarEmpresas(usuarioAtual.id);
            
            // Definir empresa ativa (padrão ou primeira disponível)
            if (usuarioAtual.empresa_padrao_id) {
              await definirEmpresaAtiva(usuarioAtual.empresa_padrao_id);
            } else if (empresasDisponiveis.length > 0) {
              await definirEmpresaAtiva(empresasDisponiveis[0].id!);
            }
          }
          
          setCarregando(false);
        } else if (event === 'SIGNED_OUT') {
          setUsuario(null);
          setEmpresaAtiva(null);
          setEmpresasDisponiveis([]);
          setCarregando(false);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Função para carregar empresas disponíveis
  const carregarEmpresas = async (usuarioId: string) => {
    try {
      const { data, error } = await ServicoEmpresa.listarEmpresasUsuario(usuarioId);
      
      if (error) throw error;
      
      setEmpresasDisponiveis(data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      setErro('Falha ao carregar empresas disponíveis');
    }
  };

  // Função para definir empresa ativa
  const definirEmpresaAtiva = async (empresaId: string) => {
    try {
      // Verificar se a empresa está na lista de disponíveis
      const empresa = empresasDisponiveis.find(e => e.id === empresaId);
      
      if (!empresa) {
        // Tentar buscar a empresa diretamente
        const { data, error } = await ServicoEmpresa.obterPorId(empresaId);
        
        if (error || !data) {
          console.error('Empresa não encontrada:', error);
          return false;
        }
        
        setEmpresaAtiva(data);
      } else {
        setEmpresaAtiva(empresa);
      }
      
      // Atualizar empresa padrão do usuário se necessário
      if (usuario && usuario.empresa_padrao_id !== empresaId) {
        const { error } = await ServicoAutenticacao.atualizarUsuario(usuario.id, {
          empresa_padrao_id: empresaId
        });
        
        if (!error) {
          setUsuario({
            ...usuario,
            empresa_padrao_id: empresaId
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao definir empresa ativa:', error);
      return false;
    }
  };

  // Função de login
  const login = async (email: string, senha: string) => {
    try {
      setCarregando(true);
      setErro(null);
      
      const { error } = await ServicoAutenticacao.login(email, senha);
      
      if (error) throw error;
      
      return { sucesso: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      let mensagemErro = 'Falha ao realizar login';
      
      if (error.message.includes('Invalid login credentials')) {
        mensagemErro = 'Email ou senha inválidos';
      }
      
      setErro(mensagemErro);
      setCarregando(false);
      
      return { sucesso: false, erro: mensagemErro };
    }
  };

  // Função de login com Google
  const loginComGoogle = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      const { error } = await ServicoAutenticacao.loginComGoogle();
      
      if (error) throw error;
      
      return { sucesso: true };
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      const mensagemErro = 'Falha ao realizar login com Google';
      
      setErro(mensagemErro);
      setCarregando(false);
      
      return { sucesso: false, erro: mensagemErro };
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      setCarregando(true);
      
      await ServicoAutenticacao.logout();
      
      setUsuario(null);
      setEmpresaAtiva(null);
      setEmpresasDisponiveis([]);
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Função para atualizar dados do usuário
  const atualizarUsuario = async (dados: Partial<Usuario>) => {
    try {
      if (!usuario) {
        return { sucesso: false, erro: 'Usuário não autenticado' };
      }
      
      setCarregando(true);
      
      const { data, error } = await ServicoAutenticacao.atualizarUsuario(usuario.id, dados);
      
      if (error) throw error;
      
      // Atualizar estado local
      if (data) {
        setUsuario(data);
      }
      
      return { sucesso: true };
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      
      const mensagemErro = 'Falha ao atualizar dados do usuário';
      
      setErro(mensagemErro);
      
      return { sucesso: false, erro: mensagemErro };
    } finally {
      setCarregando(false);
    }
  };

  // Função para alterar empresa ativa
  const alterarEmpresaAtiva = async (empresaId: string) => {
    setCarregando(true);
    const resultado = await definirEmpresaAtiva(empresaId);
    setCarregando(false);
    return resultado;
  };

  // Função para recarregar empresas
  const recarregarEmpresas = async () => {
    if (!usuario) return;
    
    setCarregando(true);
    await carregarEmpresas(usuario.id);
    setCarregando(false);
  };

  // Valor do contexto
  const value: AuthContextType = {
    usuario,
    empresaAtiva,
    empresasDisponiveis,
    carregando,
    erro,
    login,
    loginComGoogle,
    logout,
    atualizarUsuario,
    alterarEmpresaAtiva,
    recarregarEmpresas
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}
