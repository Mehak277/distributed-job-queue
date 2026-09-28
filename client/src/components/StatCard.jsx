export default function StatCard({ label, value, icon: Icon, tone, description }) {
  return <article className={`stat-card stat-${tone}`}>
    <div className="stat-heading"><span className="stat-icon"><Icon size={17} strokeWidth={2} /></span><span className="stat-label">{label}</span></div>
    <strong className="stat-value">{Number(value || 0).toLocaleString()}</strong>
    <span className="stat-description">{description}</span>
  </article>;
}