import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ServicoEmpresa } from '../../packages/api/empresas';
import { useAuth } from '../../packages/web/components/auth/AuthContext';
import { RotaProtegida } from '../../packages/web/components/auth/AuthComponents';
import Head from 'next/head';

export default function NovaEmpresa() {
  const router = useRouter();
  const { usuario, recarregarEmpresas, alterarEmpresaAtiva } = useAuth();
  
  const [nome, setNome] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome) {
      setErro('O nome da empresa é obrigatório');
      return;
    }
    
    if (!usuario) {
      setErro('Usuário não autenticado');
      return;
    }
    
    setCarregando(true);
    setErro(null);
    
    try {
      const { data, error } = await ServicoEmpresa.criarEmpresa({
        nome,
        nome_fantasia: nomeFantasia,
        cnpj_cpf: cnpj,
        tipo_documento: 'CNPJ',
        status: 'ativo'
      }, usuario.id);
      
      if (error) throw error;
      
      if (data && data.id) {
        // Recarregar empresas e definir a nova como ativa
        await recarregarEmpresas();
        await alterarEmpresaAtiva(data.id);
        
        // Redirecionar para o dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      setErro('Falha ao criar empresa. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };
  
  return (
    <RotaProtegida requerEmpresa={false}>
      <div className="container">
        <Head>
          <title>Nova Empresa - BeeConta</title>
          <meta name="description" content="Criar nova empresa no BeeConta" />
        </Head>
        
        <div className="page-header">
          <h1>Nova Empresa</h1>
          <p>Preencha os dados para criar uma nova empresa</p>
        </div>
        
        {erro && (
          <div className="alert alert-danger">{erro}</div>
        )}
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="nome">Nome da Empresa *</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={carregando}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="nomeFantasia">Nome Fantasia</label>
            <input
              type="text"
              id="nomeFantasia"
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
              disabled={carregando}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="cnpj">CNPJ</label>
            <input
              type="text"
              id="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              disabled={carregando}
              className="form-control"
            />
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={carregando}
              className="btn-secondary"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={carregando}
              className="btn-primary"
            >
              {carregando ? 'Criando...' : 'Criar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </RotaProtegida>
  );
}
