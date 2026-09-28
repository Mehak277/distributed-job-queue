import { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

function dateLabel(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function safePayload(value) {
  const hiddenKey = /password|secret|token|authorization|api[_-]?key|credential|private[_-]?key/i;
  if (Array.isArray(value)) return value.map(safePayload);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, hiddenKey.test(key) ? "[REDACTED]" : safePayload(item)]));
  }
  return value;
}

function payloadText(payload) {
  if (typeof payload === "string") {
    try { return JSON.stringify(safePayload(JSON.parse(payload)), null, 2); }
    catch { return "Unstructured payload hidden for safety."; }
  }
  return JSON.stringify(safePayload(payload), null, 2);
}

export default function JobDetailsDrawer({ job, details, loading, error, onClose, onRetry, retrying }) {
  useEffect(() => {
    if (!job) return undefined;
    const handleKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [job, onClose]);

  if (!job) return null;
  const record = details || job;
  return <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="job-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <header className="drawer-header"><div><span className="section-kicker">Job details</span><h2 id="drawer-title">Job #{job.id}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close job details"><X size={18} /></button></header>
      {loading ? <div className="drawer-loading"><span className="loading-ring" />Loading job details</div> : error ? <div className="request-error drawer-error" role="alert"><AlertCircle size={16} />{error}</div> : <div className="drawer-content">
        <section className="drawer-section"><h3>Overview</h3><div className="drawer-overview-grid">
          <div><span>Status</span><StatusBadge status={record.status} /></div>
          <div><span>Priority</span><PriorityBadge priority={record.priority} /></div>
          <div><span>Attempts</span><strong>{record.attempts ?? 0}</strong></div>
          <div><span>Type</span><strong>{record.type || "—"}</strong></div>
          <div><span>Created</span><strong>{dateLabel(record.created_at)}</strong></div>
          <div><span>Updated</span><strong>{dateLabel(record.updated_at)}</strong></div>
        </div></section>
        {record.error_message && <section className="drawer-section"><h3>Error</h3><p className="drawer-job-error">{record.error_message}</p></section>}
        {record.payload !== undefined && <section className="drawer-section"><h3>Payload</h3><pre className="payload-code">{payloadText(record.payload)}</pre></section>}
      </div>}
      <footer className="drawer-footer"><button className="button button-secondary" onClick={onClose}>Close</button>{record.status === "failed" && <button className="button button-retry-primary" onClick={() => onRetry(job)} disabled={retrying}>{retrying ? "Retrying..." : "Retry Job"}</button>}</footer>
    </aside>
  </div>;
}