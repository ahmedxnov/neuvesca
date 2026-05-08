"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchExact?: boolean;
};

function Icon({ d }: { d: string }) {
  return (
    <svg
      aria-hidden
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d={d} />
    </svg>
  );
}

const ITEMS: Item[] = [
  {
    href: "/admin",
    label: "Overview",
    matchExact: true,
    icon: <Icon d="M3 12 12 4l9 8M5 10v10h14V10" />,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: <Icon d="M3 7l9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10" />,
  },
  {
    href: "/admin/scents",
    label: "Scents",
    icon: <Icon d="M12 3c2 4 5 5 5 9a5 5 0 1 1-10 0c0-4 3-5 5-9Z" />,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: <Icon d="M4 7h16l-1.5 11a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 7Zm4 0V5a4 4 0 1 1 8 0v2" />,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: <Icon d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0" />,
  },
  {
    href: "/admin/promo-codes",
    label: "Promo codes",
    icon: <Icon d="m4 12 8-8h8v8l-8 8-8-8Zm12-4h.01" />,
  },
];

export default function AdminNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Admin navigation" className="adminNav">
      {ITEMS.map((item) => {
        const active = item.matchExact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`adminNavLink${active ? " adminNavLinkActive" : ""}`}
            href={item.href}
            key={item.href}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
