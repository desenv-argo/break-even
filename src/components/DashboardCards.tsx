import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import type { FinanceMetrics } from "../types";

type DashboardCardsProps = {
  metrics: FinanceMetrics;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function DashboardCards({ metrics }: DashboardCardsProps) {
  const cards = [
    { label: "Receita Total", value: formatCurrency(metrics.receitaTotal), icon: "pi pi-wallet" },
    { label: "Receita Liquida", value: formatCurrency(metrics.receitaLiquida), icon: "pi pi-chart-line" },
    { label: "Custos Totais", value: formatCurrency(metrics.custoTotal), icon: "pi pi-dollar" },
    { label: "Lucro Liquido", value: formatCurrency(metrics.lucroLiquido), icon: "pi pi-briefcase" },
  ];

  return (
    <div className="cards-grid">
      {cards.map((card) => (
        <Card key={card.label} className="metric-card">
          <div className="metric-header">
            <span>{card.label}</span>
            <i className={card.icon} />
          </div>
          <strong>{card.value}</strong>
        </Card>
      ))}
      <Card className="metric-card">
        <div className="metric-header">
          <span>Margem</span>
          <i className="pi pi-percentage" />
        </div>
        <strong>{metrics.margemPercentual.toFixed(2)}%</strong>
        <Tag
          value={
            metrics.breakEvenClientes === null
              ? "Sem break-even na faixa"
              : `Break-even em ${metrics.breakEvenClientes} clientes`
          }
          severity={metrics.breakEvenClientes === null ? "warning" : "success"}
        />
      </Card>
    </div>
  );
}
