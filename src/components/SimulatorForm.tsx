import { useMemo } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Slider } from "primereact/slider";
import { useIsMobile } from "../hooks/useIsMobile";
import { ProductManager } from "./ProductManager";
import { useSimulatorStore } from "../store/simulatorStore";

export function SimulatorForm() {
  const isMobile = useIsMobile();
  const state = useSimulatorStore();
  const clientsSliderValue = useMemo(
    () => Math.min(state.clientes, state.faixaClientesMaxima),
    [state.clientes, state.faixaClientesMaxima],
  );

  const revenueBlock = (
    <>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="receita-mensalidade">Mensalidade do SaaS</label>
          <InputNumber
            inputId="receita-mensalidade"
            value={state.mensalidade}
            onValueChange={(e) => state.setField("mensalidade", e.value ?? 0)}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
          />
        </div>
        <div className="field">
          <label htmlFor="receita-consultoria">Receita de consultoria</label>
          <span className="field-hint">Valor fixo mensal, além do MRR</span>
          <InputNumber
            inputId="receita-consultoria"
            value={state.consultoria}
            onValueChange={(e) => state.setField("consultoria", e.value ?? 0)}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
          />
        </div>
      </div>
      <div className="field slider-field">
        <span className="field-slider-title" id="clientes-saas-slider-label">
          Clientes SaaS ativos: <strong>{state.clientes}</strong>
        </span>
        <span className="field-hint">Arraste para simular o volume de clientes no plano principal</span>
        <Slider
          aria-labelledby="clientes-saas-slider-label"
          value={clientsSliderValue}
          min={0}
          max={Math.max(10, state.faixaClientesMaxima)}
          onChange={(e) => state.setField("clientes", Number(e.value))}
        />
      </div>
    </>
  );

  const fixedCostsBlock = (
    <>
      {state.custosFixos.map((cost) => (
        <div key={cost.id} className="line-grid">
          <div className="field">
            <label htmlFor={`custo-fixo-nome-${cost.id}`}>Descrição</label>
            <InputText
              id={`custo-fixo-nome-${cost.id}`}
              value={cost.name}
              onChange={(e) => state.updateFixedCost(cost.id, { name: e.target.value })}
              placeholder="Ex.: Contabilidade"
            />
          </div>
          <div className="field">
            <label htmlFor={`custo-fixo-valor-${cost.id}`}>Valor mensal</label>
            <InputNumber
              inputId={`custo-fixo-valor-${cost.id}`}
              value={cost.value}
              onValueChange={(e) => state.updateFixedCost(cost.id, { value: e.value ?? 0 })}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
            />
          </div>
          <div className="field">
            <label className="line-grid-action-label">Ação</label>
            <Button
              icon="pi pi-trash"
              severity="danger"
              outlined
              onClick={() => state.removeFixedCost(cost.id)}
              aria-label={`Remover custo ${cost.name}`}
            />
          </div>
        </div>
      ))}
      <Button label="Adicionar Custo Fixo" icon="pi pi-plus" text onClick={state.addFixedCost} className="touch-full" />
    </>
  );

  const cloudBlock = (
    <div className="form-grid">
      <div className="field">
        <label htmlFor="nuvem-base">Custo base da nuvem</label>
        <span className="field-hint">Infra mensal antes de escalonar por blocos</span>
        <InputNumber
          inputId="nuvem-base"
          value={state.custoNuvem.base}
          onValueChange={(e) => state.setField("custoNuvem", { ...state.custoNuvem, base: e.value ?? 0 })}
          mode="currency"
          currency="BRL"
          locale="pt-BR"
        />
      </div>
      <div className="field">
        <label htmlFor="nuvem-incremento">Incremento por bloco</label>
        <span className="field-hint">Soma a cada bloco completo de clientes</span>
        <InputNumber
          inputId="nuvem-incremento"
          value={state.custoNuvem.incremento}
          onValueChange={(e) => state.setField("custoNuvem", { ...state.custoNuvem, incremento: e.value ?? 0 })}
          mode="currency"
          currency="BRL"
          locale="pt-BR"
        />
      </div>
      <div className="field">
        <label htmlFor="nuvem-bloco">Clientes por bloco</label>
        <span className="field-hint">Ex.: 10 = um passo a cada 10 clientes</span>
        <InputNumber
          inputId="nuvem-bloco"
          value={state.custoNuvem.clientesPorBloco}
          onValueChange={(e) => state.setField("custoNuvem", { ...state.custoNuvem, clientesPorBloco: e.value ?? 1 })}
          min={1}
        />
      </div>
    </div>
  );

  const taxProlaboreBlock = (
    <div className="form-grid">
      <div className="field">
        <label htmlFor="imposto-pct">Impostos sobre a receita</label>
        <span className="field-hint">Percentual aplicado sobre a receita total</span>
        <InputNumber
          inputId="imposto-pct"
          value={state.imposto}
          onValueChange={(e) => state.setField("imposto", e.value ?? 0)}
          min={0}
          max={100}
          suffix="%"
        />
      </div>
      <div className="field">
        <label htmlFor="prolabore-1">Pró-labore — sócio 1</label>
        <InputNumber
          inputId="prolabore-1"
          value={state.proLabore.socio1}
          onValueChange={(e) => state.setField("proLabore", { ...state.proLabore, socio1: e.value ?? 0 })}
          mode="currency"
          currency="BRL"
          locale="pt-BR"
        />
      </div>
      <div className="field">
        <label htmlFor="prolabore-2">Pró-labore — sócio 2</label>
        <InputNumber
          inputId="prolabore-2"
          value={state.proLabore.socio2}
          onValueChange={(e) => state.setField("proLabore", { ...state.proLabore, socio2: e.value ?? 0 })}
          mode="currency"
          currency="BRL"
          locale="pt-BR"
        />
      </div>
    </div>
  );

  const rangeAndProductsBlock = (
    <>
      <div className="form-grid form-grid--single">
        <div className="field">
          <label htmlFor="faixa-max-clientes">Máximo de clientes na tabela</label>
          <span className="field-hint">A simulação vai de 0 até este número (gráfico e tabela)</span>
          <InputNumber
            inputId="faixa-max-clientes"
            value={state.faixaClientesMaxima}
            onValueChange={(e) => state.setField("faixaClientesMaxima", Math.max(10, e.value ?? 100))}
            min={10}
            max={5000}
          />
        </div>
      </div>
      <ProductManager products={state.produtos} onAdd={state.addProduct} onRemove={state.removeProduct} onUpdate={state.updateProduct} />
    </>
  );

  if (isMobile) {
    return (
      <Card title="Simulador interativo" className="panel-card simulator-mobile">
        <p className="simulator-mobile-hint">Toque em cada bloco para expandir. Os números atualizam os gráficos na hora.</p>
        <Accordion multiple className="simulator-accordion" activeIndex={[0]}>
          <AccordionTab header="Receita e clientes">{revenueBlock}</AccordionTab>
          <AccordionTab header="Custos fixos">{fixedCostsBlock}</AccordionTab>
          <AccordionTab header="Nuvem (variável)">{cloudBlock}</AccordionTab>
          <AccordionTab header="Impostos e pró-labore">{taxProlaboreBlock}</AccordionTab>
          <AccordionTab header="Faixa e produtos extras">{rangeAndProductsBlock}</AccordionTab>
        </Accordion>
      </Card>
    );
  }

  return (
    <Card title="Simulador Interativo" className="panel-card">
      <div className="stack">
        <h3>Receita</h3>
        {revenueBlock}

        <Divider />
        <h3>Custos Fixos</h3>
        {fixedCostsBlock}

        <Divider />
        <h3>Custo variável (nuvem)</h3>
        {cloudBlock}

        <Divider />
        <h3>Impostos e pró-labore</h3>
        {taxProlaboreBlock}

        <Divider />
        <h3>Faixa de simulação</h3>
        {rangeAndProductsBlock}
      </div>
    </Card>
  );
}
