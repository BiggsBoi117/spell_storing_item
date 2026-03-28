import { useState, useEffect, useRef } from "react";
import { syncAllSpells } from "../api/localApi";

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
    <section>
      <h2>Admin Panel</h2>
      <div>
        <h3>Sync Spell Data</h3>
        <p>
          Fetches all spells from the D&D API and populates the local database
          with class and subclass associations. Only needs to be run once.
        </p>
        <button onClick={handleSync} disabled={syncing}>
          {syncing ? "Syncing..." : "Sync All Spells"}
        </button>
        {syncing && progress && (
          <div>
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  height: "8px",
                  background: "var(--ink)",
                  borderRadius: "4px",
                  width: `${progressPercent}%`,
                  transition: "width 0.2s ease",
                }}
              />
            </div>
            <p>
              {progress.current} / {progress.total} — {progress.name}
            </p>
          </div>
        )}
        {syncStatus === "success" && (
          <p>Sync complete! All spells have been cached.</p>
        )}
        {syncStatus === "error" && (
          <p>Sync failed. Check that the server is running and try again.</p>
        )}
      </div>
    </section>
  );
}
