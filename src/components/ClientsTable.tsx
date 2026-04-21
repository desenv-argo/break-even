import { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { CalculationMemoryContent } from "./CalculationMemoryContent";
import { useIsMobile } from "../hooks/useIsMobile";
import { useSimulatorStore } from "../store/simulatorStore";
import { buildCalculationBreakdown } from "../utils/calculationMemory";
import type { SimulationRow } from "../types";

type ClientsTableProps = {
  rows: SimulationRow[];
  breakEvenClientes: number | null;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const ROWS_PER_PAGE = 10;

/** Mapa de linhas expandidas (chave = dataKey `clientes`). */
type ExpandedMap = Record<string, boolean>;

function rowTone(row: SimulationRow, breakEvenClientes: number | null): "loss" | "breakeven" | "profit" {
  if (breakEvenClientes !== null && row.clientes === breakEvenClientes) return "breakeven";
  if (row.lucro < 0) return "loss";
  return "profit";
}

function SimulationRowCard({
  row,
  breakEvenClientes,
  onMemory,
}: {
  row: SimulationRow;
  breakEvenClientes: number | null;
  onMemory: () => void;
}) {
  const tone = rowTone(row, breakEvenClientes);
  const tag =
    tone === "breakeven" ? (
      <Tag value="Break-even" severity="warning" className="sim-row-tag" />
    ) : tone === "loss" ? (
      <Tag value="Prejuízo" severity="danger" className="sim-row-tag" />
    ) : (
      <Tag value="Lucro" severity="success" className="sim-row-tag" />
    );

  return (
    <article className={`sim-row-card sim-row-card--${tone}`}>
      <header className="sim-row-card__head">
        <span className="sim-row-card__title">
          <strong>{row.clientes}</strong> {row.clientes === 1 ? "cliente" : "clientes"}
        </span>
        <div className="sim-row-card__badges">
          {tag}
          <Button
            type="button"
            icon="pi pi-calculator"
            rounded
            text
            severity="secondary"
            className="sim-row-card__calc-btn"
            onClick={onMemory}
            aria-label={`Memória de cálculo para ${row.clientes} ${row.clientes === 1 ? "cliente" : "clientes"}`}
          />
        </div>
      </header>
      <dl className="sim-row-card__metrics">
        <div>
          <dt>Receita</dt>
          <dd>{formatCurrency(row.receita)}</dd>
        </div>
        <div>
          <dt>Custo</dt>
          <dd>{formatCurrency(row.custo)}</dd>
        </div>
        <div>
          <dt>Lucro</dt>
          <dd className={tone === "loss" ? "sim-row-card__dd--loss" : undefined}>{formatCurrency(row.lucro)}</dd>
        </div>
        <div>
          <dt>Margem</dt>
          <dd>{row.margem.toFixed(1)}%</dd>
        </div>
      </dl>
    </article>
  );
}

export function ClientsTable({ rows, breakEvenClientes }: ClientsTableProps) {
  const state = useSimulatorStore();
  const isMobile = useIsMobile();
  const [first, setFirst] = useState(0);
  const [memoryClientes, setMemoryClientes] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<ExpandedMap>({});

  const maxFirst = Math.max(0, rows.length - ROWS_PER_PAGE);

  useEffect(() => {
    setFirst(0);
  }, [rows.length]);

  useEffect(() => {
    setFirst((f) => Math.min(f, maxFirst));
  }, [maxFirst]);

  useEffect(() => {
    setExpandedRows({});
  }, [rows.length]);

  const effectiveFirst = Math.min(first, maxFirst);

  const pageRows = useMemo(
    () => rows.slice(effectiveFirst, effectiveFirst + ROWS_PER_PAGE),
    [rows, effectiveFirst],
  );

  const memorySections = useMemo(
    () => (memoryClientes !== null ? buildCalculationBreakdown(state, memoryClientes) : []),
    [state, memoryClientes],
  );

  const expansionBody = (row: SimulationRow) => (
    <CalculationMemoryContent sections={buildCalculationBreakdown(state, row.clientes)} clientes={row.clientes} />
  );

  const memoryDialog = (
    <Dialog
      header={memoryClientes !== null ? `Memória de cálculo · ${memoryClientes} clientes` : "Memória de cálculo"}
      visible={memoryClientes !== null}
      style={{ width: "min(560px, 94vw)" }}
      dismissableMask
      onHide={() => setMemoryClientes(null)}
      className="calc-memory-dialog"
    >
      {memoryClientes !== null ? (
        <CalculationMemoryContent sections={memorySections} clientes={memoryClientes} />
      ) : null}
    </Dialog>
  );

  return (
    <>
      {memoryDialog}
      {isMobile ? (
        <Card title="Simulação por faixa de clientes" className="panel-card clients-table-mobile">
          <p className="clients-mobile-hint">
            Toque no ícone <i className="pi pi-calculator clients-mobile-hint-icon" aria-hidden /> ao lado do status para ver a memória de cálculo.
          </p>
          <div className="sim-row-list">
            {pageRows.map((row) => (
              <SimulationRowCard
                key={row.clientes}
                row={row}
                breakEvenClientes={breakEvenClientes}
                onMemory={() => setMemoryClientes(row.clientes)}
              />
            ))}
          </div>
          {rows.length > ROWS_PER_PAGE ? (
            <Paginator
              first={effectiveFirst}
              rows={ROWS_PER_PAGE}
              totalRecords={rows.length}
              onPageChange={(e) => setFirst(e.first)}
              className="sim-paginator"
            />
          ) : null}
        </Card>
      ) : (
        <Card title="Simulacao por Faixa de Clientes" className="panel-card">
          <p className="clients-desktop-hint">
            Clique em <strong>+</strong> na primeira coluna para expandir a memória de cálculo da linha.
          </p>
          <div className="table-scroll table-scroll--desktop">
            <DataTable
              value={rows}
              dataKey="clientes"
              size="small"
              paginator
              rows={ROWS_PER_PAGE}
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows((e.data as ExpandedMap) ?? {})}
              rowExpansionTemplate={expansionBody}
              tableStyle={{ minWidth: "36rem" }}
              rowClassName={(row) => {
                if (breakEvenClientes !== null && row.clientes === breakEvenClientes) return "row-break-even";
                if (row.lucro < 0) return "row-loss";
                return "row-profit";
              }}
            >
              <Column expander style={{ width: "2.75rem" }} />
              <Column field="clientes" header="Clientes" />
              <Column field="receita" header="Receita" body={(row) => formatCurrency(row.receita)} />
              <Column field="custo" header="Custo" body={(row) => formatCurrency(row.custo)} />
              <Column field="lucro" header="Lucro" body={(row) => formatCurrency(row.lucro)} />
              <Column field="margem" header="Margem %" body={(row) => `${row.margem.toFixed(2)}%`} />
            </DataTable>
          </div>
        </Card>
      )}
    </>
  );
}
