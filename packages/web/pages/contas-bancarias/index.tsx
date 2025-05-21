import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { RotaProtegida } from '../../components/auth/AuthComponents';
import { ServicoContaBancaria } from '../../../api/contas_bancarias';
import { ContaBancaria, Banco, Moeda } from '../../../api/tipos';
import Head from 'next/head';
import Link from 'next/link';

export default function ListaContasBancarias() {
  const { empresaAtiva } = useAuth();
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarContas = async () => {
      if (!empresaAtiva) return;
      
      setCarregando(true);
      try {
        const { data, error } = await ServicoContaBancaria.listarContasEmpresa(empresaAtiva.id!);
        if (error) throw error;
        setContas(data || []);
      } catch (err) {
        console.error('Erro ao carregar contas bancárias:', err);
        setErro('Não foi possível carregar as contas bancárias. Tente novamente mais tarde.');
      } finally {
        setCarregando(false);
      }
    };

    buscarContas();
  }, [empresaAtiva]);

  return (
    <RotaProtegida>
      <div className="page-container">
        <Head>
          <title>Contas Bancárias - BeeConta</title>
          <meta name="description" content="Gerenciamento de contas bancárias no BeeConta" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="main-content">
          <div className="page-header">
            <h1>Contas Bancárias</h1>
            <Link href="/contas-bancarias/nova">
              <a className="btn-primary">Nova Conta</a>
            </Link>
          </div>

          {carregando ? (
            <div className="loading">Carregando contas bancárias...</div>
          ) : erro ? (
            <div className="error-message">{erro}</div>
          ) : contas.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma conta bancária cadastrada.</p>
              <p>Clique no botão "Nova Conta" para adicionar sua primeira conta bancária.</p>
            </div>
          ) : (
            <div className="accounts-grid">
              {contas.map((conta) => (
                <div key={conta.id} className="account-card">
                  <div className="account-header">
                    {conta.banco?.url_logo ? (
                      <img src={conta.banco.url_logo} alt={conta.banco.nome} className="bank-logo" />
                    ) : (
                      <div className="bank-logo-placeholder">
                        {conta.banco?.nome.substring(0, 2).toUpperCase() || 'BC'}
                      </div>
                    )}
                    <h3>{conta.descricao}</h3>
                  </div>
                  
                  <div className="account-info">
                    <p className="account-bank">{conta.banco?.nome}</p>
                    <p className="account-number">
                      Ag: {conta.agencia} | Conta: {conta.conta}{conta.digito ? `-${conta.digito}` : ''}
                    </p>
                    <p className="account-type">{conta.tipo_conta}</p>
                  </div>
                  
                  <div className="account-balance">
                    <span className="balance-label">Saldo:</span>
                    <span className="balance-value">
                      {conta.moeda?.simbolo} {conta.saldo_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="account-actions">
                    <Link href={`/contas-bancarias/${conta.id}`}>
                      <a className="btn-secondary">Detalhes</a>
                    </Link>
                    <Link href={`/contas-bancarias/${conta.id}/editar`}>
                      <a className="btn-outline">Editar</a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </RotaProtegida>
  );
}
