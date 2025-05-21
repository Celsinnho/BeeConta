import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { RotaProtegida } from '../../components/auth/AuthComponents';
import { ServicoContaBancaria } from '../../../api/contas_bancarias';
import { ContaBancaria, Banco, Moeda } from '../../../api/tipos';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function NovaConta() {
  const router = useRouter();
  const { empresaAtiva } = useAuth();
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<ContaBancaria>>({
    empresa_id: '',
    banco_id: '',
    agencia: '',
    conta: '',
    digito: '',
    tipo_conta: 'CORRENTE',
    descricao: '',
    saldo_inicial: 0,
    data_saldo_inicial: new Date().toISOString().split('T')[0],
    moeda_id: '',
    status: 'ativa'
  });

  useEffect(() => {
    const carregarDados = async () => {
      if (!empresaAtiva) return;
      
      setCarregando(true);
      try {
        // Atualizar empresa_id no formulário
        setFormData(prev => ({
          ...prev,
          empresa_id: empresaAtiva.id
        }));
        
        // Carregar bancos
        const { data: bancosList, error: bancosError } = await ServicoContaBancaria.listarBancos();
        if (bancosError) throw bancosError;
        setBancos(bancosList || []);
        
        // Carregar moedas
        const { data: moedasList, error: moedasError } = await ServicoContaBancaria.listarMoedas();
        if (moedasError) throw moedasError;
        setMoedas(moedasList || []);
        
        // Definir moeda padrão (BRL)
        const moedaPadrao = moedasList?.find(m => m.codigo === 'BRL');
        if (moedaPadrao) {
          setFormData(prev => ({
            ...prev,
            moeda_id: moedaPadrao.id
          }));
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setErro('Não foi possível carregar os dados necessários. Tente novamente mais tarde.');
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [empresaAtiva]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!empresaAtiva) return;
    
    // Validações básicas
    if (!formData.banco_id || !formData.agencia || !formData.conta || !formData.descricao || !formData.moeda_id) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    
    setSalvando(true);
    setErro(null);
    
    try {
      const { data, error } = await ServicoContaBancaria.criarConta(formData as ContaBancaria);
      
      if (error) throw error;
      
      // Redirecionar para a lista de contas
      router.push('/contas-bancarias');
    } catch (err) {
      console.error('Erro ao salvar conta bancária:', err);
      setErro('Não foi possível salvar a conta bancária. Verifique os dados e tente novamente.');
      setSalvando(false);
    }
  };

  return (
    <RotaProtegida>
      <div className="page-container">
        <Head>
          <title>Nova Conta Bancária - BeeConta</title>
          <meta name="description" content="Adicionar nova conta bancária no BeeConta" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="main-content">
          <div className="page-header">
            <h1>Nova Conta Bancária</h1>
            <Link href="/contas-bancarias">
              <a className="btn-secondary">Voltar</a>
            </Link>
          </div>

          {carregando ? (
            <div className="loading">Carregando...</div>
          ) : (
            <div className="form-container">
              {erro && <div className="error-message">{erro}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="descricao">Descrição da Conta *</label>
                  <input
                    type="text"
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    required
                    disabled={salvando}
                  />
                  <small>Ex: Conta Corrente Principal, Poupança, etc.</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="banco_id">Banco *</label>
                  <select
                    id="banco_id"
                    name="banco_id"
                    value={formData.banco_id}
                    onChange={handleChange}
                    required
                    disabled={salvando}
                  >
                    <option value="">Selecione um banco</option>
                    {bancos.map(banco => (
                      <option key={banco.id} value={banco.id}>
                        {banco.codigo} - {banco.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="agencia">Agência *</label>
                    <input
                      type="text"
                      id="agencia"
                      name="agencia"
                      value={formData.agencia}
                      onChange={handleChange}
                      required
                      disabled={salvando}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="conta">Conta *</label>
                    <input
                      type="text"
                      id="conta"
                      name="conta"
                      value={formData.conta}
                      onChange={handleChange}
                      required
                      disabled={salvando}
                    />
                  </div>
                  
                  <div className="form-group small">
                    <label htmlFor="digito">Dígito</label>
                    <input
                      type="text"
                      id="digito"
                      name="digito"
                      value={formData.digito}
                      onChange={handleChange}
                      maxLength={1}
                      disabled={salvando}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tipo_conta">Tipo de Conta *</label>
                    <select
                      id="tipo_conta"
                      name="tipo_conta"
                      value={formData.tipo_conta}
                      onChange={handleChange}
                      required
                      disabled={salvando}
                    >
                      <option value="CORRENTE">Conta Corrente</option>
                      <option value="POUPANCA">Conta Poupança</option>
                      <option value="INVESTIMENTO">Conta Investimento</option>
                      <option value="PAGAMENTO">Conta Pagamento</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="moeda_id">Moeda *</label>
                    <select
                      id="moeda_id"
                      name="moeda_id"
                      value={formData.moeda_id}
                      onChange={handleChange}
                      required
                      disabled={salvando}
                    >
                      <option value="">Selecione uma moeda</option>
                      {moedas.map(moeda => (
                        <option key={moeda.id} value={moeda.id}>
                          {moeda.codigo} - {moeda.nome} ({moeda.simbolo})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="saldo_inicial">Saldo Inicial *</label>
                    <input
                      type="number"
                      id="saldo_inicial"
                      name="saldo_inicial"
                      value={formData.saldo_inicial}
                      onChange={handleChange}
                      step="0.01"
                      required
                      disabled={salvando}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="data_saldo_inicial">Data do Saldo Inicial *</label>
                    <input
                      type="date"
                      id="data_saldo_inicial"
                      name="data_saldo_inicial"
                      value={formData.data_saldo_inicial}
                      onChange={handleChange}
                      required
                      disabled={salvando}
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <Link href="/contas-bancarias">
                    <a className="btn-secondary" onClick={(e) => salvando && e.preventDefault()}>
                      Cancelar
                    </a>
                  </Link>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={salvando}
                  >
                    {salvando ? 'Salvando...' : 'Salvar Conta'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </RotaProtegida>
  );
}
