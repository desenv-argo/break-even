import type { SimulatorState } from "../types";
import { calculateCloudCost, calculateTotalFixedCost } from "./finance";

const round = (value: number): number => Math.round(value * 100) / 100;

const clampHorizonte = (n: number): number => Math.max(2, Math.min(60, Math.round(n)));

/** CNPJs ativos no fim do mês `mes` (1 = M1), respeitando a meta `state.clientes`. */
export function getClientesNaRampa(state: SimulatorState, mes: number): number {
  const target = Math.max(0, Math.round(state.clientes));
  if (target === 0) return 0;

  const m = Math.max(1, mes);
  const { rampa } = state;

  if (rampa.modo === "mensal") {
    const porMes = Math.max(0, rampa.cnpjsPorMes);
    return Math.min(target, m * porMes);
  }

  const mesesB = Math.max(1, Math.round(rampa.mesesPorBloco));
  const porPeriodo = Math.max(0, rampa.cnpjsPorBloco);
  return Math.min(target, porPeriodo * Math.floor(m / mesesB));
}

/** Ponto mensal na rampa de aquisição de CNPJs. */
export type AcquisitionTimelinePoint = {
  label: string;
  monthIndex: number;
  clientes: number;
  receitaSaas: number;
  receitaConsultoria: number;
  receitasProdutos: { label: string; value: number }[];
  receitaTotal: number;
  despesasFixas: { label: string; value: number }[];
  custoNuvem: number;
  proLabore: number;
  impostoValor: number;
  receitaLiquida: number;
  lucroLiquido: number;
  margemPct: number;
};

/**
 * Série temporal M1…Mn conforme `state.rampa` e meta `state.clientes`.
 * Consultoria e custos fixos em nível cheio desde o M1; SaaS/produtos escala com CNPJs ativos.
 */
export function generateAcquisitionTimeline(state: SimulatorState): AcquisitionTimelinePoint[] {
  const target = Math.max(0, Math.round(state.clientes));
  const n = clampHorizonte(state.rampa.horizonteMeses);
  const out: AcquisitionTimelinePoint[] = [];

  for (let mi = 0; mi < n; mi += 1) {
    const m = mi + 1;
    const clientes = getClientesNaRampa(state, m);
    const f = target > 0 ? Math.min(1, clientes / target) : 0;

    const receitaSaas = round(clientes * state.mensalidade);
    const receitaConsultoria = round(state.consultoria);
    const receitasProdutos = state.produtos.map((p) => ({
      label: p.name?.trim() || "Produto",
      value: round(p.price * p.clients * f),
    }));
    const receitaProdutosSum = receitasProdutos.reduce((acc, p) => acc + p.value, 0);
    const receitaTotal = round(receitaSaas + receitaConsultoria + receitaProdutosSum);

    const despesasFixas = state.custosFixos.map((c) => ({
      label: c.name?.trim() || "Custo fixo",
      value: round(c.value),
    }));
    const custoNuvem = round(calculateCloudCost(state, clientes));
    const proLabore = round(state.proLabore.socio1 + state.proLabore.socio2);
    const impostoValor = round(receitaTotal * (state.imposto / 100));
    const receitaLiquida = round(receitaTotal * (1 - state.imposto / 100));
    const custoFixoSum = round(calculateTotalFixedCost(state));
    const lucroLiquido = round(receitaLiquida - custoFixoSum - custoNuvem - proLabore);
    const margemPct = receitaTotal > 0 ? round((lucroLiquido / receitaTotal) * 100) : 0;

    out.push({
      label: `M${m} (${clientes} CNPJs)`,
      monthIndex: mi,
      clientes,
      receitaSaas,
      receitaConsultoria,
      receitasProdutos,
      receitaTotal,
      despesasFixas,
      custoNuvem,
      proLabore,
      impostoValor,
      receitaLiquida,
      lucroLiquido,
      margemPct,
    });
  }

  return out;
}
