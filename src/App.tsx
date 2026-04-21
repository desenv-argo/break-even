import { useMemo, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { TabPanel, TabView } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { BreakEvenIndicator } from "./components/BreakEvenIndicator";
import { ClientsTable } from "./components/ClientsTable";
import { CostChart } from "./components/CostChart";
import { DashboardCards } from "./components/DashboardCards";
import { TimelineRampaBundle } from "./components/TimelineRampaBundle";
import { RevenueChart } from "./components/RevenueChart";
import { SimulatorForm } from "./components/SimulatorForm";
import { TeamAvatars } from "./components/TeamAvatars";
import { useIsMobile } from "./hooks/useIsMobile";
import { exportStateJson, importStateJson, useSimulatorStore } from "./store/simulatorStore";
import { calculateMetrics, generateSimulation } from "./utils/finance";
import { generateAcquisitionTimeline } from "./utils/timelineSimulation";
import {
  buildExecutiveSummary,
  exportElementToPngBlob,
  sharePngOrDownload,
  shareTextOrCopy,
} from "./utils/shareSummary";
import "./app.css";

function App() {
  const state = useSimulatorStore();
  const isMobile = useIsMobile();
  const [openDialog, setOpenDialog] = useState(false);
  const [jsonBuffer, setJsonBuffer] = useState("");
  const [mobileTab, setMobileTab] = useState(0);
  const captureRef = useRef<HTMLDivElement>(null);
  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);

  const metrics = useMemo(() => calculateMetrics(state), [state]);
  const simulationRows = useMemo(() => generateSimulation(state), [state]);
  const timelinePoints = useMemo(() => generateAcquisitionTimeline(state), [state]);

  const rampLegenda = useMemo(() => {
    const r = state.rampa;
    if (r.modo === "mensal") {
      return `${r.cnpjsPorMes} CNPJ(s) novo(s) por mês · teto da meta: ${state.clientes}`;
    }
    return `${r.cnpjsPorBloco} CNPJ(s) a cada ${r.mesesPorBloco} mes(es) · teto da meta: ${state.clientes}`;
  }, [state.rampa, state.clientes]);

  const charts = (
    <>
      <RevenueChart rows={simulationRows} />
      <CostChart
        custoFixoTotal={metrics.custoFixoTotal}
        custoNuvem={metrics.custoNuvem}
        proLaboreTotal={metrics.proLaboreTotal}
      />
      <TimelineRampaBundle points={timelinePoints} rampLegenda={rampLegenda} />
    </>
  );

  const showToast = (severity: "success" | "warn" | "error" | "info", summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3400 });
  };

  const handleExportJson = () => {
    const blob = new Blob([exportStateJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "simulacao-saas.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onShareSummary = async () => {
    const text = buildExecutiveSummary(metrics, state);
    const result = await shareTextOrCopy(text);
    if (result === "shared") showToast("success", "Compartilhar", "Use o menu do sistema para enviar ao Thiago ou arquivo.");
    else if (result === "copied") showToast("success", "Copiado", "Resumo no clipboard — pronto para colar no WhatsApp.");
  };

  const onExportPng = async () => {
    if (isMobile && mobileTab !== 0) {
      setMobileTab(0);
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }
    const el = captureRef.current;
    if (!el) {
      showToast("warn", "Aguarde", "Abra a aba Visão e tente exportar a imagem de novo.");
      return;
    }
    try {
      const blob = await exportElementToPngBlob(el);
      if (!blob) {
        showToast("error", "Erro", "Não foi possível gerar a imagem.");
        return;
      }
      const name = `argo-dashboard-${new Date().toISOString().slice(0, 10)}`;
      await sharePngOrDownload(blob, name);
      showToast("success", "Imagem", isMobile ? "No celular: use Compartilhar ou verifique a pasta de downloads." : "Arquivo compartilhado ou salvo.");
    } catch {
      showToast("error", "Erro", "Falha ao capturar a tela. Tente o resumo em texto.");
    }
  };

  const menuItems: MenuItem[] = [
    { label: "Exportar JSON", icon: "pi pi-download", command: handleExportJson },
    {
      label: "Importar JSON",
      icon: "pi pi-upload",
      command: () => {
        setJsonBuffer("");
        setOpenDialog(true);
      },
    },
    {
      label: "Exportar imagem (PNG)",
      icon: "pi pi-image",
      command: () => {
        void onExportPng();
      },
    },
    { separator: true },
    { label: "Resetar cenário", icon: "pi pi-refresh", command: () => state.reset() },
  ];

  return (
    <>
      <Toast ref={toast} position="top-center" />
      <Menu model={menuItems} popup ref={menuRef} className="no-capture" />
      <main className="container">
        <header className="header">
          <div className="header-brand">
            <div className="title-row">
              <h1>SaaS Financial Dashboard</h1>
              <TeamAvatars />
            </div>
            <p>Simule receita, custos, lucro e break-even em tempo real — Argo.</p>
          </div>
          <div className={`header-actions no-capture${isMobile ? " header-actions--mobile" : ""}`}>
            <Button
              label={isMobile ? "Enviar resumo" : "Compartilhar resumo"}
              icon="pi pi-share-alt"
              className="touch-main"
              onClick={() => void onShareSummary()}
            />
            {isMobile ? (
              <Button
                type="button"
                icon="pi pi-ellipsis-v"
                outlined
                severity="secondary"
                className="touch-icon"
                aria-label="Mais opções"
                onClick={(event) => menuRef.current?.toggle(event)}
              />
            ) : (
              <>
                <Button label="Exportar JSON" icon="pi pi-download" outlined onClick={handleExportJson} />
                <Button
                  label="Importar JSON"
                  icon="pi pi-upload"
                  onClick={() => {
                    setJsonBuffer("");
                    setOpenDialog(true);
                  }}
                />
                <Button label="Exportar PNG" icon="pi pi-image" outlined onClick={() => void onExportPng()} />
                <Button label="Reset" icon="pi pi-refresh" severity="secondary" text onClick={state.reset} />
              </>
            )}
          </div>
        </header>

        {isMobile ? (
          <TabView
            activeIndex={mobileTab}
            onTabChange={(event) => setMobileTab(event.index)}
            className="mobile-tabview"
            scrollable
          >
            <TabPanel header="Visão" leftIcon="pi pi-chart-line">
              <div ref={captureRef} className="dashboard-capture tab-panel-inner">
                <DashboardCards metrics={metrics} />
                <BreakEvenIndicator breakEvenClientes={metrics.breakEvenClientes} />
                <div className="charts-stack">{charts}</div>
              </div>
            </TabPanel>
            <TabPanel header="Simular" leftIcon="pi pi-sliders-h">
              <div className="tab-panel-inner">
                <SimulatorForm />
              </div>
            </TabPanel>
            <TabPanel header="Tabela" leftIcon="pi pi-table">
              <div className="tab-panel-inner">
                <ClientsTable rows={simulationRows} breakEvenClientes={metrics.breakEvenClientes} />
              </div>
            </TabPanel>
          </TabView>
        ) : (
          <>
            <div ref={captureRef} className="dashboard-capture">
              <DashboardCards metrics={metrics} />
              <BreakEvenIndicator breakEvenClientes={metrics.breakEvenClientes} />
              <section className="layout">
                <SimulatorForm />
                <div className="right-col">{charts}</div>
              </section>
            </div>
            <ClientsTable rows={simulationRows} breakEvenClientes={metrics.breakEvenClientes} />
          </>
        )}

        <Dialog
          header="Importar estado via JSON"
          visible={openDialog}
          className="import-dialog"
          style={{ width: "min(540px, 94vw)" }}
          onHide={() => setOpenDialog(false)}
          dismissableMask
        >
          <div className="stack">
            <InputTextarea
              autoResize
              rows={isMobile ? 10 : 12}
              value={jsonBuffer}
              onChange={(event) => setJsonBuffer(event.target.value)}
              placeholder="Cole aqui o JSON do cenario"
            />
            <Button
              label="Aplicar"
              onClick={() => {
                const ok = importStateJson(jsonBuffer);
                if (ok) {
                  setOpenDialog(false);
                  showToast("success", "Importado", "Cenário carregado com sucesso.");
                } else showToast("error", "JSON inválido", "Verifique o conteúdo e tente de novo.");
              }}
            />
          </div>
        </Dialog>
      </main>
    </>
  );
}

export default App;
