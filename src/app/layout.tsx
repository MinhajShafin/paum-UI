import type { Metadata } from "next";
import "./globals.css";
import { PaumIoTProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "PaumIoT Dashboard — IoT Middleware",
  description: "IoT device management and protocol middleware interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PaumIoTProvider pollInterval={3000} autoConnect={true}>
          {children}
        </PaumIoTProvider>
      </body>
    </html>
  );
}
