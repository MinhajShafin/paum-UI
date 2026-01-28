/**
 * PaumIoT API Types
 * Based on the REST API from PAUMIoT middleware
 */

// Device information
export interface Device {
  id: string;
  name: string;
  type: string;
  protocol: string;
  location: string;
  online: boolean;
  battery: number;
  rssi: number;
  last_seen: number;
}

export interface DevicesResponse {
  devices: Device[];
}

// Sensor reading
export interface SensorReading {
  device_id: string;
  sensor_type: string;
  value: number;
  unit: string;
  protocol: string;
  timestamp: number;
}

export interface SensorsResponse {
  readings: SensorReading[];
}

// System status
export interface SystemStatus {
  status: string;
  version: string;
  uptime: number;
  devices: number;
  sensors: number;
}

// System metrics
export interface SystemMetrics {
  messages_total: number;
  messages_per_second: number;
  avg_latency_ms: number;
  active_devices: number;
  active_connections: number;
  uptime_seconds: number;
}

// Protocol statistics
export interface ProtocolStats {
  mqtt: number;
  coap: number;
  http: number;
  priotp_reliable: number;
  priotp_unreliable: number;
}

// RL (Reinforcement Learning) statistics
export interface RLStats {
  tree_version: number;
  tree_nodes: number;
  distillation_accuracy: number;
  tree_memory: number;
  bandit_pulls: number;
  bandit_overrides: number;
  bandit_best_arm: string;
  total_experiences: number;
  significant_experiences: number;
  bandwidth_savings: number;
}

// Health check response
export interface HealthResponse {
  status: "ok" | "error";
  message?: string;
}

// Sensor data POST payload
export interface SensorDataPayload {
  device_id: string;
  temperature?: number;
  humidity?: number;
  value?: number;
  sensor_type?: string;
  unit?: string;
}
