import { Activity, AlertTriangle, CheckCircle2, Layers3, Timer } from "lucide-react";
import { useDashboard } from "../context/useDashboard";

const series = [
  { key: "completed", label: "Completed", icon: CheckCircle2, tone: "green" },
  { key: "failed", label: "Failed", icon: AlertTriangle, tone: "red" },
  { key: "pending", label: "Pending", icon: Timer, tone: "amber" },
  { key: "processing", label: "Processing", icon: Activity, tone: "blue" },
];

export default function Statistics() {
  const { stats } = useDashboard();
  const values = Object.fromEntries(["total", "completed", "failed", "pending", "processing"].map((key) => [key, Number(stats?.[key] || 0)]));
  const finalized = values.completed + values.failed;
  const successRate = finalized ? values.completed / finalized * 100 : 0;
  const failureRate = finalized ? values.failed / finalized * 100 : 0;
  return <div className="page-stack">
    <section className="distribution-panel">
      <div className="section-header"><div><span className="section-kicker">Live from the queue</span><h2>Job status distribution</h2><p>Current totals by processing state</p></div><span className="distribution-total"><Layers3 size={16} />{values.total.toLocaleString()} total</span></div>
      <div className="distribution-content">{series.map(({ key, label, icon: Icon, tone }) => {
        const count = values[key];
        const width = values.total ? count / values.total * 100 : 0;
        return <div className={`distribution-row distribution-${tone}`} key={key}>
          <div className="distribution-label"><Icon size={17} /><span>{label}</span></div>
          <div className="distribution-track"><span style={{ width: `${width}%` }} /></div>
          <strong>{count.toLocaleString()}</strong><small>{width.toFixed(1)}%</small>
        </div>;
      })}</div>
    </section>
    <section className="rates-grid" aria-label="Job outcome rates">
      <article className="rate-card rate-success"><div><span>Success rate</span><CheckCircle2 size={18} /></div><strong>{successRate.toFixed(1)}%</strong><p>{values.completed.toLocaleString()} completed of {finalized.toLocaleString()} finalized jobs</p><div className="rate-track"><span style={{ width: `${successRate}%` }} /></div></article>
      <article className="rate-card rate-failure"><div><span>Failure rate</span><AlertTriangle size={18} /></div><strong>{failureRate.toFixed(1)}%</strong><p>{values.failed.toLocaleString()} failed of {finalized.toLocaleString()} finalized jobs</p><div className="rate-track"><span style={{ width: `${failureRate}%` }} /></div></article>
    </section>
    <p className="statistics-note">Rates use completed + failed jobs as the finalized-job denominator. All values come from <code>GET /jobs/stats</code>.</p>
  </div>;
}