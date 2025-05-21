import React from 'react';
import { useAuth } from '../packages/web/components/auth/AuthContext';
import { EmpresaSelector, RotaProtegida } from '../packages/web/components/auth/AuthComponents';
import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
  const { usuario, empresaAtiva, logout } = useAuth();

  return (
    <RotaProtegida>
      <div className="dashboard-container">
        <Head>
          <title>Dashboard - BeeConta</title>
          <meta name="description" content="Dashboard do BeeConta" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className="dashboard-header">
          <div className="logo">
            <img src="/logo.png" alt="BeeConta Logo" />
          </div>
          
          <EmpresaSelector />
          
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {usuario?.url_avatar ? (
                  <img src={usuario.url_avatar} alt={usuario.nome} />
                ) : (
                  <div className="avatar-placeholder">
                    {usuario?.nome?.substring(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <span>{usuario?.nome_exibicao || `${usuario?.nome} ${usuario?.sobrenome}`}</span>
            </div>
            
            <button className="logout-button" onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="sidebar">
            <nav className="main-nav">
              <ul>
                <li>
                  <Link href="/dashboard">
                    <a className="active">Dashboard</a>
                  </Link>
                </li>
                <li>
                  <Link href="/empresas">
                    <a>Empresas</a>
                  </Link>
                </li>
                <li>
                  <Link href="/grupos">
                    <a>Grupos Econômicos</a>
                  </Link>
                </li>
                <li>
                  <Link href="/contas-bancarias">
                    <a>Contas Bancárias</a>
                  </Link>
                </li>
                <li>
                  <Link href="/cartoes">
                    <a>Cartões de Crédito</a>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <main className="main-content">
            <h1>Bem-vindo ao BeeConta</h1>
            
            {empresaAtiva ? (
              <div className="dashboard-summary">
                <h2>Resumo de {empresaAtiva.nome_fantasia || empresaAtiva.nome}</h2>
                
                <div className="dashboard-cards">
                  <div className="dashboard-card">
                    <h3>Contas Bancárias</h3>
                    <div className="card-content">
                      <p className="card-value">Carregando...</p>
                      <p className="card-label">Total de contas</p>
                    </div>
                    <Link href="/contas-bancarias">
                      <a className="card-link">Ver detalhes</a>
                    </Link>
                  </div>
                  
                  <div className="dashboard-card">
                    <h3>Cartões de Crédito</h3>
                    <div className="card-content">
                      <p className="card-value">Carregando...</p>
                      <p className="card-label">Total de cartões</p>
                    </div>
                    <Link href="/cartoes">
                      <a className="card-link">Ver detalhes</a>
                    </Link>
                  </div>
                  
                  <div className="dashboard-card">
                    <h3>Saldo Total</h3>
                    <div className="card-content">
                      <p className="card-value">Carregando...</p>
                      <p className="card-label">Em todas as contas</p>
                    </div>
                    <Link href="/relatorios/saldos">
                      <a className="card-link">Ver detalhes</a>
                    </Link>
                  </div>
                </div>
                
                <div className="quick-actions">
                  <h3>Ações Rápidas</h3>
                  <div className="action-buttons">
                    <Link href="/contas-bancarias/nova">
                      <a className="btn-action">Nova Conta Bancária</a>
                    </Link>
                    <Link href="/cartoes/novo">
                      <a className="btn-action">Novo Cartão</a>
                    </Link>
                    <Link href="/transacoes/nova">
                      <a className="btn-action">Nova Transação</a>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-company-selected">
                <p>Selecione uma empresa para visualizar o dashboard.</p>
                <Link href="/empresas/nova">
                  <a className="btn-primary">Criar Nova Empresa</a>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </RotaProtegida>
  );
}
