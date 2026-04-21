import { Card } from "primereact/card";
import { Line } from "react-chartjs-2";
import type { SimulationRow } from "../types";

type RevenueChartProps = {
  rows: SimulationRow[];
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: "index" as const },
  plugins: {
    legend: { position: "bottom" as const, labels: { boxWidth: 12, padding: 12 } },
  },
};

export function RevenueChart({ rows }: RevenueChartProps) {
  const chartData = {
    labels: rows.map((row) => row.clientes),
    datasets: [
      {
        label: "Receita",
        data: rows.map((row) => row.receita),
        borderColor: "#2563EB",
        backgroundColor: "rgba(37, 99, 235, 0.15)",
      },
      {
        label: "Custo",
        data: rows.map((row) => row.custo),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.15)",
      },
      {
        label: "Lucro",
        data: rows.map((row) => row.lucro),
        borderColor: "#16A34A",
        backgroundColor: "rgba(22, 163, 74, 0.15)",
      },
    ],
  };

  return (
    <Card title="Receita vs Custo vs Lucro" className="panel-card">
      <div className="chart-container chart-container--line">
        <Line data={chartData} options={lineOptions} />
      </div>
    </Card>
  );
}
