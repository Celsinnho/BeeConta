import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ServicoAutenticacao } from '../../../api/autenticacao';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Componente de login
export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregandoForm, setCarregandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [loginSucesso, setLoginSucesso] = useState(false);
  
  const { login, loginComGoogle, carregando, usuario } = useAuth();
  
  // Efeito para redirecionar quando o usuário estiver disponível
  useEffect(() => {
    if (usuario && loginSucesso) {
      router.push('/dashboard');
    }
  }, [usuario, loginSucesso, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !senha) {
      setErroForm('Preencha todos os campos');
      return;
    }
    
    setCarregandoForm(true);
    setErroForm(null);
    
    try {
      const { sucesso, erro } = await login(email, senha);
      
      if (!sucesso) {
        setErroForm(erro || 'Falha ao realizar login');
        setCarregandoForm(false);
        return;
      }
      
      // Marcar login como bem-sucedido para acionar redirecionamento
      setLoginSucesso(true);
      
      // Redirecionar manualmente após um curto delay se o useEffect não for acionado
      setTimeout(() => {
        if (document.location.pathname === '/login') {
          router.push('/dashboard');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Erro no login:', error);
      setErroForm('Ocorreu um erro inesperado. Tente novamente.');
      setCarregandoForm(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setErroForm(null);
    setCarregandoForm(true);
    
    try {
      const { sucesso } = await loginComGoogle();
      
      if (sucesso) {
        setLoginSucesso(true);
      }
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setErroForm('Falha ao realizar login com Google');
      setCarregandoForm(false);
    }
  };
  
  return (
    <div className="login-form">
      <h2>Entrar no BeeConta</h2>
      
      {erroForm && <div className="error-message">{erroForm}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={carregandoForm || carregando || loginSucesso}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={carregandoForm || carregando || loginSucesso}
            required
          />
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={carregandoForm || carregando || loginSucesso}
          >
            {(carregandoForm || loginSucesso) ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </form>
      
      <div className="social-login">
        <div className="divider">ou</div>
        
        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleLogin}
          disabled={carregandoForm || carregando || loginSucesso}
        >
          Entrar com Google
        </button>
      </div>
      
      <div className="login-links">
        <a href="/auth/recuperar-senha">Esqueceu sua senha?</a>
        <Link href="/registro">Criar uma conta</Link>
      </div>
    </div>
  );
};

// Componente seletor de empresa
export const EmpresaSelector = () => {
  const { empresaAtiva, empresasDisponiveis, alterarEmpresaAtiva, carregando } = useAuth();
  const [mostraSeletor, setMostraSeletor] = useState(false);
  
  const handleChangeEmpresa = async (empresaId: string) => {
    await alterarEmpresaAtiva(empresaId);
    setMostraSeletor(false);
  };
  
  if (!empresaAtiva || empresasDisponiveis.length <= 1) {
    return null;
  }
  
  return (
    <div className="empresa-selector">
      <div 
        className="empresa-atual" 
        onClick={() => setMostraSeletor(!mostraSeletor)}
      >
        {empresaAtiva.url_logo ? (
          <img src={empresaAtiva.url_logo} alt={empresaAtiva.nome} className="empresa-logo" />
        ) : (
          <div className="empresa-logo-placeholder">
            {empresaAtiva.nome.substring(0, 2).toUpperCase()}
          </div>
        )}
        <span>{empresaAtiva.nome_fantasia || empresaAtiva.nome}</span>
        <i className={`arrow ${mostraSeletor ? 'up' : 'down'}`}></i>
      </div>
      
      {mostraSeletor && (
        <div className="empresas-dropdown">
          {empresasDisponiveis.map((empresa) => (
            <div
              key={empresa.id}
              className={`empresa-item ${empresa.id === empresaAtiva.id ? 'active' : ''}`}
              onClick={() => handleChangeEmpresa(empresa.id!)}
            >
              {empresa.url_logo ? (
                <img src={empresa.url_logo} alt={empresa.nome} className="empresa-logo" />
              ) : (
                <div className="empresa-logo-placeholder">
                  {empresa.nome.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span>{empresa.nome_fantasia || empresa.nome}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente de proteção de rota
export const RotaProtegida = ({ 
  children,
  requerAdmin = false,
  requerEmpresa = true
}: { 
  children: React.ReactNode;
  requerAdmin?: boolean;
  requerEmpresa?: boolean;
}) => {
  const { usuario, empresaAtiva, carregando } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!carregando && !usuario) {
      router.push('/login');
    }
  }, [carregando, usuario, router]);
  
  if (carregando) {
    return <div className="loading">Carregando...</div>;
  }
  
  if (!usuario) {
    return <div className="loading">Redirecionando para login...</div>;
  }
  
  if (requerAdmin && !usuario.admin_sistema) {
    return (
      <div className="access-denied">
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
        <button 
          onClick={() => router.push('/')}
          className="btn-primary"
        >
          Voltar para o início
        </button>
      </div>
    );
  }
  
  if (requerEmpresa && !empresaAtiva) {
    return (
      <div className="no-company">
        <h2>Nenhuma empresa selecionada</h2>
        <p>Você precisa selecionar ou criar uma empresa para acessar esta página.</p>
        <button 
          onClick={() => router.push('/empresas/nova')}
          className="btn-primary"
        >
          Criar Empresa
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
};
