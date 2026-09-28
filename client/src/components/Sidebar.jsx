import { Activity, AlertTriangle, BarChart3, BriefcaseBusiness, ChevronRight, CircleHelp, Gauge, LayoutDashboard, Settings2 } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useDashboard } from "../context/useDashboard";

const links = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, group: "Workspace" },
  { label: "Jobs", to: "/jobs", icon: BriefcaseBusiness, group: "Workspace" },
  { label: "Failed Jobs", to: "/failed", icon: AlertTriangle, group: "Workspace", badge: true },
  { label: "Statistics", to: "/statistics", icon: BarChart3, group: "Workspace" },
];

export default function Sidebar({ open, onClose }) {
  const { stats, apiConnected } = useDashboard();
  const groups = ["Workspace", "System", "Preferences"];

  return <>
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <NavLink className="brand" to="/" onClick={onClose}>
        <span className="brand-mark"><Activity size={19} strokeWidth={2.6} /></span>
        <span>JobQueue</span>
      </NavLink>
      <nav className="side-navigation" aria-label="Main navigation">
        {groups.map((group) => <div className="nav-group" key={group}>
          <div className="nav-label">{group}</div>
          {group === "Workspace" && links.map(({ label, to, icon: Icon, badge }) => <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Icon size={17} strokeWidth={1.9} />
            <span>{label}</span>
            {badge && <span className="nav-badge">{stats?.failed ?? "–"}</span>}
          </NavLink>)}
          {group === "System" && <>
            <Link className="nav-item" to="/#system-overview" onClick={() => {
              onClose();
              window.setTimeout(() => document.getElementById("system-overview")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
            }}>
              <Gauge size={17} strokeWidth={1.9} /><span>Queue Monitor</span>
            </Link>
            <div className="nav-item nav-unavailable" title="Worker health is not exposed by the current API">
              <CircleHelp size={17} strokeWidth={1.9} /><span>Worker Status</span><span className="unavailable-mark">N/A</span>
            </div>
          </>}
          {group === "Preferences" && <NavLink className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} to="/settings" onClick={onClose}>
            <Settings2 size={17} strokeWidth={1.9} /><span>Settings</span><ChevronRight className="nav-chevron" size={14} />
          </NavLink>}
        </div>)}
      </nav>
      <div className="sidebar-footer">
        <span className={`connection-dot ${apiConnected ? "connected" : "disconnected"}`} />
        <span>{apiConnected ? "API Connected" : "API Unavailable"}</span>
      </div>
    </aside>
    {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
  </>;
}