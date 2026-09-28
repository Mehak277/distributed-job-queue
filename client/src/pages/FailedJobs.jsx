import { AlertTriangle } from "lucide-react";
import { useDashboard } from "../context/useDashboard";
import JobExplorer from "../components/JobExplorer";

export default function FailedJobs() {
  const { stats } = useDashboard();
  const failedCount = Number(stats?.failed || 0);
  return <div className="page-stack">
    <div className="failed-summary"><span className="failed-summary-icon"><AlertTriangle size={20} /></span><div><strong>{failedCount.toLocaleString()} Failed Jobs</strong><span>Jobs that require attention</span></div><span className="failed-summary-note">Latest failures first</span></div>
    <JobExplorer title="Failed Jobs" description="Review errors, inspect payloads and retry work" failedOnly pageSize={10} />
  </div>;
}