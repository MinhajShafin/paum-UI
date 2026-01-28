"use client";

import Sidebar from "./Sidebar";
import { ConnectionStatus } from "./ConnectionStatus";
import { usePaumIoTContext } from "./providers";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function MainLayout({
  children,
  title,
  subtitle,
}: MainLayoutProps) {
  const { metrics, connectionState } = usePaumIoTContext();
  
  const uptimeDisplay = metrics?.uptime_seconds 
    ? formatUptime(metrics.uptime_seconds) 
    : connectionState === "connected" ? "..." : "--";

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div className="page-title">
            <h2>{title}</h2>
            {subtitle && <p className="sub">{subtitle}</p>}
          </div>
          <div className="controls">
            <ConnectionStatus />
            <div className="chip">
              Uptime: <strong className="ml-8 text-primary">{uptimeDisplay}</strong>
            </div>
          </div>
        </div>
        {children}
      </main>
    </>
  );
}
