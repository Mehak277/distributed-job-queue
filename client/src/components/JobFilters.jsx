import { Search, X } from "lucide-react";

export default function JobFilters({ search, onSearchChange, status, onStatusChange, priority, onPriorityChange, onClear, showStatus = true }) {
  return <div className="jobs-filters">
    <label className="search-control">
      <Search size={17} aria-hidden="true" />
      <input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search jobs..." aria-label="Search jobs" />
      {search && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => onSearchChange("")}><X size={14} /></button>}
    </label>
    {showStatus && <label className="filter-select"><span className="sr-only">Status</span><select value={status} onChange={(event) => onStatusChange(event.target.value)}>
      <option value="">All statuses</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="failed">Failed</option>
    </select></label>}
    <label className="filter-select"><span className="sr-only">Priority</span><select value={priority} onChange={(event) => onPriorityChange(event.target.value)}>
      <option value="">All priorities</option><option value="1">Priority 1 · High</option><option value="2">Priority 2 · High</option><option value="3">Priority 3 · Medium</option><option value="4">Priority 4 · Low</option><option value="5">Priority 5 · Low</option>
    </select></label>
    <button className="button button-ghost clear-filters" onClick={onClear}>Clear filters</button>
  </div>;
}