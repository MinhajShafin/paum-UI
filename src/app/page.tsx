"use client";

import MainLayout from "@/components/MainLayout";
import { usePaumIoTContext } from "@/components/providers";
import type { Device, SensorReading } from "@/lib/api";

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  // Handle both seconds and milliseconds timestamps
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = Math.floor((now - ts) / 1000);
  
  if (diff < 0) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function DeviceCard({ device }: { device: Device }) {
  return (
    <div className="device">
      <div className="meta">
        <div className={`dot ${device.online ? "online" : "offline"}`} aria-hidden></div>
        <div>
          <strong>{device.name || device.id}</strong>
          <small>
            {device.protocol.toLowerCase()}://{device.location || device.id} · {" "}
            {device.online ? `last ${formatRelativeTime(device.last_seen)}` : "offline"}
          </small>
        </div>
      </div>
      <div className="text-right">
        <small className="text-muted">
          {device.battery > 0 ? `${device.battery}%` : device.type}
        </small>
      </div>
    </div>
  );
}

function SensorLogEntry({ reading }: { reading: SensorReading }) {
  const time = new Date(reading.timestamp > 1e12 ? reading.timestamp : reading.timestamp * 1000);
  const timeStr = time.toLocaleTimeString("en-US", { hour12: false });
  
  return (
    <div className="log-line">
      <span className="log-time">[{timeStr}]</span>
      <span>
        {reading.device_id} → {reading.protocol} → /sensors/{reading.sensor_type} :{" "}
        {`{"${reading.sensor_type}":${reading.value.toFixed(1)}}`}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const {
    connectionState,
    devices,
    sensors,
    metrics,
    protocolStats,
    loading,
  } = usePaumIoTContext();

  const isConnected = connectionState === "connected";
  const recentSensors = sensors.slice(0, 6);

  // Calculate load percentage (mock based on messages per second)
  const loadPercent = metrics ? Math.min(100, Math.round((metrics.messages_per_second / 100) * 100)) : 0;

  return (
    <MainLayout
      title="Dashboard Overview"
      subtitle="Monitor connected devices, protocols and server health"
    >
      <section className="row">
        {/* Connected Devices */}
        <div className="card col-4">
          <h3>Connected Devices</h3>
          <p className="sub">Select a device to inspect or interact</p>
          <div className="device-list mt-8">
            {!isConnected ? (
              <div className="text-muted text-center py-4">
                Connect to server to view devices
              </div>
            ) : loading && devices.length === 0 ? (
              <div className="text-muted text-center py-4">Loading devices...</div>
            ) : devices.length === 0 ? (
              <div className="text-muted text-center py-4">No devices connected</div>
            ) : (
              devices.slice(0, 5).map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))
            )}
          </div>
        </div>

        {/* Protocol Actions */}
        <div className="card col-8">
          <h3>Protocol Actions</h3>
          <p className="sub">
            Choose device & protocol to send/request payloads
          </p>

          <div className="panel-ctrl mt-10">
            <div className="small-row">
              <div className="flex-1">
                <label className="text-muted label-sm">Device</label>
                <select aria-label="Choose device">
                  {devices.length === 0 ? (
                    <option>No devices</option>
                  ) : (
                    devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name || d.id}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="w-200">
                <label className="text-muted label-sm">Protocol</label>
                <select aria-label="Choose protocol">
                  <option>MQTT</option>
                  <option>CoAP</option>
                  <option>HTTP</option>
                  <option>PRIoTP-R</option>
                  <option>PRIoTP-U</option>
                </select>
              </div>
              <div className="w-160">
                <label className="text-muted label-sm">QoS / Options</label>
                <select>
                  <option>Default</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div className="two-col-300 mt-12">
              <textarea
                placeholder='{"temp": 26.4}'
                className="payload-area"
              ></textarea>

              <div className="display-flex-col">
                <button className="btn">Send Data</button>
                <button className="btn ghost">Request Data</button>
                <div className="mt-auto">
                  <div className="text-muted label-sm">Target:</div>
                  <div className="target-highlight">
                    /sensors/temp → {devices[0]?.id || "device"}
                  </div>
                  <div className="muted-small">
                    Last activity:{" "}
                    <strong className="text-lime">
                      {sensors[0] ? formatRelativeTime(sensors[0].timestamp) : "--"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Server Status */}
        <div className="card col-4">
          <h3>Server Status</h3>
          <p className="sub">Middleware health & metrics</p>
          <div className="status-grid mt-10">
            <div className="status">
              <div className="label">Uptime</div>
              <div className="value">
                {metrics?.uptime_seconds ? formatUptime(metrics.uptime_seconds) : "--"}
              </div>
              <div className="muted-small">
                {isConnected ? "Server running" : "Not connected"}
              </div>
            </div>
            <div className="status">
              <div className="label">Load</div>
              <div className="value text-cyan">{loadPercent}%</div>
              <div className="muted-small">
                {metrics?.messages_per_second || 0} msg/s
              </div>
            </div>
            <div className="status">
              <div className="label">Clients</div>
              <div className="value">{metrics?.active_connections || 0}</div>
              <div className="muted-small">Active connections</div>
            </div>
          </div>

          <div className="mt-14">
            <h3 className="h3-cyan">Protocol Stats</h3>
            <div className="justify-between">
              <small className="text-muted">MQTT</small>
              <strong className="text-lime">{protocolStats?.mqtt || 0}</strong>
            </div>
            <div className="justify-between mt-6">
              <small className="text-muted">CoAP</small>
              <strong className="text-muted">{protocolStats?.coap || 0}</strong>
            </div>
            <div className="justify-between mt-6">
              <small className="text-muted">HTTP</small>
              <strong className="text-muted">{protocolStats?.http || 0}</strong>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="card col-8">
          <h3>Activity Logs</h3>
          <p className="sub">Recent sensor readings (tail)</p>
          <div className="logs mt-10">
            {!isConnected ? (
              <div className="text-muted text-center py-4">
                Connect to server to view activity
              </div>
            ) : recentSensors.length === 0 ? (
              <div className="text-muted text-center py-4">
                No recent activity
              </div>
            ) : (
              recentSensors.map((reading, idx) => (
                <SensorLogEntry key={`${reading.device_id}-${reading.timestamp}-${idx}`} reading={reading} />
              ))
            )}
          </div>
        </div>
      </section>

      <div className="card justify-between-center">
        <div>
          <strong className="lead-strong">PaumIoT Middleware • Dashboard</strong>
          <div className="muted-note">
            {isConnected 
              ? `Connected to PaumIoT API • ${devices.length} devices • ${sensors.length} readings`
              : "Not connected — configure server URL above"
            }
          </div>
        </div>
        <div className="kpi">
          <div className="text-right">
            <div className="muted-small">Avg Latency</div>
            <strong>{metrics?.avg_latency_ms || 0} ms</strong>
          </div>
          <div className="text-right">
            <div className="muted-small">Messages</div>
            <strong className="text-primary">{metrics?.messages_total || 0}</strong>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div>© 2025 PaumIoT</div>
        <div className="text-muted">
          IoT Middleware Dashboard • Dark Lime theme
        </div>
      </footer>
    </MainLayout>
  );
}
