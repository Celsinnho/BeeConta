// Script para testar a estrutura de dados retornada pelo Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuração do cliente Supabase
const supabaseUrl = 'https://igkgkyvwymjamexlqyic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2dreXZ3eW1qYW1leGxxeWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzA5MzcsImV4cCI6MjA2MzQwNjkzN30.ZELe85oTfWsc1FkQbvgr6Co9GPXBivn8DTfDLhYSlh0';

// Cliente para uso em componentes do cliente (com chave anônima)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a estrutura de acessos de usuário a empresas
async function testarEstruturaAcessos() {
  try {
    // Criar um usuário de teste temporário se necessário
    const usuarioId = '00000000-0000-0000-0000-000000000000'; // ID fictício para teste
    
    console.log('Testando estrutura de acessos_usuario_empresa...');
    const { data: acessosDiretos, error: erroDireto } = await supabase
      .from('acessos_usuario_empresa')
      .select(`
        empresa_id,
        nivel_acesso,
        empresas:empresa_id (
          id,
          nome,
          nome_fantasia,
          url_logo,
          status
        )
      `)
      .limit(1);
    
    if (erroDireto) {
      console.error('Erro ao obter acessos:', erroDireto);
    } else {
      console.log('Estrutura de acessosDiretos:', JSON.stringify(acessosDiretos, null, 2));
      
      if (acessosDiretos && acessosDiretos.length > 0) {
        console.log('Tipo de acessosDiretos:', typeof acessosDiretos);
        console.log('É array?', Array.isArray(acessosDiretos));
        
        const primeiroAcesso = acessosDiretos[0];
        console.log('Tipo de primeiroAcesso.empresas:', typeof primeiroAcesso.empresas);
        console.log('primeiroAcesso.empresas é array?', Array.isArray(primeiroAcesso.empresas));
        
        if (primeiroAcesso.empresas) {
          console.log('Estrutura de primeiroAcesso.empresas:', JSON.stringify(primeiroAcesso.empresas, null, 2));
        }
      }
    }
    
    return { acessosDiretos };
  } catch (erro) {
    console.error('Erro geral ao testar estrutura:', erro);
    return { erro };
  }
}

// Exportar a função para uso externo
module.exports = {
  testarEstruturaAcessos
};

// Executar o teste se for chamado diretamente
if (require.main === module) {
  testarEstruturaAcessos().then(() => {
    console.log('Teste concluído.');
  });
}
