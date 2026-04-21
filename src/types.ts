export type Product = {
  id: string;
  name: string;
  price: number;
  clients: number;
};

export type FixedCost = {
  id: string;
  name: string;
  value: number;
};

/** Como os CNPJs entram ao longo do tempo nos gráficos de rampa. */
export type RampProgressMode = "mensal" | "bloco";

export type RampConfig = {
  /** Quantidade de pontos M1…Mn na linha do tempo (3–60). */
  horizonteMeses: number;
  modo: RampProgressMode;
  /** Modo mensal: quantos CNPJs novos a cada mês. */
  cnpjsPorMes: number;
  /** Modo bloco: quantos CNPJs a cada período. */
  cnpjsPorBloco: number;
  /** Modo bloco: duração do período em meses (ex.: 2 = a cada 2 meses). */
  mesesPorBloco: number;
};

export type SimulatorState = {
  mensalidade: number;
  clientes: number;
  consultoria: number;
  produtos: Product[];
  custosFixos: FixedCost[];
  custoNuvem: {
    base: number;
    incremento: number;
    clientesPorBloco: number;
  };
  imposto: number;
  proLabore: {
    socio1: number;
    socio2: number;
  };
  faixaClientesMaxima: number;
  /** Parâmetros da rampa de CNPJs (gráficos de aquisição). */
  rampa: RampConfig;
};

export type FinanceMetrics = {
  receitaTotal: number;
  receitaLiquida: number;
  custoTotal: number;
  lucroLiquido: number;
  breakEvenClientes: number | null;
  margemPercentual: number;
  custoFixoTotal: number;
  custoNuvem: number;
  proLaboreTotal: number;
};

export type SimulationRow = {
  clientes: number;
  receita: number;
  custo: number;
  lucro: number;
  margem: number;
};
