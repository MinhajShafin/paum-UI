"use client";

import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { usePaumIoTContext } from "@/components/providers";
import { paumiotApi } from "@/lib/api";
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
    rlStats,
    status,
    loading,
    refetch,
  } = usePaumIoTContext();

  // State for Protocol Actions form
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [selectedProtocol, setSelectedProtocol] = useState("MQTT");
  const [payload, setPayload] = useState('{"temp": 26.4}');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isConnected = connectionState === "connected";
  const recentSensors = sensors.slice(0, 6);

  // Calculate load percentage (mock based on messages per second)
  const loadPercent = metrics ? Math.min(100, Math.round((metrics.messages_per_second / 100) * 100)) : 0;

  // Handle sending sensor data
  const handleSendData = async () => {
    if (!isConnected) return;
    
    const deviceId = selectedDeviceId || devices[0]?.id;
    if (!deviceId) {
      setSendStatus({ type: "error", message: "No device selected" });
      return;
    }

    setSending(true);
    setSendStatus(null);

    try {
      const parsedPayload = JSON.parse(payload);
      await paumiotApi.postSensorData({
        device_id: deviceId,
        ...parsedPayload,
      });
      setSendStatus({ type: "success", message: "Data sent successfully!" });
      // Refetch data to show updated readings
      await refetch();
    } catch (err) {
      setSendStatus({ 
        type: "error", 
        message: err instanceof Error ? err.message : "Failed to send data" 
      });
    } finally {
      setSending(false);
    }
  };

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
                <select 
                  aria-label="Choose device"
                  value={selectedDeviceId || devices[0]?.id || ""}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                >
                  {devices.length === 0 ? (
                    <option value="">No devices</option>
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
                <select 
                  aria-label="Choose protocol"
                  value={selectedProtocol}
                  onChange={(e) => setSelectedProtocol(e.target.value)}
                >
                  <option value="MQTT">MQTT</option>
                  <option value="CoAP">CoAP</option>
                  <option value="HTTP">HTTP</option>
                  <option value="PRIoTP-R">PRIoTP-R</option>
                  <option value="PRIoTP-U">PRIoTP-U</option>
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
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
              ></textarea>

              <div className="display-flex-col">
                <button 
                  className="btn" 
                  onClick={handleSendData}
                  disabled={!isConnected || sending}
                >
                  {sending ? "Sending..." : "Send Data"}
                </button>
                <button className="btn ghost" disabled={!isConnected}>Request Data</button>
                {sendStatus && (
                  <div className={`mt-4 text-sm ${sendStatus.type === "success" ? "text-lime" : "text-danger"}`}>
                    {sendStatus.message}
                  </div>
                )}
                <div className="mt-auto">
                  <div className="text-muted label-sm">Target:</div>
                  <div className="target-highlight">
                    /sensors/{selectedProtocol.toLowerCase()} → {selectedDeviceId || devices[0]?.id || "device"}
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
          <p className="sub">Middleware health & metrics{status?.version ? ` • v${status.version}` : ""}</p>
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
            <div className="justify-between mt-6">
              <small className="text-muted">PRIoTP-R</small>
              <strong className="text-muted">{protocolStats?.priotp_reliable || 0}</strong>
            </div>
            <div className="justify-between mt-6">
              <small className="text-muted">PRIoTP-U</small>
              <strong className="text-muted">{protocolStats?.priotp_unreliable || 0}</strong>
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

        {/* RL Stats */}
        <div className="card col-6">
          <h3>RL Protocol Selector</h3>
          <p className="sub">Reinforcement Learning statistics for adaptive protocol selection</p>
          <div className="status-grid mt-10">
            <div className="status">
              <div className="label">Best Protocol</div>
              <div className="value text-lime">{rlStats?.bandit_best_arm || "--"}</div>
              <div className="muted-small">Current best arm</div>
            </div>
            <div className="status">
              <div className="label">Accuracy</div>
              <div className="value text-cyan">
                {rlStats?.distillation_accuracy ? `${(rlStats.distillation_accuracy * 100).toFixed(0)}%` : "--"}
              </div>
              <div className="muted-small">Distillation</div>
            </div>
            <div className="status">
              <div className="label">Bandwidth Saved</div>
              <div className="value text-primary">
                {rlStats?.bandwidth_savings ? `${(rlStats.bandwidth_savings * 100).toFixed(0)}%` : "--"}
              </div>
              <div className="muted-small">Optimization</div>
            </div>
          </div>
          <div className="mt-14">
            <h3 className="h3-cyan">Decision Tree</h3>
            <div className="justify-between">
              <small className="text-muted">Tree Version</small>
              <strong>{rlStats?.tree_version || 0}</strong>
            </div>
            <div className="justify-between mt-6">
              <small className="text-muted">Tree Nodes</small>
              <strong>{rlStats?.tree_nodes || 0}</strong>
            </div>
            <div className="justify-between mt-6">
              <small className="text-muted">Tree Memory</small>
              <strong>{rlStats?.tree_memory || 0} bytes</strong>
            </div>
          </div>
        </div>

        {/* Bandit Stats */}
        <div className="card col-6">
          <h3>Experience Replay</h3>
          <p className="sub">Multi-armed bandit learning statistics</p>
          <div className="status-grid mt-10">
            <div className="status">
              <div className="label">Total Pulls</div>
              <div className="value">{rlStats?.bandit_pulls || 0}</div>
              <div className="muted-small">Arm selections</div>
            </div>
            <div className="status">
              <div className="label">Overrides</div>
              <div className="value text-cyan">{rlStats?.bandit_overrides || 0}</div>
              <div className="muted-small">Exploration choices</div>
            </div>
            <div className="status">
              <div className="label">Experiences</div>
              <div className="value">{rlStats?.total_experiences || 0}</div>
              <div className="muted-small">Total recorded</div>
            </div>
          </div>
          <div className="mt-14">
            <h3 className="h3-cyan">Learning Progress</h3>
            <div className="justify-between">
              <small className="text-muted">Significant Experiences</small>
              <strong className="text-lime">{rlStats?.significant_experiences || 0}</strong>
            </div>
            <div className="justify-between mt-6">
              <small className="text-muted">Learning Rate</small>
              <strong>
                {rlStats?.total_experiences 
                  ? `${((rlStats.significant_experiences / rlStats.total_experiences) * 100).toFixed(1)}%`
                  : "--"
                }
              </strong>
            </div>
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
