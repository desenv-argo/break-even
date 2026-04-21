import { Doughnut } from "react-chartjs-2";
import { Card } from "primereact/card";

type CostChartProps = {
  custoFixoTotal: number;
  custoNuvem: number;
  proLaboreTotal: number;
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const, labels: { boxWidth: 12, padding: 12 } },
  },
};

export function CostChart({ custoFixoTotal, custoNuvem, proLaboreTotal }: CostChartProps) {
  return (
    <Card title="Composicao dos Custos" className="panel-card">
      <div className="chart-container chart-container--doughnut">
        <Doughnut
          data={{
            labels: ["Custos Fixos", "Nuvem", "Pro-labore"],
            datasets: [
              {
                data: [custoFixoTotal, custoNuvem, proLaboreTotal],
                backgroundColor: ["#1E40AF", "#F59E0B", "#DC2626"],
              },
            ],
          }}
          options={doughnutOptions}
        />
      </div>
    </Card>
  );
}
