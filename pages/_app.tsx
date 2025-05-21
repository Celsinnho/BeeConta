// Configuração do projeto Next.js para ambiente de testes de interface
import React from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../packages/web/components/auth/AuthContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
