import { useState, useEffect, useRef } from "react";
import { syncAllSpells } from "../api/localApi";
import "../styles/Admin.css";

export function AdminPanel() {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    name: string;
  } | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  // Clean up the EventSource if the component unmounts mid-sync
  useEffect(() => {
    return () => {
      sourceRef.current?.close();
    };
  }, []);

  const handleSync = () => {
    setSyncing(true);
    setSyncStatus("idle");
    setProgress(null);

    sourceRef.current = syncAllSpells(
      (current, total, name) => {
        setProgress({ current, total, name });
      },
      () => {
        setSyncing(false);
        setSyncStatus("success");
        setProgress(null);
      },
      () => {
        setSyncing(false);
        setSyncStatus("error");
        setProgress(null);
      },
    );
  };

  const progressPercent = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <section className="admin-panel">
      <h2>Admin Panel</h2>
      <div className="admin-section">
        <h3>Sync Spell Data</h3>
        <p>
          Fetches all spells from the D&D API and populates the local database
          with class and subclass associations. This will take a few minutes.
        </p>
        <button
          className="admin-sync-button"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? "Syncing..." : "Sync All Spells"}
        </button>
        {syncing && progress && (
          <div className="admin-progress">
            <div className="admin-progress-track" style={{ marginTop: "1rem" }}>
              <div
                className="admin-progress-fill"
                style={{
                  height: "8px",
                  background: "var(--ink)",
                  borderRadius: "4px",
                  width: `${progressPercent}%`,
                  transition: "width 0.2s ease",
                }}
              />
            </div>
            <p className="admin-progress-label">
              {progress.current} / {progress.total} — {progress.name}
            </p>
          </div>
        )}
        {syncStatus === "success" && (
          <p className="admin-status-success">
            Sync complete! All spells names/indexes have been cached to quick
            reference lists.
          </p>
        )}
        {syncStatus === "error" && (
          <p className="admin-status-error">
            Sync failed. Check that the server is running and try again.
          </p>
        )}
      </div>
    </section>
  );
}
