import { Menu, RefreshCw } from "lucide-react";
import { useDashboard } from "../context/useDashboard";

export default function Topbar({ title, description, onMenu }) {
  const { apiConnected, lastUpdated, refreshAll, preferences } = useDashboard();
  const updatedLabel = lastUpdated ? "just now" : "Waiting for API";

  return <header className="topbar">
    <button className="menu-button icon-button" onClick={onMenu} aria-label="Open navigation"><Menu size={19} /></button>
    <div className="topbar-heading">
      <div className="breadcrumb">Workspace <span>/</span> {title}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    <div className="topbar-tools">
      <div className={`system-pill ${apiConnected ? "is-online" : "is-offline"}`}><span />{apiConnected ? "System Operational" : "API Unavailable"}</div>
      <div className="live-meta"><span className="live-indicator" /> <strong>Live</strong><span className="meta-dot">·</span>{preferences.autoRefresh ? `Updated ${updatedLabel}` : "Auto-refresh paused"}</div>
      <button className="button button-secondary header-refresh" onClick={refreshAll}>
        <RefreshCw size={15} /><span>Refresh</span>
      </button>
    </div>
  </header>;
}