"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="icon"
      >
        <path
          d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "/devices",
    label: "Devices",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="icon"
      >
        <path
          d="M12 2l3 6 6 .5-4.5 4 1 6L12 16l-5.5 3.5 1-6L3 8.5 9 8 12 2z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "/logs",
    label: "Logs",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="icon"
      >
        <path
          d="M12 2a10 10 0 100 20 10 10 0 000-20zM11 6h2v6h-2zM11 14h2v2h-2z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="icon"
      >
        <path
          d="M12 8.5A3.5 3.5 0 1112 15a3.5 3.5 0 010-6.5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      <div className="brand">
        <div className="logo">Io</div>
        <div>
          <h1>Middleware</h1>
          <p>IoT Control • Preview</p>
        </div>
      </div>

      <nav aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname === item.href ? "active" : ""}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="meta">
        <div className="chip">LIVE</div>
        <small>
          Server: middleware-01
          <br />
          Region: Dhaka
        </small>
      </div>
    </aside>
  );
}
