import { Card } from "primereact/card";
import { Line } from "react-chartjs-2";
import type { AcquisitionTimelinePoint } from "../utils/timelineSimulation";

const formatTick = (value: number | string): string => {
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "";
  if (Math.abs(n) >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `R$ ${(n / 1000).toFixed(0)}k`;
  return `R$ ${n.toFixed(0)}`;
};

const RECEITA_COLORS = ["#2563EB", "#0891b2", "#7c3aed", "#db2777", "#059669", "#0d9488"];
const DESPESA_COLORS = ["#ea580c", "#dc2626", "#ca8a04", "#b45309", "#991b1b", "#4f46e5", "#64748b"];

const commonLineOpts = {
  tension: 0.3,
  pointRadius: 2,
  pointHoverRadius: 4,
  borderWidth: 2,
};

/** Gráfico de linhas receitas × despesas (sem card). */
export function AcquisitionTimelineLine({ points }: { points: AcquisitionTimelinePoint[] }) {
  if (points.length === 0) {
    return <p className="chart-empty">Ajuste os clientes e parâmetros para ver a simulação.</p>;
  }

  const labels = points.map((p) => p.label);
  const datasets: import("chart.js").ChartDataset<"line", number[]>[] = [];
  let ci = 0;

  datasets.push({
    type: "line",
    label: "Receita · SaaS (MRR)",
    data: points.map((p) => p.receitaSaas),
    borderColor: RECEITA_COLORS[ci % RECEITA_COLORS.length],
    backgroundColor: `${RECEITA_COLORS[ci % RECEITA_COLORS.length]}33`,
    ...commonLineOpts,
    fill: false,
  });
  ci += 1;

  datasets.push({
    type: "line",
    label: "Receita · Consultoria",
    data: points.map((p) => p.receitaConsultoria),
    borderColor: RECEITA_COLORS[ci % RECEITA_COLORS.length],
    backgroundColor: `${RECEITA_COLORS[ci % RECEITA_COLORS.length]}33`,
    ...commonLineOpts,
    fill: false,
  });
  ci += 1;

  const productTemplate = points[0].receitasProdutos;
  productTemplate.forEach((prod, productIndex) => {
    datasets.push({
      type: "line",
      label: `Receita · ${prod.label}`,
      data: points.map((p) => p.receitasProdutos[productIndex]?.value ?? 0),
      borderColor: RECEITA_COLORS[ci % RECEITA_COLORS.length],
      backgroundColor: `${RECEITA_COLORS[ci % RECEITA_COLORS.length]}33`,
      ...commonLineOpts,
      fill: false,
    });
    ci += 1;
  });

  let di = 0;
  const fixoTemplate = points[0].despesasFixas;
  fixoTemplate.forEach((fx, idx) => {
    datasets.push({
      type: "line",
      label: `Despesa · ${fx.label}`,
      data: points.map((p) => p.despesasFixas[idx]?.value ?? 0),
      borderColor: DESPESA_COLORS[di % DESPESA_COLORS.length],
      borderDash: [6, 4],
      ...commonLineOpts,
      fill: false,
    });
    di += 1;
  });

  datasets.push({
    type: "line",
    label: "Despesa · Nuvem (variável)",
    data: points.map((p) => p.custoNuvem),
    borderColor: DESPESA_COLORS[di % DESPESA_COLORS.length],
    borderDash: [4, 4],
    ...commonLineOpts,
    fill: false,
  });
  di += 1;

  datasets.push({
    type: "line",
    label: "Despesa · Pró-labore",
    data: points.map((p) => p.proLabore),
    borderColor: DESPESA_COLORS[di % DESPESA_COLORS.length],
    borderDash: [6, 3],
    ...commonLineOpts,
    fill: false,
  });
  di += 1;

  datasets.push({
    type: "line",
    label: "Despesa · Impostos (s/ receita bruta)",
    data: points.map((p) => p.impostoValor),
    borderColor: DESPESA_COLORS[di % DESPESA_COLORS.length],
    borderDash: [2, 3],
    ...commonLineOpts,
    fill: false,
  });

  const chartData = { labels, datasets };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 10, padding: 8, font: { size: 10 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: import("chart.js").TooltipItem<"line">) => {
            const v = ctx.parsed.y ?? 0;
            const s = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
            return `${ctx.dataset.label}: ${s}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { maxRotation: 45, minRotation: 0, font: { size: 10 } },
      },
      y: {
        ticks: { callback: (value: number | string) => formatTick(value) },
        grid: { color: "rgba(148, 163, 184, 0.2)" },
      },
    },
  };

  return (
    <div className="chart-container chart-container--timeline">
      <Line data={chartData} options={options} />
    </div>
  );
}

type AcquisitionTimelineChartProps = {
  points: AcquisitionTimelinePoint[];
  rampLegenda: string;
};

/** Card isolado (legado); preferir TimelineRampaBundle no app. */
export function AcquisitionTimelineChart({ points, rampLegenda }: AcquisitionTimelineChartProps) {
  return (
    <Card
      title="Rampa de aquisição (CNPJs)"
      subTitle={`${points.length} meses · ${rampLegenda}.`}
      className="panel-card"
    >
      <AcquisitionTimelineLine points={points} />
    </Card>
  );
}
