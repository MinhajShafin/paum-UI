"use client";

import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { usePaumIoTContext } from "@/components/providers";
import type { Device, SensorReading } from "@/lib/api";

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = Math.floor((now - ts) / 1000);
  
  if (diff < 0) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function DeviceListItem({ 
  device, 
  isSelected, 
  onClick 
}: { 
  device: Device; 
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div className={`device ${isSelected ? "selected" : ""}`} onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="meta">
        <div className={`dot ${device.online ? "online" : "offline"}`} aria-hidden></div>
        <div>
          <strong>{device.name || device.id}</strong>
          <small>
            {device.protocol.toLowerCase()}://{device.location || device.id} ·{" "}
            {device.online ? `last ${formatRelativeTime(device.last_seen)}` : "offline"}
          </small>
        </div>
      </div>
      <div className="text-right">
        <small className="text-muted">{device.type}</small>
        <div className="mt-8">
          <button className="btn ghost">Inspect</button>
        </div>
      </div>
    </div>
  );
}

export default function Devices() {
  const { connectionState, devices, sensors, loading } = usePaumIoTContext();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const isConnected = connectionState === "connected";
  
  // Filter devices
  const filteredDevices = devices.filter(d => 
    filter === "" || 
    d.id.toLowerCase().includes(filter.toLowerCase()) ||
    d.name.toLowerCase().includes(filter.toLowerCase()) ||
    d.protocol.toLowerCase().includes(filter.toLowerCase())
  );
  
  // Get selected device
  const selectedDevice = selectedDeviceId 
    ? devices.find(d => d.id === selectedDeviceId) 
    : devices[0];
  
  // Get device sensors
  const deviceSensors = selectedDevice 
    ? sensors.filter(s => s.device_id === selectedDevice.id).slice(0, 5)
    : [];

  return (
    <MainLayout
      title="Devices"
      subtitle="Overview of connected devices and quick controls"
    >
      <section className="row">
        <div className="card col-8">
          <h3>Device Registry</h3>
          <p className="sub">Registered devices and connection status</p>

          <div className="mt-12 inline-center">
            <input
              placeholder="Filter by name, protocol, id..."
              className="flex-1"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <button className="btn">Add Device</button>
            <button className="btn ghost">Import</button>
          </div>

          <div className="device-list mt-14">
            {!isConnected ? (
              <div className="text-muted text-center py-4">
                Connect to server to view devices
              </div>
            ) : loading && devices.length === 0 ? (
              <div className="text-muted text-center py-4">Loading devices...</div>
            ) : filteredDevices.length === 0 ? (
              <div className="text-muted text-center py-4">
                {filter ? "No devices match filter" : "No devices registered"}
              </div>
            ) : (
              filteredDevices.map((device) => (
                <DeviceListItem
                  key={device.id}
                  device={device}
                  isSelected={selectedDevice?.id === device.id}
                  onClick={() => setSelectedDeviceId(device.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="card col-4">
          <h3>Device Details</h3>
          <p className="sub">Select a device to view details and actions</p>

          {selectedDevice ? (
            <div className="mt-12 display-flex-col">
              <div className="text-muted">Selected</div>
              <div className="text-cyan fw-800">{selectedDevice.name || selectedDevice.id}</div>

              <div className="mt-8">
                <div className="justify-between">
                  <small className="text-muted">Protocol</small>
                  <strong>{selectedDevice.protocol}</strong>
                </div>
                <div className="justify-between mt-6">
                  <small className="text-muted">Status</small>
                  <strong className={selectedDevice.online ? "text-lime" : "text-danger"}>
                    {selectedDevice.online ? "Online" : "Offline"}
                  </strong>
                </div>
                <div className="justify-between mt-6">
                  <small className="text-muted">Last seen</small>
                  <strong className="text-lime">
                    {formatRelativeTime(selectedDevice.last_seen)}
                  </strong>
                </div>
                {selectedDevice.battery > 0 && (
                  <div className="justify-between mt-6">
                    <small className="text-muted">Battery</small>
                    <strong>{selectedDevice.battery}%</strong>
                  </div>
                )}
                {selectedDevice.rssi !== 0 && (
                  <div className="justify-between mt-6">
                    <small className="text-muted">Signal (RSSI)</small>
                    <strong>{selectedDevice.rssi} dBm</strong>
                  </div>
                )}
              </div>

              <div className="mt-12">
                <button className="btn">Send Test Payload</button>
                <button className="btn ghost mt-8">Restart Device</button>
              </div>

              <div className="mt-18">
                <h3 className="h3-cyan">Meta</h3>
                <div className="text-muted label-sm">ID: {selectedDevice.id}</div>
                <div className="text-muted label-sm mt-6">
                  Type: {selectedDevice.type}
                </div>
                {selectedDevice.location && (
                  <div className="text-muted label-sm mt-6">
                    Location: {selectedDevice.location}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-12 text-muted text-center">
              {isConnected ? "Select a device to view details" : "Connect to server first"}
            </div>
          )}
        </div>

        <div className="card col-12">
          <h3>Recent Activity</h3>
          <p className="sub">Device-specific events and messages</p>
          <div className="logs mt-10">
            {!isConnected ? (
              <div className="text-muted text-center py-4">Connect to server to view activity</div>
            ) : deviceSensors.length === 0 ? (
              <div className="text-muted text-center py-4">
                {selectedDevice ? "No recent activity for this device" : "Select a device to view activity"}
              </div>
            ) : (
              deviceSensors.map((reading, idx) => {
                const time = new Date(reading.timestamp > 1e12 ? reading.timestamp : reading.timestamp * 1000);
                const timeStr = time.toLocaleTimeString("en-US", { hour12: false });
                return (
                  <div key={`${reading.device_id}-${reading.timestamp}-${idx}`} className="log-line">
                    <span className="log-time">[{timeStr}]</span> {reading.device_id} →{" "}
                    {reading.protocol} → /sensors/{reading.sensor_type} :{" "}
                    {`{"${reading.sensor_type}":${reading.value.toFixed(1)}}`}
                  </div>
                );
              })
            )}
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
