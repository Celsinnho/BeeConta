import { supabaseClient, supabaseAdmin } from './supabase';
import { CartaoCredito, Banco, Moeda, RespostaAPI } from './tipos';

// Serviço para gerenciamento de cartões de crédito
export const ServicoCartaoCredito = {
  // Obter cartão de crédito por ID
  obterPorId: async (cartaoId: string): Promise<RespostaAPI<CartaoCredito>> => {
    try {
      const { data, error } = await supabaseClient
        .from('cartoes_credito')
        .select(`
          *,
          banco:banco_id (*),
          moeda:moeda_id (*)
        `)
        .eq('id', cartaoId)
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao obter cartão de crédito:', error);
      return { error: error as Error };
    }
  },
  
  // Listar cartões de crédito de uma empresa
  listarCartoesEmpresa: async (empresaId: string): Promise<RespostaAPI<CartaoCredito[]>> => {
    try {
      const { data, error } = await supabaseClient
        .from('cartoes_credito')
        .select(`
          *,
          banco:banco_id (*),
          moeda:moeda_id (*)
        `)
        .eq('empresa_id', empresaId)
        .eq('status', 'ativo')
        .order('descricao', { ascending: true });
      
      if (error) throw error;
      
      return { data: data || [] };
    } catch (error) {
      console.error('Erro ao listar cartões de crédito:', error);
      return { error: error as Error };
    }
  },
  
  // Criar novo cartão de crédito
  criarCartao: async (cartao: CartaoCredito): Promise<RespostaAPI<CartaoCredito>> => {
    try {
      const { data, error } = await supabaseClient
        .from('cartoes_credito')
        .insert({
          empresa_id: cartao.empresa_id,
          banco_id: cartao.banco_id,
          descricao: cartao.descricao,
          bandeira: cartao.bandeira,
          ultimos_digitos: cartao.ultimos_digitos,
          nome_titular: cartao.nome_titular,
          data_fechamento: cartao.data_fechamento,
          data_vencimento: cartao.data_vencimento,
          limite: cartao.limite,
          moeda_id: cartao.moeda_id,
          internacional: cartao.internacional,
          status: 'ativo'
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
      console.error('Erro ao criar cartão de crédito:', error);
      return { error: error as Error };
    }
  },
  
  // Atualizar cartão de crédito existente
  atualizarCartao: async (cartaoId: string, cartao: CartaoCredito): Promise<RespostaAPI<CartaoCredito>> => {
    try {
      const { data, error } = await supabaseClient
        .from('cartoes_credito')
        .update({
          banco_id: cartao.banco_id,
          descricao: cartao.descricao,
          bandeira: cartao.bandeira,
          ultimos_digitos: cartao.ultimos_digitos,
          nome_titular: cartao.nome_titular,
          data_fechamento: cartao.data_fechamento,
          data_vencimento: cartao.data_vencimento,
          limite: cartao.limite,
          moeda_id: cartao.moeda_id,
          internacional: cartao.internacional,
          status: cartao.status
        })
        .eq('id', cartaoId)
        .select(`
          *,
          banco:banco_id (*),
          moeda:moeda_id (*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data };
    } catch (error) {
      console.error('Erro ao atualizar cartão de crédito:', error);
      return { error: error as Error };
    }
  },
  
  // Excluir cartão de crédito (marcar como inativo)
  excluirCartao: async (cartaoId: string): Promise<RespostaAPI<void>> => {
    try {
      const { error } = await supabaseClient
        .from('cartoes_credito')
        .update({ status: 'cancelado' })
        .eq('id', cartaoId);
      
      if (error) throw error;
      
      return {};
    } catch (error) {
      console.error('Erro ao excluir cartão de crédito:', error);
      return { error: error as Error };
    }
  }
};
