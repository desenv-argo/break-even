import type { SimulatorState } from "../types";
import { calculateTotalFixedCost } from "./finance";

const round = (value: number): number => Math.round(value * 100) / 100;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export type MemoryItem = {
  label: string;
  detail?: string;
  /** Valor em R$, quando aplicável */
  amount?: number;
  /** Texto exibido no lugar do amount (ex.: margem %) */
  valueText?: string;
  /** Destaque visual (totais finais) */
  emphasis?: "strong";
};

export type MemorySection = {
  title: string;
  items: MemoryItem[];
};

/**
 * Monta a memória de cálculo da linha da simulação para `clientes` fixos,
 * alinhada às fórmulas de `generateSimulation` em `finance.ts`.
 */
export function buildCalculationBreakdown(state: SimulatorState, clientes: number): MemorySection[] {
  const c = clientes;
  const receitaSaas = round(c * state.mensalidade);
  const receitaConsultoria = round(state.consultoria);

  const produtoItems: MemoryItem[] = state.produtos.map((p) => {
    const nome = p.name?.trim() || "Produto";
    const valor = round(p.price * p.clients);
    return {
      label: `Produto: ${nome}`,
      detail: `${p.clients} assinaturas × ${formatCurrency(p.price)}`,
      amount: valor,
    };
  });
  const receitaProdutosSum = round(produtoItems.reduce((acc, item) => acc + (item.amount ?? 0), 0));

  const receitaBruta = round(receitaSaas + receitaConsultoria + receitaProdutosSum);

  const impostoPct = state.imposto;
  const impostoValor = round(receitaBruta * (impostoPct / 100));
  const receitaLiquida = round(receitaBruta * (1 - impostoPct / 100));

  const safeBlock = Math.max(1, state.custoNuvem.clientesPorBloco);
  const blocos = Math.floor(c / safeBlock);
  const custoNuvem = round(state.custoNuvem.base + blocos * state.custoNuvem.incremento);

  const custoFixoItems: MemoryItem[] = state.custosFixos.map((x) => ({
    label: `Fixo: ${x.name?.trim() || "Item"}`,
    amount: round(x.value),
  }));
  const custoFixoSum = round(calculateTotalFixedCost(state));
  const custoOps = round(custoFixoSum + custoNuvem);

  const pro1 = round(state.proLabore.socio1);
  const pro2 = round(state.proLabore.socio2);
  const proTotal = round(pro1 + pro2);

  const lucro = round(receitaLiquida - custoOps - proTotal);
  const margemPct = receitaBruta > 0 ? round((lucro / receitaBruta) * 100) : 0;

  const sections: MemorySection[] = [
    {
      title: "Receita bruta",
      items: [
        {
          label: "SaaS (clientes simulados × mensalidade)",
          detail: `${c} × ${formatCurrency(state.mensalidade)}`,
          amount: receitaSaas,
        },
        { label: "Consultoria (mensal fixo)", amount: receitaConsultoria },
        ...produtoItems,
        {
          label: "Total receita bruta",
          amount: receitaBruta,
          emphasis: "strong",
        },
      ],
    },
    {
      title: "Impostos e receita líquida",
      items: [
        {
          label: `Impostos (${impostoPct}% da receita bruta)`,
          detail: `${formatCurrency(receitaBruta)} × ${impostoPct}%`,
          amount: impostoValor,
        },
        { label: "Receita líquida", amount: receitaLiquida, emphasis: "strong" },
      ],
    },
    {
      title: "Custos operacionais (o que a tabela chama de “Custo”)",
      items: [
        ...custoFixoItems,
        {
          label: "Nuvem: base + (blocos completos × incremento)",
          detail: `${formatCurrency(state.custoNuvem.base)} + ${blocos} × ${formatCurrency(state.custoNuvem.incremento)} · blocos = floor(${c} ÷ ${safeBlock})`,
          amount: custoNuvem,
        },
        { label: "Subtotal fixos + nuvem", amount: custoOps, emphasis: "strong" },
      ],
    },
    {
      title: "Pró-labore (fora da coluna Custo)",
      items: [
        { label: "Sócio 1", amount: pro1 },
        { label: "Sócio 2", amount: pro2 },
        { label: "Total pró-labore", amount: proTotal, emphasis: "strong" },
      ],
    },
    {
      title: "Resultado",
      items: [
        {
          label: "Lucro líquido",
          detail: "Receita líquida − (fixos + nuvem) − pró-labore",
          amount: lucro,
          emphasis: "strong",
        },
        {
          label: "Margem % (sobre receita bruta)",
          detail:
            receitaBruta > 0
              ? `(Lucro líquido ÷ receita bruta) × 100`
              : "Receita bruta zero — margem não definida",
          valueText: `${margemPct.toFixed(2)}%`,
          emphasis: "strong",
        },
      ],
    },
  ];

  return sections;
}
