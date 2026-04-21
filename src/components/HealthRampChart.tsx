import { Card } from "primereact/card";
import { Chart } from "react-chartjs-2";
import type { AcquisitionTimelinePoint } from "../utils/timelineSimulation";

/** Gráfico barras + linha (sem card). */
export function HealthRampChartBody({ points }: { points: AcquisitionTimelinePoint[] }) {
  if (points.length === 0) {
    return null;
  }

  const labels = points.map((p) => p.label);
  const lucro = points.map((p) => p.lucroLiquido);
  const margem = points.map((p) => p.margemPct);
  const barColors = lucro.map((v) =>
    v >= 0 ? "rgba(22, 163, 74, 0.72)" : "rgba(220, 38, 38, 0.65)",
  );

  const data = {
    labels,
    datasets: [
      {
        type: "bar" as const,
        label: "Lucro líquido (mês)",
        data: lucro,
        backgroundColor: barColors,
        borderRadius: 6,
        yAxisID: "y",
        order: 2,
      },
      {
        type: "line" as const,
        label: "Margem líquida %",
        data: margem,
        borderColor: "#1e40af",
        backgroundColor: "rgba(30, 64, 175, 0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        borderWidth: 2,
        yAxisID: "y1",
        order: 1,
      },
    ],
  };

  const margemAbsMax = Math.max(8, ...margem.map((m) => Math.abs(m)));
  const margemPad = Math.max(2, margemAbsMax * 0.12);
  const margemSuggestedMax = Math.max(10, ...margem) + margemPad;
  const margemSuggestedMin = Math.min(-5, ...margem) - margemPad;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 12, padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: import("chart.js").TooltipItem<"bar" | "line">) => {
            const val = ctx.parsed.y ?? 0;
            if (ctx.dataset.yAxisID === "y1" || ctx.dataset.label?.includes("%")) {
              return `${ctx.dataset.label}: ${Number(val).toFixed(1)}%`;
            }
            const s = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
            return `${ctx.dataset.label}: ${s}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { maxRotation: 40, font: { size: 10 } },
      },
      y: {
        position: "left" as const,
        title: { display: true, text: "Lucro (R$)", color: "#475569", font: { size: 11 } },
        grid: { color: "rgba(148, 163, 184, 0.25)" },
        ticks: {
          callback: (value: number | string) => {
            const n = typeof value === "number" ? value : Number(value);
            if (Number.isNaN(n)) return "";
            if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(0)}k`;
            return `${n}`;
          },
        },
      },
      y1: {
        position: "right" as const,
        suggestedMin: margemSuggestedMin,
        suggestedMax: margemSuggestedMax,
        title: { display: true, text: "Margem %", color: "#1e40af", font: { size: 11 } },
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (value: number | string) => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="chart-container chart-container--mixed">
      <Chart type="bar" data={data} options={options} />
    </div>
  );
}

type HealthRampChartProps = {
  points: AcquisitionTimelinePoint[];
  rampLegenda: string;
};

export function HealthRampChart({ points, rampLegenda }: HealthRampChartProps) {
  if (points.length === 0) {
    return null;
  }
  return (
    <Card
      title="Lucro e margem na rampa"
      subTitle={`${points.length} meses · ${rampLegenda}.`}
      className="panel-card"
    >
      <HealthRampChartBody points={points} />
    </Card>
  );
}
