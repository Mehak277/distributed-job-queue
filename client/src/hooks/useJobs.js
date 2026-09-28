import { useCallback, useEffect, useState } from "react";
import { useDashboard } from "../context/useDashboard";
import { api } from "../services/api";

export function useJobs({ page, pageSize, status, priority, failedOnly }) {
  const { refreshKey, preferences, reportApiConnection } = useDashboard();
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (failedOnly) {
        const failedJobs = await api.getFailedJobs();
        setJobs(Array.isArray(failedJobs) ? failedJobs : []);
        setTotalPages(1);
      } else {
        const result = await api.getJobs({ page, limit: pageSize, status, priority });
        setJobs(result.jobs || []);
        setTotalPages(Math.max(result.totalPages || 1, 1));
      }
      reportApiConnection(true);
      setError("");
    } catch (requestError) {
      reportApiConnection(Boolean(requestError.status));
      setError(requestError.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [failedOnly, page, pageSize, priority, reportApiConnection, status]);

  useEffect(() => {
    const initialLoad = setTimeout(load, 0);
    if (!preferences.autoRefresh) return () => clearTimeout(initialLoad);
    const interval = setInterval(load, preferences.refreshInterval * 1000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [load, preferences.autoRefresh, preferences.refreshInterval, refreshKey]);

  return { jobs, totalPages, loading, error, refresh: load };
}