import React, { useState } from 'react';
import { ServicoAutenticacao } from '../../../api/autenticacao';
import { useRouter } from 'next/router';

// Componente de registro
export const RegisterForm = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [carregandoForm, setCarregandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação mais rigorosa dos campos
    if (!nome.trim()) {
      setErroForm('O nome é obrigatório');
      return;
    }
    
    if (!sobrenome.trim()) {
      setErroForm('O sobrenome é obrigatório');
      return;
    }
    
    if (!email.trim()) {
      setErroForm('O email é obrigatório');
      return;
    }
    
    if (!senha) {
      setErroForm('A senha é obrigatória');
      return;
    }
    
    if (!confirmacaoSenha) {
      setErroForm('A confirmação de senha é obrigatória');
      return;
    }
    
    if (senha !== confirmacaoSenha) {
      setErroForm('As senhas não coincidem');
      return;
    }
    
    if (senha.length < 8) {
      setErroForm('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    setCarregandoForm(true);
    setErroForm(null);
    
    try {
      // Registrar usuário usando o serviço centralizado de autenticação
      const { error } = await ServicoAutenticacao.registrar(
        email,
        senha,
        nome.trim(),
        sobrenome.trim()
      );
      
      if (error) throw error;
      
      // Após registro bem-sucedido, tentar fazer login automaticamente
      const loginResult = await ServicoAutenticacao.login(email, senha);
      
      if (loginResult.error) {
        console.log("Registro bem-sucedido, mas login automático falhou:", loginResult.error);
        // Continuar com fluxo de sucesso mesmo se o login automático falhar
      }
      
      setSucesso(true);
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      let mensagemErro = 'Falha ao criar conta';
      
      if (error.message && error.message.includes('already registered')) {
        mensagemErro = 'Este email já está registrado';
      }
      
      setErroForm(mensagemErro);
    } finally {
      setCarregandoForm(false);
    }
  };
  
  if (sucesso) {
    return (
      <div className="register-success">
        <h2>Cadastro realizado com sucesso!</h2>
        <p>Sua conta foi criada com os seguintes dados:</p>
        <ul>
          <li><strong>Nome:</strong> {nome} {sobrenome}</li>
          <li><strong>Email:</strong> {email}</li>
        </ul>
        <p>Você já pode fazer login com suas credenciais.</p>
        <button 
          onClick={() => router.push('/login')}
          className="btn-primary"
        >
          Ir para o login
        </button>
      </div>
    );
  }
  
  return (
    <div className="register-form">
      <h2>Criar uma conta no BeeConta</h2>
      
      {erroForm && <div className="error-message">{erroForm}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nome">Nome *</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={carregandoForm}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="sobrenome">Sobrenome *</label>
            <input
              type="text"
              id="sobrenome"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              disabled={carregandoForm}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={carregandoForm}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="senha">Senha *</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={carregandoForm}
            required
            minLength={8}
          />
          <small>A senha deve ter pelo menos 8 caracteres</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmacao-senha">Confirmar Senha *</label>
          <input
            type="password"
            id="confirmacao-senha"
            value={confirmacaoSenha}
            onChange={(e) => setConfirmacaoSenha(e.target.value)}
            disabled={carregandoForm}
            required
          />
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={carregandoForm}
          >
            {carregandoForm ? 'Criando conta...' : 'Criar conta'}
          </button>
        </div>
      </form>
      
      <div className="register-links">
        <p>Já tem uma conta? <a href="/login">Entrar</a></p>
      </div>
    </div>
  );
};
