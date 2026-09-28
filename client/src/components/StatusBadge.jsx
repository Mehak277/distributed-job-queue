const LABELS = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export default function StatusBadge({ status }) {
  const value = String(status || "unknown").toLowerCase();
  return <span className={`status-badge status-${value}`}><span className="status-dot" />{LABELS[value] || "Unknown"}</span>;
}