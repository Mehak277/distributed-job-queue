import { Activity, CheckCircle2, CircleDot, Layers3, Timer, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboard } from "../context/useDashboard";
import JobExplorer from "../components/JobExplorer";
import StatCard from "../components/StatCard";
import SystemOverview from "../components/SystemOverview";

const cards = [
  { key: "total", label: "Total Jobs", icon: Layers3, tone: "slate", description: "All queued jobs" },
  { key: "pending", label: "Pending", icon: Timer, tone: "amber", description: "Waiting in queue" },
  { key: "processing", label: "Processing", icon: Activity, tone: "blue", description: "Currently running" },
  { key: "completed", label: "Completed", icon: CheckCircle2, tone: "green", description: "Successfully processed" },
  { key: "failed", label: "Failed", icon: TriangleAlert, tone: "red", description: "Require attention" },
];

export default function Dashboard() {
  const { stats, apiConnected } = useDashboard();
  return <div className="page-stack">
    <section className="stats-grid" aria-label="Job statistics">
      {cards.map(({ key, ...card }) => <StatCard key={key} {...card} value={stats?.[key]} />)}
    </section>
    <SystemOverview stats={stats || {}} apiConnected={apiConnected} />
    <JobExplorer title="Recent Jobs" description="Latest background jobs processed by the queue" viewAllTo="/jobs" pageSize={10} />
    <div className="dashboard-footnote"><CircleDot size={14} />Job totals and queue activity are refreshed from the backend. <Link to="/statistics">View statistics</Link></div>
  </div>;
}