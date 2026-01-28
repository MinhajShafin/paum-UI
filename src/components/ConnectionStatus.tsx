"use client";

import { useState } from "react";
import { usePaumIoTContext } from "@/components/providers";

export function ConnectionStatus() {
  const {
    connectionState,
    serverUrl,
    setServerUrl,
    connect,
    connectionError,
  } = usePaumIoTContext();
  
  const [inputUrl, setInputUrl] = useState(serverUrl);

  const handleConnect = async () => {
    await connect(inputUrl);
  };

  const getStatusDot = () => {
    switch (connectionState) {
      case "connected":
        return <span className="dot online" />;
      case "connecting":
        return <span className="dot connecting" />;
      case "error":
        return <span className="dot offline" />;
      default:
        return <span className="dot offline" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return connectionError || "Error";
      default:
        return "Disconnected";
    }
  };

  return (
    <div className="connection-status">
      <div className="status-indicator">
        {getStatusDot()}
        <span className="status-text">{getStatusText()}</span>
      </div>
      <div className="connection-controls">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="host:port"
          className="server-input"
        />
        <button
          onClick={handleConnect}
          disabled={connectionState === "connecting"}
          className="btn"
        >
          {connectionState === "connecting" ? "..." : "Connect"}
        </button>
      </div>
    </div>
  );
}
