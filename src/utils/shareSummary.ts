import type { FinanceMetrics, SimulatorState } from "../types";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function buildExecutiveSummary(metrics: FinanceMetrics, state: SimulatorState): string {
  const be =
    metrics.breakEvenClientes === null
      ? "ainda não atinge break-even na faixa simulada"
      : `${metrics.breakEvenClientes} clientes`;
  return [
    "Argo — SaaS Financial Dashboard",
    "",
    `Cenário: ${state.clientes} clientes SaaS · mensalidade ${formatCurrency(state.mensalidade)}`,
    `Receita total: ${formatCurrency(metrics.receitaTotal)}`,
    `Receita líquida: ${formatCurrency(metrics.receitaLiquida)}`,
    `Custos totais: ${formatCurrency(metrics.custoTotal)}`,
    `Lucro líquido: ${formatCurrency(metrics.lucroLiquido)}`,
    `Margem: ${metrics.margemPercentual.toFixed(1)}%`,
    `Break-even (na faixa): ${be}`,
  ].join("\n");
}

export async function shareTextOrCopy(text: string): Promise<"shared" | "copied" | "aborted"> {
  if (navigator.share) {
    try {
      await navigator.share({ title: "Argo — Dashboard financeiro", text });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "aborted";
      if (e instanceof Error && e.name === "AbortError") return "aborted";
    }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}

export async function exportElementToPngBlob(element: HTMLElement): Promise<Blob | null> {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    scale: Math.min(2, (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 2),
    useCORS: true,
    logging: false,
    backgroundColor: "#f8fafc",
    ignoreElements: (node) => node.classList?.contains("no-capture") ?? false,
  });
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 0.92);
  });
}

export async function sharePngOrDownload(blob: Blob, baseFileName: string): Promise<void> {
  const file = new File([blob], `${baseFileName}.png`, { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title: "Argo — Dashboard", files: [file] });
      return;
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseFileName}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
