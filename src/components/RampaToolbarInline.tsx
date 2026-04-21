import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Panel } from "primereact/panel";
import { SelectButton } from "primereact/selectbutton";
import { useIsMobile } from "../hooks/useIsMobile";
import { useSimulatorStore } from "../store/simulatorStore";
import { getClientesNaRampa } from "../utils/timelineSimulation";

const modoOptions = [
  { label: "Por mês", value: "mensal" as const },
  { label: "A cada N meses", value: "bloco" as const },
];

/** Barra compacta de parâmetros da rampa (incorporada ao card dos gráficos). */
export function RampaToolbarInline() {
  const isMobile = useIsMobile();
  const state = useSimulatorStore();
  const rampa = state.rampa;
  const updateRampa = useSimulatorStore((s) => s.updateRampa);

  const horizonte = Math.max(2, Math.min(60, Math.round(rampa.horizonteMeses)));
  const ultimoMes = getClientesNaRampa(state, horizonte);
  const meta = Math.max(0, Math.round(state.clientes));

  const setHorizonte = (v: number | null): void => {
    updateRampa({ horizonteMeses: Math.max(2, Math.min(60, Math.round(v ?? 12))) });
  };

  const toolbarInner = (
    <>
      <div className="ramp-toolbar__row">
        <div className="ramp-toolbar__group">
          <span className="ramp-toolbar__mini-label">Meses</span>
          <InputNumber
            value={horizonte}
            min={2}
            max={60}
            showButtons
            buttonLayout="horizontal"
            className="ramp-toolbar__stepper p-inputnumber-sm"
            onValueChange={(e) => setHorizonte(e.value ?? null)}
            aria-label="Meses no eixo"
          />
        </div>

        <div className="ramp-toolbar__group ramp-toolbar__group--grow">
          <span className="ramp-toolbar__mini-label">Progressão</span>
          <SelectButton
            value={rampa.modo}
            onChange={(e) => {
              if (e.value != null) updateRampa({ modo: e.value });
            }}
            options={modoOptions}
            optionLabel="label"
            optionValue="value"
            className="ramp-toolbar__segment"
          />
        </div>

        {rampa.modo === "mensal" ? (
          <div className="ramp-toolbar__group">
            <span className="ramp-toolbar__mini-label">CNPJs/mês</span>
            <InputNumber
              value={rampa.cnpjsPorMes}
              min={0}
              max={500}
              showButtons
              buttonLayout="horizontal"
              className="ramp-toolbar__stepper p-inputnumber-sm"
              onValueChange={(e) => updateRampa({ cnpjsPorMes: Math.max(0, e.value ?? 0) })}
              aria-label="Novos CNPJs por mês"
            />
          </div>
        ) : (
          <>
            <div className="ramp-toolbar__group">
              <span className="ramp-toolbar__mini-label">Lote</span>
              <InputNumber
                value={rampa.cnpjsPorBloco}
                min={0}
                max={500}
                showButtons
                buttonLayout="horizontal"
                className="ramp-toolbar__stepper p-inputnumber-sm"
                onValueChange={(e) => updateRampa({ cnpjsPorBloco: Math.max(0, e.value ?? 0) })}
                aria-label="CNPJs por período"
              />
            </div>
            <div className="ramp-toolbar__group">
              <span className="ramp-toolbar__mini-label">A cada (meses)</span>
              <InputNumber
                value={rampa.mesesPorBloco}
                min={1}
                max={24}
                showButtons
                buttonLayout="horizontal"
                className="ramp-toolbar__stepper p-inputnumber-sm"
                onValueChange={(e) => updateRampa({ mesesPorBloco: Math.max(1, e.value ?? 1) })}
                aria-label="Meses entre lotes"
              />
            </div>
          </>
        )}
      </div>

      <div className="ramp-toolbar__presets">
        <Button type="button" label="1/mês" size="small" text className="ramp-toolbar__preset" onClick={() => updateRampa({ modo: "mensal", cnpjsPorMes: 1 })} />
        <Button type="button" label="2/mês" size="small" text className="ramp-toolbar__preset" onClick={() => updateRampa({ modo: "mensal", cnpjsPorMes: 2 })} />
        <Button type="button" label="3/2m" size="small" text className="ramp-toolbar__preset" onClick={() => updateRampa({ modo: "bloco", cnpjsPorBloco: 3, mesesPorBloco: 2 })} />
        <Button type="button" label="5/3m" size="small" text className="ramp-toolbar__preset" onClick={() => updateRampa({ modo: "bloco", cnpjsPorBloco: 5, mesesPorBloco: 3 })} />
      </div>

      <p className="ramp-toolbar__summary">
        <i className="pi pi-info-circle" aria-hidden />
        Último mês (M{horizonte}): <strong>{ultimoMes}</strong> CNPJs
        {meta > 0 ? (
          <>
            {" "}
            · teto do simulador: <strong>{meta}</strong>
          </>
        ) : null}
        .
      </p>
    </>
  );

  if (isMobile) {
    return (
      <Panel header="Ajustar rampa de CNPJs" toggleable collapsed className="ramp-toolbar-panel">
        {toolbarInner}
      </Panel>
    );
  }

  return <div className="ramp-toolbar">{toolbarInner}</div>;
}
