import React from 'react';
import { RegisterForm } from '../packages/web/components/auth/RegisterComponents';
import Head from 'next/head';
import { useAuth } from '../packages/web/components/auth/AuthContext';
import { useRouter } from 'next/router';

export default function Registro() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();
  
  // Redirecionar para o dashboard se já estiver autenticado
  if (usuario && !carregando) {
    router.push('/dashboard');
    return null;
  }
  
  return (
    <div className="auth-container">
      <Head>
        <title>Criar Conta - BeeConta</title>
        <meta name="description" content="Crie sua conta no BeeConta" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="auth-content">
        <div className="auth-logo">
          <img src="/logo.png" alt="BeeConta Logo" />
        </div>
        
        <RegisterForm />
      </div>
      
      <div className="auth-footer">
        <p>&copy; {new Date().getFullYear()} BeeConta. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
