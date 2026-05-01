"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart/CartProvider";

const leftLinks = [
  { href: "/products", label: "Shop" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/about", label: "Studio" },
];

const rightLinks = [
  { href: "/#ritual", label: "Ritual" },
  { href: "/contact", label: "Contact" },
];

type SiteHeaderNavProps = {
  initialCount: number;
  isAuthenticated: boolean;
};

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M6.5 8.5h11l1 11h-13l1-11Z" />
      <path d="M9 8.5a3 3 0 0 1 6 0" />
    </svg>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isHashLink = href.startsWith("/#");
  const isActive =
    !isHashLink && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={[
        "relative py-1 text-[0.72rem] font-normal uppercase tracking-[0.24em] text-[var(--ink-soft)] transition-colors",
        "after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[var(--ink)] after:transition-transform after:duration-300",
        "hover:text-[var(--ink)] hover:after:scale-x-100",
        isActive ? "text-[var(--ink)] after:scale-x-100" : "",
      ].join(" ")}
      href={href}
    >
      {label}
    </Link>
  );
}

export default function SiteHeaderNav({
  initialCount,
  isAuthenticated,
}: SiteHeaderNavProps) {
  const { count, isLoading } = useCart();
  // Use server-supplied count until client cart hydrates to avoid flicker.
  const displayCount = isLoading ? initialCount : count;
  const accountHref = isAuthenticated ? "/account" : "/login";
  const accountLabel = isAuthenticated ? "Account" : "Login";

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line-soft)] bg-[var(--paper)]">
      <div className="bg-[var(--ink)] px-4 py-3 text-center text-[0.7rem] font-normal uppercase tracking-[0.28em] text-[var(--cream)] max-sm:text-[0.62rem] max-sm:tracking-[0.22em]">
        Spring pours now resting in the Neuvesca studio
      </div>
      <nav
        aria-label="Main navigation"
        className="mx-auto grid min-h-[88px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-[clamp(1.5rem,5vw,4rem)] max-lg:min-h-0 max-lg:grid-cols-1 max-lg:py-5 max-sm:px-5"
      >
        <div className="flex flex-wrap justify-start gap-[clamp(1.4rem,3vw,3rem)] max-lg:order-2 max-lg:justify-center">
          {leftLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>

        <Link
          aria-label="Neuvesca home"
          className="text-center [font-family:var(--serif)] text-[clamp(1.6rem,2.4vw,2.1rem)] font-normal italic leading-none tracking-[0.02em] text-[var(--ink)] transition-colors hover:text-[var(--clay)] max-lg:order-1"
          href="/"
        >
          neuvesca
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-[clamp(1.1rem,2.4vw,2.4rem)] max-lg:order-3 max-lg:justify-center">
          {rightLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}

          <Link
            aria-label={`Cart with ${displayCount} ${
              displayCount === 1 ? "item" : "items"
            }`}
            className="inline-flex items-center gap-2 py-1 text-[0.72rem] font-normal uppercase tracking-[0.2em] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
            href="/cart"
          >
            <CartIcon />
            <span className="grid h-6 min-w-6 place-items-center rounded-full border border-[var(--line)] px-1 text-[0.65rem] tracking-normal">
              {displayCount}
            </span>
          </Link>

          <NavLink href={accountHref} label={accountLabel} />
        </div>
      </nav>
    </header>
  );
}
