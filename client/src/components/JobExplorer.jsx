import { ArrowRight, RefreshCw, SlidersHorizontal } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { useState } from "react";
import { useJobs } from "../hooks/useJobs";
import JobFilters from "./JobFilters";
import JobTable from "./JobTable";
import Pagination from "./Pagination";

export default function JobExplorer({ title, description, failedOnly = false, pageSize = 10, viewAllTo, compact = false }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(failedOnly ? "failed" : "");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const { onView, onRetry, retryingId } = useOutletContext();
  const { jobs, totalPages: apiTotalPages, loading, error, refresh } = useJobs({
    page,
    pageSize,
    status: failedOnly ? "failed" : status,
    priority: failedOnly ? "" : priority,
    failedOnly,
  });

  const query = search.trim().toLowerCase();
  const filtered = jobs.filter((job) => {
    if (failedOnly && priority && String(job.priority) !== priority) return false;
    if (!query) return true;
    return [job.id, job.type, job.status, job.priority, job.error_message].some((value) => String(value ?? "").toLowerCase().includes(query));
  });
  const totalPages = failedOnly ? Math.max(Math.ceil(filtered.length / pageSize), 1) : apiTotalPages;
  const visibleJobs = failedOnly ? filtered.slice((page - 1) * pageSize, page * pageSize) : filtered;
  const clearFilters = () => { setSearch(""); setStatus(failedOnly ? "failed" : ""); setPriority(""); setPage(1); };

  return <section className={`jobs-panel${compact ? " jobs-panel-compact" : ""}`}>
    {(title || viewAllTo) && <div className="section-header">
      <div><span className="section-kicker">{failedOnly ? "Attention required" : "Queue activity"}</span><h2>{title}</h2><p>{description}</p></div>
      <div className="section-tools">
        {failedOnly && <span className="failed-total">{jobs.length.toLocaleString()} failed {jobs.length === 1 ? "job" : "jobs"}</span>}
        {viewAllTo && <Link className="text-link" to={viewAllTo}>View all jobs <ArrowRight size={15} /></Link>}
      </div>
    </div>}
    <div className="jobs-toolbar">
      <JobFilters search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} status={status} onStatusChange={(value) => { setStatus(value); setPage(1); }} priority={priority} onPriorityChange={(value) => { setPriority(value); setPage(1); }} onClear={clearFilters} showStatus={!failedOnly} />
      <div className="table-meta"><span><SlidersHorizontal size={14} /> {filtered.length.toLocaleString()} {failedOnly ? "matching" : "on this page"}</span><button className="refresh-table" type="button" onClick={refresh} disabled={loading} aria-label="Refresh job list"><RefreshCw size={15} className={loading ? "icon-spin" : ""} /></button></div>
    </div>
    {error && <div className="request-error" role="alert"><span>{error}</span><button className="button button-secondary" onClick={refresh}>Try again</button></div>}
    <JobTable jobs={visibleJobs} loading={loading} onView={onView} onRetry={onRetry} retryingId={retryingId} />
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
  </section>;
}