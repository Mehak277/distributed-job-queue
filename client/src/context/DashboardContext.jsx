import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { DashboardContext } from "./dashboard-context";

const PREFERENCES_KEY = "jobqueue-dashboard-preferences";

function readPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "{}");
    return {
      autoRefresh: stored.autoRefresh ?? true,
      refreshInterval: [5, 15, 30, 60].includes(Number(stored.refreshInterval)) ? Number(stored.refreshInterval) : 5,
      theme: ["light", "dark"].includes(stored.theme) ? stored.theme : "light",
    };
  } catch {
    return { autoRefresh: true, refreshInterval: 5, theme: "light" };
  }
}

export function DashboardProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [preferences, setPreferences] = useState(readPreferences);

  const refreshStats = useCallback(async () => {
    try {
      const nextStats = await api.getStats();
      setStats(nextStats);
      setApiConnected(true);
      setLastUpdated(new Date());
    } catch (error) {
      setApiConnected(Boolean(error.status));
    }
  }, []);

  const refreshAll = useCallback(() => {
    setRefreshKey((current) => current + 1);
    return refreshStats();
  }, [refreshStats]);

  const updatePreferences = useCallback((updates) => {
    setPreferences((current) => ({ ...current, ...updates }));
  }, []);

  const reportApiConnection = useCallback((connected) => {
    setApiConnected(connected);
    if (connected) setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const initialRefresh = setTimeout(refreshStats, 0);
    if (!preferences.autoRefresh) return () => clearTimeout(initialRefresh);
    const interval = setInterval(refreshStats, preferences.refreshInterval * 1000);
    return () => {
      clearTimeout(initialRefresh);
      clearInterval(interval);
    };
  }, [preferences.autoRefresh, preferences.refreshInterval, refreshStats]);

  const value = useMemo(() => ({
    stats,
    apiConnected,
    lastUpdated,
    refreshKey,
    refreshAll,
    refreshStats,
    reportApiConnection,
    preferences,
    updatePreferences,
  }), [stats, apiConnected, lastUpdated, refreshKey, refreshAll, refreshStats, reportApiConnection, preferences, updatePreferences]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

