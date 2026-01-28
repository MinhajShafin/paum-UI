"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
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

interface PaumIoTContextValue {
  // Connection
  connectionState: ConnectionState;
  serverUrl: string;
  setServerUrl: (url: string) => void;
  connect: (url?: string) => Promise<boolean>;
  disconnect: () => void;
  connectionError: string | null;
  
  // Data
  status: SystemStatus | null;
  devices: Device[];
  sensors: SensorReading[];
  metrics: SystemMetrics | null;
  protocolStats: ProtocolStats | null;
  rlStats: RLStats | null;
  
  // Loading state
  loading: boolean;
  dataError: string | null;
  
  // Actions
  refetch: () => Promise<void>;
}

const PaumIoTContext = createContext<PaumIoTContextValue | null>(null);

export function usePaumIoTContext() {
  const context = useContext(PaumIoTContext);
  if (!context) {
    throw new Error("usePaumIoTContext must be used within PaumIoTProvider");
  }
  return context;
}

interface PaumIoTProviderProps {
  children: React.ReactNode;
  pollInterval?: number;
  autoConnect?: boolean;
  defaultServerUrl?: string;
}

export function PaumIoTProvider({
  children,
  pollInterval = 3000,
  autoConnect = true,
  defaultServerUrl = "localhost:8081",
}: PaumIoTProviderProps) {
  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [serverUrl, setServerUrl] = useState(defaultServerUrl);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Data state
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [protocolStats, setProtocolStats] = useState<ProtocolStats | null>(null);
  const [rlStats, setRLStats] = useState<RLStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (connectionState !== "connected") return;
    
    try {
      const result = await paumiotApi.getDashboardData();
      setStatus(result.status);
      setDevices(result.devices);
      setSensors(result.sensors);
      setMetrics(result.metrics);
      setProtocolStats(result.protocolStats);
      setRLStats(result.rlStats);
      setDataError(null);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Failed to fetch data");
    }
  }, [connectionState]);

  // Connect to server
  const connect = useCallback(async (url?: string): Promise<boolean> => {
    const targetUrl = url || serverUrl;
    setConnectionState("connecting");
    setConnectionError(null);
    setLoading(true);

    try {
      paumiotApi.setBaseUrl(`http://${targetUrl}`);
      const health = await paumiotApi.checkHealth();
      
      if (health.status === "ok") {
        setConnectionState("connected");
        setServerUrl(targetUrl);
        // Fetch initial data
        await fetchData();
        return true;
      } else {
        setConnectionState("error");
        setConnectionError(health.message || "Connection failed");
        return false;
      }
    } catch (err) {
      setConnectionState("error");
      setConnectionError(err instanceof Error ? err.message : "Connection failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [serverUrl, fetchData]);

  // Disconnect
  const disconnect = useCallback(() => {
    setConnectionState("disconnected");
    setStatus(null);
    setDevices([]);
    setSensors([]);
    setMetrics(null);
    setProtocolStats(null);
    setRLStats(null);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling effect
  useEffect(() => {
    if (connectionState !== "connected") return;
    
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [connectionState, pollInterval, fetchData]);

  const value: PaumIoTContextValue = {
    connectionState,
    serverUrl,
    setServerUrl,
    connect,
    disconnect,
    connectionError,
    status,
    devices,
    sensors,
    metrics,
    protocolStats,
    rlStats,
    loading,
    dataError,
    refetch: fetchData,
  };

  return (
    <PaumIoTContext.Provider value={value}>
      {children}
    </PaumIoTContext.Provider>
  );
}
