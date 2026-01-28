/**
 * PaumIoT API Client
 * REST API client for communicating with the PAUMIoT middleware server
 */

import type {
  Device,
  DevicesResponse,
  SensorReading,
  SensorsResponse,
  SystemStatus,
  SystemMetrics,
  ProtocolStats,
  RLStats,
  HealthResponse,
  SensorDataPayload,
} from "./types";

// Default API base URL - can be configured via environment variable
const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_PAUMIOT_API_URL || "http://localhost:8081";

class PaumIoTApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set the API base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get the current API base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Health check - verify API connectivity
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      await this.fetch("/health");
      return { status: "ok" };
    } catch {
      return { status: "error", message: "Unable to connect to server" };
    }
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<SystemStatus> {
    return this.fetch<SystemStatus>("/api/v1/status");
  }

  /**
   * Get all devices
   */
  async getDevices(): Promise<Device[]> {
    const response = await this.fetch<DevicesResponse>("/api/v1/devices");
    return response.devices || [];
  }

  /**
   * Get sensor readings
   */
  async getSensors(): Promise<SensorReading[]> {
    const response = await this.fetch<SensorsResponse>("/api/v1/sensors");
    return response.readings || [];
  }

  /**
   * Get system metrics
   */
  async getMetrics(): Promise<SystemMetrics> {
    return this.fetch<SystemMetrics>("/api/v1/metrics");
  }

  /**
   * Get protocol statistics
   */
  async getProtocolStats(): Promise<ProtocolStats> {
    return this.fetch<ProtocolStats>("/api/v1/protocols/stats");
  }

  /**
   * Get RL (Reinforcement Learning) statistics
   */
  async getRLStats(): Promise<RLStats> {
    return this.fetch<RLStats>("/api/v1/rl/stats");
  }

  /**
   * Send sensor data to the server
   */
  async postSensorData(data: SensorDataPayload): Promise<void> {
    await this.fetch("/api/sensor/data", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Fetch all dashboard data in a single call
   */
  async getDashboardData(): Promise<{
    status: SystemStatus | null;
    devices: Device[];
    sensors: SensorReading[];
    metrics: SystemMetrics | null;
    protocolStats: ProtocolStats | null;
    rlStats: RLStats | null;
  }> {
    const results = await Promise.allSettled([
      this.getStatus(),
      this.getDevices(),
      this.getSensors(),
      this.getMetrics(),
      this.getProtocolStats(),
      this.getRLStats(),
    ]);

    return {
      status: results[0].status === "fulfilled" ? results[0].value : null,
      devices: results[1].status === "fulfilled" ? results[1].value : [],
      sensors: results[2].status === "fulfilled" ? results[2].value : [],
      metrics: results[3].status === "fulfilled" ? results[3].value : null,
      protocolStats: results[4].status === "fulfilled" ? results[4].value : null,
      rlStats: results[5].status === "fulfilled" ? results[5].value : null,
    };
  }
}

// Export a singleton instance
export const paumiotApi = new PaumIoTApiClient();

// Also export the class for custom instances
export { PaumIoTApiClient };
