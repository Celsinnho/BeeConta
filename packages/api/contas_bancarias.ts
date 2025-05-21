import { supabaseClient, supabaseAdmin } from './supabase';
import { ContaBancaria, Banco, Moeda, RespostaAPI } from './tipos';

// Serviço para gerenciamento de contas bancárias
export const ServicoContaBancaria = {
  // Obter conta bancária por ID
  obterPorId: async (contaId: string): Promise<RespostaAPI<ContaBancaria>> => {
    try {
      const { data, error } = await supabaseClient
        .from('contas_bancarias')
        .select(`
          *,
          banco:banco_id (*),
          moeda:moeda_id (*)
        `)
        .eq('id', contaId)
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao obter conta bancária:', error);
      return { error: error as Error };
    }
  },
  
  // Listar contas bancárias de uma empresa
  listarContasEmpresa: async (empresaId: string): Promise<RespostaAPI<ContaBancaria[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('contas_bancarias')
        .select(`
          *,
          banco:banco_id (*),
          moeda:moeda_id (*)
        `)
        .eq('empresa_id', empresaId)
        .eq('status', 'ativa')
        .order('descricao', { ascending: true });
      
      if (error) throw error;
      
      return { data: data || [] };
    } catch (error) {
      console.error('Erro ao listar contas bancárias:', error);
      return { error: error as Error };
    }
  },
  
  // Criar nova conta bancária
  criarConta: async (conta: ContaBancaria): Promise<RespostaAPI<ContaBancaria>> => {
    try {
      const { data, error } = await supabaseClient
        .from('contas_bancarias')
        .insert({
          empresa_id: conta.empresa_id,
          banco_id: conta.banco_id,
          agencia: conta.agencia,
          conta: conta.conta,
          digito: conta.digito,
          tipo_conta: conta.tipo_conta,
          descricao: conta.descricao,
          saldo_inicial: conta.saldo_inicial,
          data_saldo_inicial: conta.data_saldo_inicial,
          moeda_id: conta.moeda_id,
          status: 'ativa'
        })
        .select(`
          *,
          banco:banco_id (*),
          moeda:moeda_id (*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao criar conta bancária:', error);
      return { error: error as Error };
    }
  },
  
  // Atualizar conta bancária existente
  atualizarConta: async (contaId: string, conta: ContaBancaria): Promise<RespostaAPI<ContaBancaria>> => {
    try {
      const { data, error } = await supabaseClient
        .from('contas_bancarias')
        .update({
          banco_id: conta.banco_id,
          agencia: conta.agencia,
          conta: conta.conta,
          digito: conta.digito,
          tipo_conta: conta.tipo_conta,
          descricao: conta.descricao,
          moeda_id: conta.moeda_id,
          status: conta.status
        })
        .eq('id', contaId)
        .select(`
          *,
          banco:banco_id (*),
          moeda:moeda_id (*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao atualizar conta bancária:', error);
      return { error: error as Error };
    }
  },
  
  // Excluir conta bancária (marcar como inativa)
  excluirConta: async (contaId: string): Promise<RespostaAPI<void>> => {
    try {
      const { error } = await supabaseClient
        .from('contas_bancarias')
        .update({ status: 'encerrada' })
        .eq('id', contaId);
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro ao excluir conta bancária:', error);
      return { error: error as Error };
    }
  },
  
  // Listar todos os bancos disponíveis
  listarBancos: async (): Promise<RespostaAPI<Banco[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('bancos')
        .select('*')
        .eq('status', 'ativo')
        .order('nome', { ascending: true });
      
      if (error) throw error;
      
      return { data: data || [] };
    } catch (error) {
      console.error('Erro ao listar bancos:', error);
      return { error: error as Error };
    }
  },
  
  // Listar todas as moedas disponíveis
  listarMoedas: async (): Promise<RespostaAPI<Moeda[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('moedas')
        .select('*')
        .eq('status', 'ativa')
        .order('nome', { ascending: true });
      
      if (error) throw error;
      
      return { data: data || [] };
    } catch (error) {
      console.error('Erro ao listar moedas:', error);
      return { error: error as Error };
    }
  }
};
