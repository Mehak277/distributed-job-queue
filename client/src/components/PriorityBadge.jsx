const PRIORITY_LABELS = { 1: "High", 2: "High", 3: "Medium", 4: "Low", 5: "Low" };

export default function PriorityBadge({ priority }) {
  const value = Number(priority);
  return <span className={`priority-badge priority-${value}`}><strong>{Number.isFinite(value) ? value : "–"}</strong><span>{PRIORITY_LABELS[value] || "Priority"}</span></span>;
}