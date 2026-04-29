"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Studio" },
];

const rightLinks = [
  { href: "/#ritual", label: "Ritual" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <div className="announcement">
        Spring pours now resting in the Neuvesca studio
      </div>
      <nav className="nav" aria-label="Main navigation">
        <div className="navLinks navLeft">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link href="/" className="brand" aria-label="Neuvesca home">
          neuvesca
        </Link>
        <div className="navLinks navRight">
          {rightLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
