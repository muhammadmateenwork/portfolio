"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import { XCircle, AlertTriangle, WifiOff, Database, RefreshCw } from "lucide-react";

interface DbStatus {
  configured: boolean;
  connected: boolean;
  error: string | null;
  status: "connected" | "error" | "not_configured";
}

// External store for DB status
const dbStatusStore = {
  listeners: new Set<() => void>(),
  _status: null as DbStatus | null,

  subscribe(listener: () => void) {
    dbStatusStore.listeners.add(listener);
    return () => dbStatusStore.listeners.delete(listener);
  },

  getSnapshot() {
    return dbStatusStore._status;
  },

  getServerSnapshot() {
    return null;
  },

  setStatus(status: DbStatus | null) {
    dbStatusStore._status = status;
    dbStatusStore.listeners.forEach((l) => l());
  },
};

// Start polling on client
if (typeof window !== "undefined") {
  const poll = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        dbStatusStore.setStatus(await res.json());
      }
    } catch {
      dbStatusStore.setStatus({ configured: false, connected: false, error: "FETCH_FAILED", status: "not_configured" });
    }
  };
  poll();
  setInterval(poll, 60000);
}

export default function DbStatusBanner() {
  const dbStatus = useSyncExternalStore(
    dbStatusStore.subscribe,
    dbStatusStore.getSnapshot,
    dbStatusStore.getServerSnapshot
  );

  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        dbStatusStore.setStatus(data);
        if (data.connected) setChecking(false);
      }
    } catch {
      dbStatusStore.setStatus({ configured: false, connected: false, error: "FETCH_FAILED", status: "not_configured" });
    }
    setChecking(false);
  }, []);

  if (!dbStatus || dbStatus.connected || dismissed) return null;

  const getErrorInfo = () => {
    switch (dbStatus.error) {
      case "IP_NOT_WHITELISTED":
        return {
          title: "MongoDB Atlas: IP Not Whitelisted",
          message: "Your current IP is not allowed. Go to Atlas → Network Access → Add IP (use 0.0.0.0/0 to allow all).",
          color: "border-red-500/50 bg-red-500/10 text-red-300",
          icon: <XCircle className="h-5 w-5 text-red-400 shrink-0" />,
        };
      case "AUTH_FAILED":
        return {
          title: "MongoDB: Authentication Failed",
          message: "Check your MONGO_URI credentials (username/password) in .env file.",
          color: "border-red-500/50 bg-red-500/10 text-red-300",
          icon: <XCircle className="h-5 w-5 text-red-400 shrink-0" />,
        };
      case "CONNECTION_TIMEOUT":
        return {
          title: "MongoDB: Connection Timeout",
          message: "Could not reach the database. Check your internet connection and Atlas cluster status.",
          color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
          icon: <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />,
        };
      case "CONNECTION_REFUSED":
        return {
          title: "MongoDB: Connection Refused",
          message: "Local MongoDB is not running. Start it with 'mongod' or switch to MongoDB Atlas URI.",
          color: "border-red-500/50 bg-red-500/10 text-red-300",
          icon: <XCircle className="h-5 w-5 text-red-400 shrink-0" />,
        };
      case "NOT_CONFIGURED":
        return {
          title: "MongoDB: Not Configured",
          message: "MONGO_URI is not set in .env file. Your data will NOT be saved.",
          color: "border-red-500/50 bg-red-500/10 text-red-300",
          icon: <WifiOff className="h-5 w-5 text-red-400 shrink-0" />,
        };
      case "RETRY_COOLDOWN":
        return {
          title: "MongoDB: Temporarily Unavailable",
          message: "Connection failed recently. Retrying automatically...",
          color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
          icon: <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />,
        };
      default:
        return {
          title: "MongoDB: Connection Error",
          message: "Database is not connected. Your changes will NOT be saved!",
          color: "border-red-500/50 bg-red-500/10 text-red-300",
          icon: <Database className="h-5 w-5 text-red-400 shrink-0" />,
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div className={`mx-4 mt-4 p-4 rounded-xl border ${errorInfo.color} flex items-start gap-3`}>
      {errorInfo.icon}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{errorInfo.title}</p>
        <p className="text-xs mt-1 opacity-80">{errorInfo.message}</p>
        <p className="text-xs mt-2 font-medium opacity-90">
          ⚠️ Any changes you make now will be lost on refresh — data is NOT being saved!
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={checkHealth}
          disabled={checking}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Retry connection"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
