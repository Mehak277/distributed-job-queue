import { Activity, AlertTriangle, Check, CircleHelp, Clock3, Server, Workflow } from "lucide-react";

const FLOW = [
  { key: "pending", label: "Pending", icon: Clock3 },
  { key: "processing", label: "Processing", icon: Activity },
  { key: "completed", label: "Completed", icon: Check },
  { key: "failed", label: "Failed", icon: AlertTriangle },
];

export default function SystemOverview({ stats = {}, apiConnected }) {
  const total = Number(stats.total || 0);
  return <section className="system-overview" id="system-overview">
    <div className="overview-heading"><div><span className="section-kicker">System Overview</span><h2>Queue activity</h2></div><span className="overview-total"><Workflow size={15} />{total.toLocaleString()} total jobs</span></div>
    <div className="queue-flow">
      {FLOW.map(({ key, label, icon: Icon }, index) => {
        const count = Number(stats[key] || 0);
        const share = total ? count / total * 100 : 0;
        return <div className={`flow-step flow-${key}`} key={key}>
          <div className="flow-label"><span className="flow-icon"><Icon size={16} /></span><span>{label}</span><strong>{count.toLocaleString()}</strong></div>
          <div className="flow-track"><span style={{ width: `${share}%` }} /></div>
          {index < FLOW.length - 1 && <span className="flow-connector" aria-hidden="true" />}
        </div>;
      })}
    </div>
    <div className="overview-footer">
      <div className="overview-signal"><span className={`connection-dot ${apiConnected ? "connected" : "disconnected"}`} /><div><strong>API</strong><span>{apiConnected ? "Connected" : "Unavailable"}</span></div></div>
      <div className="overview-signal"><Server size={17} /><div><strong>Queue data</strong><span>{total.toLocaleString()} recorded jobs</span></div></div>
      <div className="overview-signal overview-unavailable"><CircleHelp size={17} /><div><strong>Worker health</strong><span>Not exposed by API</span></div></div>
    </div>
  </section>;
}