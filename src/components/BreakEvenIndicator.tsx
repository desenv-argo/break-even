import { Tag } from "primereact/tag";

type BreakEvenIndicatorProps = {
  breakEvenClientes: number | null;
};

export function BreakEvenIndicator({ breakEvenClientes }: BreakEvenIndicatorProps) {
  if (breakEvenClientes === null) {
    return (
      <div className="break-even-indicator warning">
        <Tag severity="warning" value="Sem break-even na faixa simulada" />
      </div>
    );
  }

  return (
    <div className="break-even-indicator success">
      <Tag severity="success" value={`Break-even atingido com ${breakEvenClientes} clientes`} />
    </div>
  );
}
