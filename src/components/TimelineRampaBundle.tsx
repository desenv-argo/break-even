import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { AcquisitionTimelineLine } from "./AcquisitionTimelineChart";
import { HealthRampChartBody } from "./HealthRampChart";
import { RampaToolbarInline } from "./RampaToolbarInline";
import type { AcquisitionTimelinePoint } from "../utils/timelineSimulation";

type TimelineRampaBundleProps = {
  points: AcquisitionTimelinePoint[];
  rampLegenda: string;
};

/** Um único card: parâmetros da rampa + dois gráficos de linha do tempo. */
export function TimelineRampaBundle({ points, rampLegenda }: TimelineRampaBundleProps) {
  return (
    <Card
      title="Linha do tempo da rampa"
      subTitle={`${points.length} meses · ${rampLegenda}. Nos gráficos abaixo, cada eixo segue estes parâmetros.`}
      className="panel-card timeline-rampa-bundle"
    >
      <RampaToolbarInline />

      <Divider className="timeline-rampa-divider" />

      <section className="timeline-rampa-section" aria-labelledby="timeline-rec-desp">
        <h3 id="timeline-rec-desp" className="timeline-rampa-kicker">
          Receitas × despesas
        </h3>
        <p className="timeline-rampa-desc">Uma linha por fonte de receita e por rubrica de despesa em cada mês.</p>
        <AcquisitionTimelineLine points={points} />
      </section>

      {points.length > 0 ? (
        <>
          <Divider className="timeline-rampa-divider" />
          <section className="timeline-rampa-section" aria-labelledby="timeline-lucro">
            <h3 id="timeline-lucro" className="timeline-rampa-kicker">
              Lucro e margem
            </h3>
            <p className="timeline-rampa-desc">Barras: lucro líquido do mês. Linha: margem sobre a receita bruta.</p>
            <HealthRampChartBody points={points} />
          </section>
        </>
      ) : null}
    </Card>
  );
}
