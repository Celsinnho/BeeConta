import { supabaseClient, supabaseAdmin } from './supabase';
import { Transacao, Categoria, RespostaAPI } from './tipos';

// Serviço para gerenciamento de transações financeiras
export const ServicoTransacao = {
  // Obter transação por ID
  obterPorId: async (transacaoId: string): Promise<RespostaAPI<Transacao>> => {
    try {
      const { data, error } = await supabaseClient
        .from('transacoes')
        .select(`
          *,
          conta_bancaria:conta_bancaria_id (*),
          cartao_credito:cartao_credito_id (*),
          categoria:categoria_id (*)
        `)
        .eq('id', transacaoId)
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao obter transação:', error);
      return { error: error as Error };
    }
  },
  
  // Listar transações de uma empresa
  listarTransacoesEmpresa: async (
    empresaId: string, 
    filtros: {
      dataInicio?: string;
      dataFim?: string;
      tipo?: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA';
      contaBancariaId?: string;
      cartaoCreditoId?: string;
      categoriaId?: string;
      status?: 'pendente' | 'efetivada' | 'cancelada';
    } = {}
  ): Promise<RespostaAPI<Transacao[]>> => {
    try {
      let query = supabaseClient
        .from('transacoes')
        .select(`
          *,
          conta_bancaria:conta_bancaria_id (*),
          cartao_credito:cartao_credito_id (*),
          categoria:categoria_id (*)
        `)
        .eq('empresa_id', empresaId)
        .order('data_transacao', { ascending: false });
      
      // Aplicar filtros
      if (filtros.dataInicio) {
        query = query.gte('data_transacao', filtros.dataInicio);
      }
      
      if (filtros.dataFim) {
        query = query.lte('data_transacao', filtros.dataFim);
      }
      
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      
      if (filtros.contaBancariaId) {
        query = query.eq('conta_bancaria_id', filtros.contaBancariaId);
      }
      
      if (filtros.cartaoCreditoId) {
        query = query.eq('cartao_credito_id', filtros.cartaoCreditoId);
      }
      
      if (filtros.categoriaId) {
        query = query.eq('categoria_id', filtros.categoriaId);
      }
      
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { data: data || [] };
    } catch (error) {
      console.error('Erro ao listar transações:', error);
      return { error: error as Error };
    }
  },
  
  // Criar nova transação
  criarTransacao: async (transacao: Transacao): Promise<RespostaAPI<Transacao>> => {
    try {
      const { data, error } = await supabaseClient
        .from('transacoes')
        .insert({
          empresa_id: transacao.empresa_id,
          tipo: transacao.tipo,
          descricao: transacao.descricao,
          valor: transacao.valor,
          data_transacao: transacao.data_transacao,
          data_competencia: transacao.data_competencia,
          conta_bancaria_id: transacao.conta_bancaria_id,
          cartao_credito_id: transacao.cartao_credito_id,
          categoria_id: transacao.categoria_id,
          status: transacao.status || 'pendente',
          recorrente: transacao.recorrente || false,
          parcela_atual: transacao.parcela_atual,
          total_parcelas: transacao.total_parcelas,
          transacao_pai_id: transacao.transacao_pai_id,
          observacoes: transacao.observacoes,
          anexos: transacao.anexos
        })
        .select(`
          *,
          conta_bancaria:conta_bancaria_id (*),
          cartao_credito:cartao_credito_id (*),
          categoria:categoria_id (*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return { error: error as Error };
    }
  },
  
  // Atualizar transação existente
  atualizarTransacao: async (transacaoId: string, transacao: Transacao): Promise<RespostaAPI<Transacao>> => {
    try {
      const { data, error } = await supabaseClient
        .from('transacoes')
        .update({
          tipo: transacao.tipo,
          descricao: transacao.descricao,
          valor: transacao.valor,
          data_transacao: transacao.data_transacao,
          data_competencia: transacao.data_competencia,
          conta_bancaria_id: transacao.conta_bancaria_id,
          cartao_credito_id: transacao.cartao_credito_id,
          categoria_id: transacao.categoria_id,
          status: transacao.status,
          recorrente: transacao.recorrente,
          parcela_atual: transacao.parcela_atual,
          total_parcelas: transacao.total_parcelas,
          observacoes: transacao.observacoes,
          anexos: transacao.anexos
        })
        .eq('id', transacaoId)
        .select(`
          *,
          conta_bancaria:conta_bancaria_id (*),
          cartao_credito:cartao_credito_id (*),
          categoria:categoria_id (*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return { error: error as Error };
    }
  },
  
  // Excluir transação (marcar como cancelada)
  excluirTransacao: async (transacaoId: string): Promise<RespostaAPI<void>> => {
    try {
      const { error } = await supabaseClient
        .from('transacoes')
        .update({ status: 'cancelada' })
        .eq('id', transacaoId);
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      return { error: error as Error };
    }
  },
  
  // Listar categorias de uma empresa
  listarCategoriasEmpresa: async (empresaId: string, tipo?: 'RECEITA' | 'DESPESA' | 'AMBOS'): Promise<RespostaAPI<Categoria[]>> => {
    try {
      let query = supabaseClient
        .from('categorias')
        .select(`
          *,
          categoria_pai:categoria_pai_id (*)
        `)
        .eq('status', 'ativa')
        .or(`empresa_id.eq.${empresaId},empresa_id.is.null`);
      
      if (tipo) {
        query = query.or(`tipo.eq.${tipo},tipo.eq.AMBOS`);
      }
      
      const { data, error } = await query.order('nome', { ascending: true });
      
      if (error) throw error;
      
      return { data: data || [] };
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      return { error: error as Error };
    }
  },
  
  // Criar nova categoria
  criarCategoria: async (categoria: Categoria): Promise<RespostaAPI<Categoria>> => {
    try {
      const { data, error } = await supabaseClient
        .from('categorias')
        .insert({
          empresa_id: categoria.empresa_id,
          nome: categoria.nome,
          tipo: categoria.tipo,
          cor: categoria.cor,
          icone: categoria.icone,
          categoria_pai_id: categoria.categoria_pai_id,
          status: 'ativa'
        })
        .select(`
          *,
          categoria_pai:categoria_pai_id (*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return { error: error as Error };
    }
  }
};

// Serviço para relatórios financeiros
export const ServicoRelatorio = {
  // Obter resumo financeiro de uma empresa
  obterResumoFinanceiro: async (
    empresaId: string,
    mesAtual: string, // Formato: YYYY-MM
    mesAnterior: string // Formato: YYYY-MM
  ): Promise<RespostaAPI<any>> => {
    try {
      // Obter saldo total das contas bancárias
      const { data: contas, error: erroContas } = await supabaseClient
        .from('contas_bancarias')
        .select('saldo_inicial')
        .eq('empresa_id', empresaId)
        .eq('status', 'ativa');
      
      if (erroContas) throw erroContas;
      
      const saldoTotal = (contas || []).reduce((total, conta) => total + (conta.saldo_inicial || 0), 0);
      
      // Obter receitas e despesas do mês atual
      const dataInicioMesAtual = `${mesAtual}-01`;
      const dataFimMesAtual = `${mesAtual}-31`;
      
      const { data: transacoesMesAtual, error: erroTransacoesMesAtual } = await supabaseClient
        .from('transacoes')
        .select('tipo, valor')
        .eq('empresa_id', empresaId)
        .eq('status', 'efetivada')
        .gte('data_transacao', dataInicioMesAtual)
        .lte('data_transacao', dataFimMesAtual);
      
      if (erroTransacoesMesAtual) throw erroTransacoesMesAtual;
      
      const receitasMesAtual = (transacoesMesAtual || [])
        .filter(t => t.tipo === 'RECEITA')
        .reduce((total, t) => total + (t.valor || 0), 0);
      
      const despesasMesAtual = (transacoesMesAtual || [])
        .filter(t => t.tipo === 'DESPESA')
        .reduce((total, t) => total + (t.valor || 0), 0);
      
      const saldoMesAtual = receitasMesAtual - despesasMesAtual;
      
      // Obter receitas e despesas do mês anterior
      const dataInicioMesAnterior = `${mesAnterior}-01`;
      const dataFimMesAnterior = `${mesAnterior}-31`;
      
      const { data: transacoesMesAnterior, error: erroTransacoesMesAnterior } = await supabaseClient
        .from('transacoes')
        .select('tipo, valor')
        .eq('empresa_id', empresaId)
        .eq('status', 'efetivada')
        .gte('data_transacao', dataInicioMesAnterior)
        .lte('data_transacao', dataFimMesAnterior);
      
      if (erroTransacoesMesAnterior) throw erroTransacoesMesAnterior;
      
      const receitasMesAnterior = (transacoesMesAnterior || [])
        .filter(t => t.tipo === 'RECEITA')
        .reduce((total, t) => total + (t.valor || 0), 0);
      
      const despesasMesAnterior = (transacoesMesAnterior || [])
        .filter(t => t.tipo === 'DESPESA')
        .reduce((total, t) => total + (t.valor || 0), 0);
      
      const saldoMesAnterior = receitasMesAnterior - despesasMesAnterior;
      
      // Calcular variações
      const variacaoReceitas = receitasMesAnterior > 0 
        ? ((receitasMesAtual - receitasMesAnterior) / receitasMesAnterior) * 100 
        : 100;
      
      const variacaoDespesas = despesasMesAnterior > 0 
        ? ((despesasMesAtual - despesasMesAnterior) / despesasMesAnterior) * 100 
        : 100;
      
      const variacaoSaldo = saldoMesAnterior > 0 
        ? ((saldoMesAtual - saldoMesAnterior) / saldoMesAnterior) * 100 
        : 100;
      
      return {
        data: {
          saldo_total: saldoTotal,
          receitas_mes_atual: receitasMesAtual,
          despesas_mes_atual: despesasMesAtual,
          saldo_mes_atual: saldoMesAtual,
          receitas_mes_anterior: receitasMesAnterior,
          despesas_mes_anterior: despesasMesAnterior,
          saldo_mes_anterior: saldoMesAnterior,
          variacao_receitas: variacaoReceitas,
          variacao_despesas: variacaoDespesas,
          variacao_saldo: variacaoSaldo
        }
      };
    } catch (error) {
      console.error('Erro ao obter resumo financeiro:', error);
      return { error: error as Error };
    }
  }
};
