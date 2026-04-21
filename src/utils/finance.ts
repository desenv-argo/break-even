import type { FinanceMetrics, SimulationRow, SimulatorState } from "../types";

const currencyRound = (value: number): number => Math.round(value * 100) / 100;

export const calculateRevenueTotal = (
  state: SimulatorState,
  clientsOverride?: number,
): number => {
  const clientes = clientsOverride ?? state.clientes;
  const receitaSaas = clientes * state.mensalidade;
  const receitaProdutos = state.produtos.reduce(
    (acc, product) => acc + product.price * product.clients,
    0,
  );
  return receitaSaas + state.consultoria + receitaProdutos;
};

export const calculateCloudCost = (
  state: SimulatorState,
  clientsOverride?: number,
): number => {
  const clientes = clientsOverride ?? state.clientes;
  const safeBlock = Math.max(1, state.custoNuvem.clientesPorBloco);
  const blocos = Math.floor(clientes / safeBlock);
  return state.custoNuvem.base + blocos * state.custoNuvem.incremento;
};

export const calculateTotalFixedCost = (state: SimulatorState): number =>
  state.custosFixos.reduce((acc, cost) => acc + cost.value, 0);

export const calculateMetrics = (
  state: SimulatorState,
  clientsOverride?: number,
): FinanceMetrics => {
  const receitaTotal = calculateRevenueTotal(state, clientsOverride);
  const receitaLiquida = receitaTotal * (1 - state.imposto / 100);
  const custoFixoTotal = calculateTotalFixedCost(state);
  const custoNuvem = calculateCloudCost(state, clientsOverride);
  const custoTotal = custoFixoTotal + custoNuvem;
  const proLaboreTotal = state.proLabore.socio1 + state.proLabore.socio2;
  const lucroLiquido = receitaLiquida - custoTotal - proLaboreTotal;
  const margemPercentual = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

  const simulation = generateSimulation(state);
  const breakEvenRow = simulation.find((row) => row.lucro >= 0);

  return {
    receitaTotal: currencyRound(receitaTotal),
    receitaLiquida: currencyRound(receitaLiquida),
    custoTotal: currencyRound(custoTotal),
    lucroLiquido: currencyRound(lucroLiquido),
    breakEvenClientes: breakEvenRow ? breakEvenRow.clientes : null,
    margemPercentual: currencyRound(margemPercentual),
    custoFixoTotal: currencyRound(custoFixoTotal),
    custoNuvem: currencyRound(custoNuvem),
    proLaboreTotal: currencyRound(proLaboreTotal),
  };
};

export const generateSimulation = (state: SimulatorState): SimulationRow[] => {
  const rows: SimulationRow[] = [];
  for (let clients = 0; clients <= state.faixaClientesMaxima; clients += 1) {
    const receita = calculateRevenueTotal(state, clients);
    const receitaLiquida = receita * (1 - state.imposto / 100);
    const custo = calculateCloudCost(state, clients) + calculateTotalFixedCost(state);
    const lucro = receitaLiquida - custo - (state.proLabore.socio1 + state.proLabore.socio2);
    rows.push({
      clientes: clients,
      receita: currencyRound(receita),
      custo: currencyRound(custo),
      lucro: currencyRound(lucro),
      margem: receita > 0 ? currencyRound((lucro / receita) * 100) : 0,
    });
  }
  return rows;
};
