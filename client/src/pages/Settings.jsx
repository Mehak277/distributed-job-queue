import { useDashboard } from "../context/useDashboard";
import { api } from "../services/api";

export default function Settings() {
  const { apiConnected, preferences, updatePreferences } = useDashboard();
  return <div className="settings-layout">
    <section className="settings-section">
      <div className="settings-section-heading"><span className="section-kicker">Preferences</span><h2>Dashboard</h2><p>Control background refresh behavior for this browser.</p></div>
      <div className="settings-row"><div><strong>Auto refresh</strong><span>Keep dashboard data synchronized automatically</span></div><label className="switch"><input type="checkbox" checked={preferences.autoRefresh} onChange={(event) => updatePreferences({ autoRefresh: event.target.checked })} /><span className="switch-track" /></label></div>
      <div className="settings-row"><div><strong>Refresh interval</strong><span>How often the dashboard requests updated data</span></div><select className="settings-select" value={preferences.refreshInterval} disabled={!preferences.autoRefresh} onChange={(event) => updatePreferences({ refreshInterval: Number(event.target.value) })}><option value="5">Every 5 seconds</option><option value="15">Every 15 seconds</option><option value="30">Every 30 seconds</option><option value="60">Every minute</option></select></div>
    </section>
    <section className="settings-section">
      <div className="settings-section-heading"><span className="section-kicker">Connection</span><h2>API</h2><p>Dashboard data is served by the existing backend API.</p></div>
      <div className="settings-row"><div><strong>Backend URL</strong><span className="settings-url">{api.baseUrl}</span></div><span className={`connection-state ${apiConnected ? "connected" : "disconnected"}`}><i />{apiConnected ? "Connected" : "Unavailable"}</span></div>
      <div className="settings-note">Worker, Redis and PostgreSQL health checks are not exposed by the current API.</div>
    </section>
    <section className="settings-section">
      <div className="settings-section-heading"><span className="section-kicker">Appearance</span><h2>Theme preference</h2><p>Choose a theme for this dashboard on this device.</p></div>
      <div className="theme-options" role="group" aria-label="Theme preference">
        <button className={`theme-option${preferences.theme === "light" ? " selected" : ""}`} onClick={() => updatePreferences({ theme: "light" })}><span className="theme-preview theme-preview-light" /><strong>Light</strong></button>
        <button className={`theme-option${preferences.theme === "dark" ? " selected" : ""}`} onClick={() => updatePreferences({ theme: "dark" })}><span className="theme-preview theme-preview-dark" /><strong>Dark</strong></button>
      </div>
    </section>
  </div>;
}