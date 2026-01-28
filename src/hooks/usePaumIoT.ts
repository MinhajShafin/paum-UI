"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { paumiotApi } from "@/lib/api";
import type {
  Device,
  SensorReading,
  SystemStatus,
  SystemMetrics,
  ProtocolStats,
  RLStats,
} from "@/lib/api";

// Connection state type
type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

/**
 * Hook to manage PaumIoT connection state
 */
export function usePaumIoTConnection() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [serverUrl, setServerUrl] = useState("localhost:8081");
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (url?: string) => {
    const targetUrl = url || serverUrl;
    setConnectionState("connecting");
    setError(null);

    try {
      paumiotApi.setBaseUrl(`http://${targetUrl}`);
      const health = await paumiotApi.checkHealth();
      
      if (health.status === "ok") {
        setConnectionState("connected");
        setServerUrl(targetUrl);
        return true;
      } else {
        setConnectionState("error");
        setError(health.message || "Connection failed");
        return false;
      }
    } catch (err) {
      setConnectionState("error");
      setError(err instanceof Error ? err.message : "Connection failed");
      return false;
    }
  }, [serverUrl]);

  const disconnect = useCallback(() => {
    setConnectionState("disconnected");
  }, []);

  return {
    connectionState,
    serverUrl,
    setServerUrl,
    error,
    connect,
    disconnect,
    isConnected: connectionState === "connected",
  };
}

/**
 * Hook to fetch and poll dashboard data
 */
export function useDashboardData(pollInterval: number = 3000) {
  const [data, setData] = useState<{
    status: SystemStatus | null;
    devices: Device[];
    sensors: SensorReading[];
    metrics: SystemMetrics | null;
    protocolStats: ProtocolStats | null;
    rlStats: RLStats | null;
  }>({
    status: null,
    devices: [],
    sensors: [],
    metrics: null,
    protocolStats: null,
    rlStats: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await paumiotApi.getDashboardData();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    // Fetch immediately
    fetchData();
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start polling
    intervalRef.current = setInterval(fetchData, pollInterval);
  }, [fetchData, pollInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...data,
    loading,
    error,
    refetch: fetchData,
    startPolling,
    stopPolling,
  };
}

/**
 * Hook to fetch devices
 */
export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const result = await paumiotApi.getDevices();
      setDevices(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return { devices, loading, error, refetch: fetchDevices };
}

/**
 * Hook to fetch sensor readings
 */
export function useSensors() {
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensors = useCallback(async () => {
    try {
      setLoading(true);
      const result = await paumiotApi.getSensors();
      setSensors(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sensors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

  return { sensors, loading, error, refetch: fetchSensors };
}

/**
 * Hook to fetch system metrics
 */
export function useMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const result = await paumiotApi.getMetrics();
      setMetrics(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
}

/**
 * Format uptime seconds to human readable string
 */
export function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  // Handle both seconds and milliseconds timestamps
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = Math.floor((now - ts) / 1000);
  
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
