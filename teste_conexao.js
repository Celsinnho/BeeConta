// Teste de conexão com o Supabase
import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = 'https://igkgkyvwymjamexlqyic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2dreXZ3eW1qYW1leGxxeWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzA5MzcsImV4cCI6MjA2MzQwNjkzN30.ZELe85oTfWsc1FkQbvgr6Co9GPXBivn8DTfDLhYSlh0';

// Cliente para uso em componentes do cliente (com chave anônima)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função principal para testar a conexão
async function testarConexao() {
  console.log('Iniciando teste de conexão com o Supabase...');
  
  try {
    // Teste 1: Verificar se conseguimos acessar a tabela de empresas
    console.log('\n--- Teste 1: Acessando tabela de empresas ---');
    const { data: empresas, error: erroEmpresas } = await supabase
      .from('empresas')
      .select('*')
      .limit(5);
    
    if (erroEmpresas) {
      console.error('Erro ao acessar tabela de empresas:', erroEmpresas);
    } else {
      console.log(`Sucesso! Encontradas ${empresas.length} empresas.`);
      console.log('Exemplo de dados:', empresas);
    }
    
    // Teste 2: Verificar se conseguimos acessar a tabela de bancos
    console.log('\n--- Teste 2: Acessando tabela de bancos ---');
    const { data: bancos, error: erroBancos } = await supabase
      .from('bancos')
      .select('*')
      .limit(5);
    
    if (erroBancos) {
      console.error('Erro ao acessar tabela de bancos:', erroBancos);
    } else {
      console.log(`Sucesso! Encontrados ${bancos.length} bancos.`);
      console.log('Exemplo de dados:', bancos);
    }
    
    // Teste 3: Verificar se conseguimos acessar a tabela de moedas
    console.log('\n--- Teste 3: Acessando tabela de moedas ---');
    const { data: moedas, error: erroMoedas } = await supabase
      .from('moedas')
      .select('*')
      .limit(5);
    
    if (erroMoedas) {
      console.error('Erro ao acessar tabela de moedas:', erroMoedas);
    } else {
      console.log(`Sucesso! Encontradas ${moedas.length} moedas.`);
      console.log('Exemplo de dados:', moedas);
    }
    
    // Teste 4: Verificar se conseguimos acessar a tabela de usuários
    console.log('\n--- Teste 4: Acessando tabela de usuários ---');
    const { data: usuarios, error: erroUsuarios } = await supabase
      .from('usuarios')
      .select('*')
      .limit(5);
    
    if (erroUsuarios) {
      console.error('Erro ao acessar tabela de usuários:', erroUsuarios);
    } else {
      console.log(`Sucesso! Encontrados ${usuarios.length} usuários.`);
      console.log('Exemplo de dados:', usuarios);
    }
    
    // Resumo dos testes
    console.log('\n--- Resumo dos testes ---');
    console.log('Teste 1 (empresas):', erroEmpresas ? 'FALHA' : 'SUCESSO');
    console.log('Teste 2 (bancos):', erroBancos ? 'FALHA' : 'SUCESSO');
    console.log('Teste 3 (moedas):', erroMoedas ? 'FALHA' : 'SUCESSO');
    console.log('Teste 4 (usuários):', erroUsuarios ? 'FALHA' : 'SUCESSO');
    
    // Verificar se todos os testes foram bem-sucedidos
    if (!erroEmpresas && !erroBancos && !erroMoedas && !erroUsuarios) {
      console.log('\nTodos os testes foram bem-sucedidos! A conexão com o Supabase está funcionando corretamente.');
    } else {
      console.log('\nAlguns testes falharam. Verifique os erros acima.');
    }
    
  } catch (erro) {
    console.error('Erro geral ao testar conexão:', erro);
  }
}

// Executar o teste
testarConexao();
