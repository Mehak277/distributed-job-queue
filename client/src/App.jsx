import { useCallback, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { DashboardProvider } from "./context/DashboardContext.jsx";
import { useDashboard } from "./context/useDashboard";
import { api } from "./services/api";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import JobDetailsDrawer from "./components/JobDetailsDrawer";
import Dashboard from "./pages/Dashboard";
import FailedJobs from "./pages/FailedJobs";
import Jobs from "./pages/Jobs";
import Settings from "./pages/Settings";
import Statistics from "./pages/Statistics";
import "./App.css";

const PAGE_CONTENT = {
  "/": ["Dashboard", "Monitor background jobs, queue activity and processing health."],
  "/jobs": ["Jobs", "Search, filter and manage background jobs."],
  "/failed": ["Failed Jobs", "Jobs that need review or another attempt."],
  "/statistics": ["Statistics", "Understand queue volume and job outcomes."],
  "/settings": ["Settings", "Configure dashboard behavior and appearance."],
};

function DashboardLayout() {
  const location = useLocation();
  const { refreshAll, reportApiConnection } = useDashboard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [retryingId, setRetryingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [title, description] = PAGE_CONTENT[location.pathname] || PAGE_CONTENT["/"];

  const viewJob = useCallback(async (job) => {
    setSelectedJob(job);
    setJobDetails(null);
    setDetailsError("");
    setDetailsLoading(true);
    try {
      const details = await api.getJob(job.id);
      setJobDetails(details);
      reportApiConnection(true);
    } catch (error) {
      setDetailsError(error.message || "Unable to load job details.");
      reportApiConnection(!error.status);
    } finally {
      setDetailsLoading(false);
    }
  }, [reportApiConnection]);

  const retryJob = useCallback(async (job) => {
    setRetryingId(job.id);
    setActionMessage("");
    try {
      await api.retryJob(job.id);
      reportApiConnection(true);
      setActionMessage(`Retry scheduled for job #${job.id}.`);
      await refreshAll();
      setSelectedJob(null);
    } catch (error) {
      setActionMessage(error.message || `Unable to retry job #${job.id}.`);
      if (!error.status) reportApiConnection(false);
    } finally {
      setRetryingId(null);
      window.setTimeout(() => setActionMessage(""), 4500);
    }
  }, [refreshAll, reportApiConnection]);

  return <div className="app-shell">
    <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    <div className="main-content">
      <Topbar title={title} description={description} onMenu={() => setMobileMenuOpen(true)} />
      <main className="route-content"><Outlet context={{ onView: viewJob, onRetry: retryJob, retryingId }} /></main>
      <footer className="app-footer"><span>JobQueue Admin</span><span>Queue management <i /> Live backend data</span></footer>
    </div>
    {actionMessage && <div className="action-toast" role="status">{actionMessage}</div>}
    <JobDetailsDrawer job={selectedJob} details={jobDetails} loading={detailsLoading} error={detailsError} onClose={() => setSelectedJob(null)} onRetry={retryJob} retrying={retryingId === selectedJob?.id} />
  </div>;
}

export default function App() {
  return <DashboardProvider><BrowserRouter><Routes>
    <Route element={<DashboardLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="jobs" element={<Jobs />} />
      <Route path="failed" element={<FailedJobs />} />
      <Route path="statistics" element={<Statistics />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes></BrowserRouter></DashboardProvider>;
}