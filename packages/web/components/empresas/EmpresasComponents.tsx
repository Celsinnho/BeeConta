import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../auth/AuthContext';
import { ServicoEmpresa, Empresa } from '../../../api/empresas';
import { ServicoGrupoEconomico, GrupoEconomico } from '../../../api/empresas';

// Componente de listagem de empresas
export const ListaEmpresas = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const carregarEmpresas = async () => {
      if (usuario) {
        setCarregando(true);
        const { data, error } = await ServicoEmpresa.listarEmpresasUsuario(usuario.id);
        if (error) {
          console.error('Erro ao carregar empresas:', error);
        } else {
          setEmpresas(data || []);
        }
        setCarregando(false);
      }
    };

    carregarEmpresas();
  }, [usuario]);

  const navegarParaDetalhes = (id: string) => {
    router.push(`/empresas/${id}`);
  };

  if (carregando) {
    return <div>Carregando empresas...</div>;
  }

  return (
    <div className="lista-empresas">
      <h2>Minhas Empresas</h2>
      {empresas.length === 0 ? (
        <p>Nenhuma empresa encontrada.</p>
      ) : (
        <div className="grid-empresas">
          {empresas.map((empresa) => (
            <div 
              key={empresa.id} 
              className="card-empresa"
              onClick={() => navegarParaDetalhes(empresa.id)}
            >
              {empresa.url_logo ? (
                <img src={empresa.url_logo} alt={empresa.nome} className="logo-empresa" />
              ) : (
                <div className="logo-placeholder">{empresa.nome.charAt(0)}</div>
              )}
              <h3>{empresa.nome}</h3>
              <p>{empresa.nome_fantasia || ''}</p>
              <p className="documento">{empresa.cnpj_cpf}</p>
            </div>
          ))}
        </div>
      )}
      <button 
        className="botao-adicionar"
        onClick={() => router.push('/empresas/nova')}
      >
        Adicionar Empresa
      </button>
    </div>
  );
};

// Tipo para o formulário de empresa
type FormularioEmpresaState = {
  nome: string;
  nome_fantasia?: string;
  cnpj_cpf: string;
  tipo_documento: string;
  regime_tributario?: string;
  endereco?: any;
  contato?: any;
};

// Componente de formulário de empresa
export const FormularioEmpresa = ({ empresaId = null }) => {
  const [empresa, setEmpresa] = useState<FormularioEmpresaState>({
    nome: '',
    nome_fantasia: '',
    cnpj_cpf: '',
    tipo_documento: 'CNPJ',
    regime_tributario: 'SIMPLES',
    endereco: {},
    contato: {}
  });
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const carregarEmpresa = async () => {
      if (empresaId && usuario) {
        setCarregando(true);
        const { data, error } = await ServicoEmpresa.obterPorId(empresaId);
        if (error) {
          console.error('Erro ao carregar empresa:', error);
        } else if (data) {
          // Converter o tipo Empresa para FormularioEmpresaState
          const empresaForm: FormularioEmpresaState = {
            nome: data.nome,
            nome_fantasia: data.nome_fantasia || '',
            cnpj_cpf: data.cnpj_cpf,
            tipo_documento: data.tipo_documento,
            regime_tributario: data.regime_tributario || 'SIMPLES',
            endereco: data.endereco || {},
            contato: data.contato || {}
          };
          setEmpresa(empresaForm);
        }
        setCarregando(false);
      }
    };

    carregarEmpresa();
  }, [empresaId, usuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmpresa(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setSalvando(true);
    let resultado;

    if (empresaId) {
      // Atualizar empresa existente
      resultado = await ServicoEmpresa.atualizarEmpresa(empresaId, empresa as Empresa, usuario.id);
    } else {
      // Criar nova empresa
      resultado = await ServicoEmpresa.criarEmpresa(empresa as Empresa, usuario.id);
    }

    setSalvando(false);

    if (resultado.error) {
      console.error('Erro ao salvar empresa:', resultado.error);
      alert('Erro ao salvar empresa. Por favor, tente novamente.');
    } else {
      router.push('/empresas');
    }
  };

  if (carregando) {
    return <div>Carregando dados da empresa...</div>;
  }

  return (
    <div className="formulario-empresa">
      <h2>{empresaId ? 'Editar Empresa' : 'Nova Empresa'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo-formulario">
          <label htmlFor="nome">Razão Social *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={empresa.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="nome_fantasia">Nome Fantasia</label>
          <input
            type="text"
            id="nome_fantasia"
            name="nome_fantasia"
            value={empresa.nome_fantasia || ''}
            onChange={handleChange}
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="tipo_documento">Tipo de Documento *</label>
          <select
            id="tipo_documento"
            name="tipo_documento"
            value={empresa.tipo_documento}
            onChange={handleChange}
            required
          >
            <option value="CNPJ">CNPJ</option>
            <option value="CPF">CPF</option>
          </select>
        </div>

        <div className="campo-formulario">
          <label htmlFor="cnpj_cpf">Número do Documento *</label>
          <input
            type="text"
            id="cnpj_cpf"
            name="cnpj_cpf"
            value={empresa.cnpj_cpf}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="regime_tributario">Regime Tributário</label>
          <select
            id="regime_tributario"
            name="regime_tributario"
            value={empresa.regime_tributario || 'SIMPLES'}
            onChange={handleChange}
          >
            <option value="SIMPLES">Simples Nacional</option>
            <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
            <option value="LUCRO_REAL">Lucro Real</option>
          </select>
        </div>

        <div className="acoes-formulario">
          <button 
            type="button" 
            className="botao-cancelar"
            onClick={() => router.push('/empresas')}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="botao-salvar"
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Tipo para o formulário de grupo econômico
type FormularioGrupoEconomicoState = {
  nome: string;
  descricao?: string;
};

// Componente de listagem de grupos econômicos
export const ListaGruposEconomicos = () => {
  const [grupos, setGrupos] = useState<GrupoEconomico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const carregarGrupos = async () => {
      if (usuario) {
        setCarregando(true);
        const { data, error } = await ServicoGrupoEconomico.listarGruposUsuario(usuario.id);
        if (error) {
          console.error('Erro ao carregar grupos econômicos:', error);
        } else {
          setGrupos(data || []);
        }
        setCarregando(false);
      }
    };

    carregarGrupos();
  }, [usuario]);

  const navegarParaDetalhes = (id: string) => {
    router.push(`/grupos-economicos/${id}`);
  };

  if (carregando) {
    return <div>Carregando grupos econômicos...</div>;
  }

  return (
    <div className="lista-grupos">
      <h2>Meus Grupos Econômicos</h2>
      {grupos.length === 0 ? (
        <p>Nenhum grupo econômico encontrado.</p>
      ) : (
        <div className="grid-grupos">
          {grupos.map((grupo) => (
            <div 
              key={grupo.id} 
              className="card-grupo"
              onClick={() => navegarParaDetalhes(grupo.id)}
            >
              {grupo.url_logo ? (
                <img src={grupo.url_logo} alt={grupo.nome} className="logo-grupo" />
              ) : (
                <div className="logo-placeholder">{grupo.nome.charAt(0)}</div>
              )}
              <h3>{grupo.nome}</h3>
              <p>{grupo.descricao || ''}</p>
            </div>
          ))}
        </div>
      )}
      <button 
        className="botao-adicionar"
        onClick={() => router.push('/grupos-economicos/novo')}
      >
        Adicionar Grupo Econômico
      </button>
    </div>
  );
};

// Componente de formulário de grupo econômico
export const FormularioGrupoEconomico = ({ grupoId = null }) => {
  const [grupo, setGrupo] = useState<FormularioGrupoEconomicoState>({
    nome: '',
    descricao: '',
  });
  const [empresasDisponiveis, setEmpresasDisponiveis] = useState<Empresa[]>([]);
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<Empresa[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const carregarDados = async () => {
      if (usuario) {
        setCarregando(true);
        
        // Carregar empresas disponíveis
        const { data: empresas } = await ServicoEmpresa.listarEmpresasUsuario(usuario.id);
        setEmpresasDisponiveis(empresas || []);
        
        // Se for edição, carregar dados do grupo
        if (grupoId) {
          const { data: grupoData } = await ServicoGrupoEconomico.obterPorId(grupoId);
          if (grupoData) {
            // Converter o tipo GrupoEconomico para FormularioGrupoEconomicoState
            const grupoForm: FormularioGrupoEconomicoState = {
              nome: grupoData.nome,
              descricao: grupoData.descricao || '',
            };
            setGrupo(grupoForm);
            
            // Carregar empresas do grupo
            const { data: associacoesEmpresaGrupo } = await ServicoGrupoEconomico.listarEmpresasGrupo(grupoId);
            
            // Extrair apenas as empresas das associações
            if (associacoesEmpresaGrupo && associacoesEmpresaGrupo.length > 0) {
              const empresasDoGrupo = associacoesEmpresaGrupo
                .filter(associacao => associacao.empresa) // Garantir que a empresa existe
                .map(associacao => ({
                  ...associacao.empresa,
                  empresa_principal: associacao.empresa_principal
                }));
              
              setEmpresasSelecionadas(empresasDoGrupo as Empresa[]);
            }
          }
        }
        
        setCarregando(false);
      }
    };

    carregarDados();
  }, [grupoId, usuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGrupo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleEmpresa = (empresa: Empresa) => {
    const jaExiste = empresasSelecionadas.some(e => e.id === empresa.id);
    
    if (jaExiste) {
      setEmpresasSelecionadas(prev => prev.filter(e => e.id !== empresa.id));
    } else {
      setEmpresasSelecionadas(prev => [...prev, empresa]);
    }
  };

  const definirEmpresaPrincipal = (empresaId: string) => {
    setEmpresasSelecionadas(prev => 
      prev.map(empresa => ({
        ...empresa,
        empresa_principal: empresa.id === empresaId
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setSalvando(true);
    let resultado;

    try {
      if (grupoId) {
        // Atualizar grupo existente
        resultado = await ServicoGrupoEconomico.atualizarGrupo(grupoId, grupo as GrupoEconomico, usuario.id);
      } else {
        // Criar novo grupo
        resultado = await ServicoGrupoEconomico.criarGrupo(grupo as GrupoEconomico, usuario.id);
      }

      if (resultado.error) {
        throw new Error(resultado.error.message);
      }

      const novoGrupoId = resultado.data.id;
      
      // Associar empresas ao grupo
      for (const empresa of empresasSelecionadas) {
        await ServicoGrupoEconomico.adicionarEmpresaAoGrupo(
          novoGrupoId || grupoId,
          empresa.id,
          empresa.empresa_principal || false
        );
      }

      router.push('/grupos-economicos');
    } catch (error) {
      console.error('Erro ao salvar grupo econômico:', error);
      alert('Erro ao salvar grupo econômico. Por favor, tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <div>Carregando dados...</div>;
  }

  return (
    <div className="formulario-grupo">
      <h2>{grupoId ? 'Editar Grupo Econômico' : 'Novo Grupo Econômico'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo-formulario">
          <label htmlFor="nome">Nome do Grupo *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={grupo.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={grupo.descricao || ''}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="secao-empresas">
          <h3>Empresas do Grupo</h3>
          
          <div className="lista-selecao-empresas">
            {empresasDisponiveis.length === 0 ? (
              <p>Nenhuma empresa disponível. Crie empresas primeiro.</p>
            ) : (
              empresasDisponiveis.map(empresa => {
                const selecionada = empresasSelecionadas.some(e => e.id === empresa.id);
                const principal = empresasSelecionadas.find(e => e.id === empresa.id)?.empresa_principal;
                
                return (
                  <div key={empresa.id} className={`item-empresa ${selecionada ? 'selecionada' : ''}`}>
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        id={`empresa-${empresa.id}`}
                        checked={selecionada}
                        onChange={() => toggleEmpresa(empresa)}
                      />
                      <label htmlFor={`empresa-${empresa.id}`}>{empresa.nome}</label>
                    </div>
                    
                    {selecionada && (
                      <div className="opcoes-empresa">
                        <label>
                          <input
                            type="radio"
                            name="empresa_principal"
                            checked={principal}
                            onChange={() => definirEmpresaPrincipal(empresa.id)}
                          />
                          Empresa Principal
                        </label>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="acoes-formulario">
          <button 
            type="button" 
            className="botao-cancelar"
            onClick={() => router.push('/grupos-economicos')}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="botao-salvar"
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};
