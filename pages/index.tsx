import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de login
    router.push('/login');
  }, []);

  return (
    <div className="redirect-container">
      <Head>
        <title>BeeConta - Sistema Financeiro Multiempresas</title>
        <meta name="description" content="BeeConta - Sistema financeiro completo para gestão multiempresas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="loading-container">
        <div className="logo-container">
          <img src="/logo.png" alt="BeeConta Logo" className="logo" />
        </div>
        <h1>BeeConta</h1>
        <p>Sistema Financeiro Multiempresas</p>
        <div className="loading-spinner">Carregando...</div>
      </div>

      <style jsx>{`
        .redirect-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f8f9fa;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .loading-container {
          text-align: center;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 90%;
        }
        
        .logo-container {
          margin-bottom: 1.5rem;
        }
        
        .logo {
          width: 120px;
          height: auto;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-size: 2rem;
        }
        
        p {
          color: #7f8c8d;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
        
        .loading-spinner {
          color: #3498db;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
