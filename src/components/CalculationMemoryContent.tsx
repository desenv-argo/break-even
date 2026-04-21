import type { MemorySection } from "../utils/calculationMemory";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

type CalculationMemoryContentProps = {
  sections: MemorySection[];
  /** Número de clientes da linha (ajuda contexto no topo) */
  clientes: number;
};

export function CalculationMemoryContent({ sections, clientes }: CalculationMemoryContentProps) {
  return (
    <div className="calc-memory" role="region" aria-label={`Memória de cálculo para ${clientes} clientes`}>
      <p className="calc-memory__intro">
        Linha simulada com <strong>{clientes}</strong> {clientes === 1 ? "cliente" : "clientes"} no modelo SaaS (mesmas fórmulas do painel).
      </p>
      {sections.map((section) => (
        <section key={section.title} className="calc-memory__block">
          <h4 className="calc-memory__title">{section.title}</h4>
          <ul className="calc-memory__list">
            {section.items.map((item, index) => (
              <li
                key={`${section.title}-${index}-${item.label}`}
                className={`calc-memory__row${item.emphasis === "strong" ? " calc-memory__row--strong" : ""}`}
              >
                <div className="calc-memory__meta">
                  <span className="calc-memory__label">{item.label}</span>
                  {item.detail ? <span className="calc-memory__detail">{item.detail}</span> : null}
                </div>
                <span className="calc-memory__value">
                  {item.valueText ??
                    (item.amount !== undefined ? formatCurrency(item.amount) : "—")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
