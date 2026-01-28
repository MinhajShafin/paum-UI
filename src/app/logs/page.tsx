"use client";

import { useState, useMemo } from "react";
import MainLayout from "@/components/MainLayout";
import { usePaumIoTContext } from "@/components/providers";
import type { SensorReading } from "@/lib/api";

type LogLevel = "all" | "info" | "warn" | "error";

function SensorLogLine({ reading }: { reading: SensorReading }) {
  const time = new Date(reading.timestamp > 1e12 ? reading.timestamp : reading.timestamp * 1000);
  const timeStr = time.toLocaleTimeString("en-US", { hour12: false });
  
  return (
    <div className="log-line">
      <span className="log-time">[{timeStr}]</span> {reading.device_id} →{" "}
      {reading.protocol} → /sensors/{reading.sensor_type} :{" "}
      {`{"${reading.sensor_type}":${reading.value.toFixed(1)}}`}
    </div>
  );
}

export default function Logs() {
  const { connectionState, sensors, loading } = usePaumIoTContext();
  const [levelFilter, setLevelFilter] = useState<LogLevel>("all");
  const [textFilter, setTextFilter] = useState("");
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  const isConnected = connectionState === "connected";

  // Filter sensors based on text filter
  const filteredSensors = useMemo(() => {
    if (textFilter === "") return sensors;
    const lower = textFilter.toLowerCase();
    return sensors.filter(s => 
      s.device_id.toLowerCase().includes(lower) ||
      s.sensor_type.toLowerCase().includes(lower) ||
      s.protocol.toLowerCase().includes(lower)
    );
  }, [sensors, textFilter]);

  // Get pinned readings
  const pinnedReadings = useMemo(() => {
    return sensors.filter(s => pinnedIds.has(`${s.device_id}-${s.timestamp}`));
  }, [sensors, pinnedIds]);

  // Stats
  const stats = useMemo(() => {
    // In a real app, we'd have error/warning classifications
    // For now, just show counts
    return {
      errors: 0,
      warnings: sensors.filter(s => s.value > 50).length, // Example threshold
      info: sensors.length,
    };
  }, [sensors]);

  const togglePin = (reading: SensorReading) => {
    const id = `${reading.device_id}-${reading.timestamp}`;
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDownload = () => {
    const data = filteredSensors.map(s => ({
      timestamp: new Date(s.timestamp > 1e12 ? s.timestamp : s.timestamp * 1000).toISOString(),
      device_id: s.device_id,
      sensor_type: s.sensor_type,
      value: s.value,
      unit: s.unit,
      protocol: s.protocol,
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paumiot-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout
      title="Activity Logs"
      subtitle="Tail and search recent events across devices"
    >
      <section className="row">
        <div className="card col-12">
          <h3>Log Stream</h3>
          <p className="sub">Live tail with quick export and level filters</p>

          <div className="mt-12 inline-center-wrap">
            <select 
              aria-label="Log level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LogLevel)}
            >
              <option value="all">All</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
            <input
              placeholder="Filter by device, message, topic..."
              className="flex-1 min-w-260"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
            />
            <button className="btn" onClick={handleDownload}>Download</button>
            <button className="btn ghost" onClick={() => setTextFilter("")}>Clear</button>
          </div>

          <div className="logs mt-12 h-420">
            {!isConnected ? (
              <div className="text-muted text-center py-4">
                Connect to server to view logs
              </div>
            ) : loading && sensors.length === 0 ? (
              <div className="text-muted text-center py-4">Loading logs...</div>
            ) : filteredSensors.length === 0 ? (
              <div className="text-muted text-center py-4">
                {textFilter ? "No logs match filter" : "No logs available"}
              </div>
            ) : (
              filteredSensors.slice(0, 20).map((reading, idx) => (
                <SensorLogLine 
                  key={`${reading.device_id}-${reading.timestamp}-${idx}`} 
                  reading={reading} 
                />
              ))
            )}
          </div>
        </div>

        <div className="card col-4">
          <h3>Quick Stats</h3>
          <p className="sub">Aggregate counts from the current log window</p>
          <div className="status-grid mt-10">
            <div className="status">
              <div className="label">Errors</div>
              <div className="value text-danger">{stats.errors}</div>
            </div>
            <div className="status">
              <div className="label">Warnings</div>
              <div className="value text-lime">{stats.warnings}</div>
            </div>
            <div className="status">
              <div className="label">Info</div>
              <div className="value">{stats.info}</div>
            </div>
          </div>

          <div className="mt-12">
            <div className="text-muted label-sm">
              Total readings: {sensors.length}
            </div>
            <div className="mt-8">
              <button className="btn">Rotate Logs</button>
            </div>
          </div>
        </div>

        <div className="card col-8">
          <h3>Pinned Events</h3>
          <p className="sub">Click on log entries to pin important items</p>
          <div className="mt-10">
            <div className="inline-center">
              <button 
                className="btn ghost" 
                onClick={() => setPinnedIds(new Set())}
                disabled={pinnedIds.size === 0}
              >
                Clear Pins
              </button>
              <button className="btn" onClick={handleDownload}>Export Selection</button>
            </div>

            <div className="logs mt-12">
              {pinnedReadings.length === 0 ? (
                <div className="text-muted text-center py-4">
                  No pinned events. Click on log entries to pin them.
                </div>
              ) : (
                pinnedReadings.map((reading, idx) => (
                  <SensorLogLine 
                    key={`pinned-${reading.device_id}-${reading.timestamp}-${idx}`} 
                    reading={reading} 
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>© 2025 PaumIoT</div>
        <div className="text-muted">
          IoT Middleware Dashboard • Dark Lime theme
        </div>
      </footer>
    </MainLayout>
  );
}
