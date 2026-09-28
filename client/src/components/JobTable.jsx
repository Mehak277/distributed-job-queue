import { Eye, RotateCw } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function SkeletonRows() {
  return <div className="table-skeleton" aria-label="Loading jobs" aria-busy="true">
    {Array.from({ length: 6 }, (_, index) => <div className="table-skeleton-row" key={index}><i /><i /><i /><i /><i /><i /><i /></div>)}
  </div>;
}

export default function JobTable({ jobs, loading, onView, onRetry, retryingId }) {
  if (loading) return <SkeletonRows />;
  if (!jobs.length) return <div className="empty-state"><span className="empty-mark">∅</span><strong>No jobs found</strong><p>Try changing your search or filters.</p></div>;

  return <div className="table-scroll">
    <table className="jobs-table">
      <thead><tr><th>ID</th><th>Job</th><th>Status</th><th>Priority</th><th>Attempts</th><th>Created</th><th>Updated</th><th>Action</th></tr></thead>
      <tbody>{jobs.map((job) => <tr key={job.id}>
        <td className="job-id">#{job.id}</td>
        <td className="job-description-cell">
          <strong>{job.type || "Untyped job"}</strong>
          {job.error_message && <span className="job-error-text" title={job.error_message}>{job.error_message}</span>}
        </td>
        <td><StatusBadge status={job.status} /></td>
        <td><PriorityBadge priority={job.priority} /></td>
        <td className="attempt-count">{job.attempts ?? 0}</td>
        <td className="date-cell">{formatDate(job.created_at)}</td>
        <td className="date-cell">{formatDate(job.updated_at)}</td>
        <td><div className="job-actions">
          {job.status === "failed" && <button className="button button-retry" onClick={() => onRetry(job)} disabled={retryingId === job.id}>
            <RotateCw size={14} className={retryingId === job.id ? "icon-spin" : ""} />{retryingId === job.id ? "Retrying" : "Retry"}
          </button>}
          <button className="button button-view" onClick={() => onView(job)} aria-label={`View job ${job.id}`}><Eye size={15} /><span>View</span></button>
        </div></td>
      </tr>)}</tbody>
    </table>
  </div>;
}