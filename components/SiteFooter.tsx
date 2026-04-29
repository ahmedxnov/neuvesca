import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      className="grid items-start gap-[clamp(2.5rem,4vw,4rem)] bg-[var(--ink)] px-[clamp(1.5rem,5vw,5.5rem)] py-[clamp(5rem,8vw,9rem)] text-[var(--cream)] md:grid-cols-[1fr_minmax(280px,480px)] max-sm:px-5"
      id="letter"
    >
      <div>
        <div className="[font-family:var(--serif)] text-[clamp(1.6rem,2.4vw,2.1rem)] font-normal italic leading-none tracking-[0.02em] text-[var(--cream)]">
          neuvesca
        </div>
        <p className="mt-4 max-w-[26rem] [font-family:var(--serif)] text-[1.15rem] italic text-[rgba(250,244,232,0.6)]">
          Quiet fragrance for considered spaces.
        </p>
        <div className="mt-7 flex flex-wrap gap-6">
          <Link
            className="border-b border-transparent pb-1 text-[0.7rem] font-normal uppercase tracking-[0.26em] text-[rgba(250,244,232,0.7)] transition-colors hover:border-[rgba(250,244,232,0.5)] hover:text-[var(--cream)]"
            href="/shop"
          >
            Shop
          </Link>
          <Link
            className="border-b border-transparent pb-1 text-[0.7rem] font-normal uppercase tracking-[0.26em] text-[rgba(250,244,232,0.7)] transition-colors hover:border-[rgba(250,244,232,0.5)] hover:text-[var(--cream)]"
            href="/about"
          >
            Studio
          </Link>
          <Link
            className="border-b border-transparent pb-1 text-[0.7rem] font-normal uppercase tracking-[0.26em] text-[rgba(250,244,232,0.7)] transition-colors hover:border-[rgba(250,244,232,0.5)] hover:text-[var(--cream)]"
            href="/contact"
          >
            Contact
          </Link>
        </div>
      </div>

      <form className="grid gap-3">
        <label
          className="[font-family:var(--serif)] text-[1.55rem] italic text-[var(--cream)]"
          htmlFor="email"
        >
          Join the scent letter
        </label>
        <p className="mb-2 max-w-[28rem] text-[0.88rem] leading-[1.65] text-[rgba(250,244,232,0.55)]">
          A short note four times a year &mdash; new pours, slow recipes, and
          the occasional rest day.
        </p>
        <div className="flex gap-3 max-sm:flex-col">
          <input
            className="min-h-[52px] flex-1 border-0 border-b border-[rgba(250,244,232,0.3)] bg-transparent px-1 text-[var(--cream)] outline-none placeholder:text-[rgba(250,244,232,0.4)] focus:border-[var(--cream)]"
            id="email"
            placeholder="Email address"
            type="email"
          />
          <button
            className="inline-flex min-h-[52px] cursor-pointer items-center justify-center border border-[var(--cream)] bg-transparent px-7 py-4 text-[0.72rem] font-normal uppercase tracking-[0.26em] text-[var(--cream)] transition-colors hover:bg-[var(--cream)] hover:text-[var(--ink)] max-sm:w-full"
            type="submit"
          >
            Subscribe
          </button>
        </div>
      </form>

      <div className="col-span-full mt-[clamp(1.5rem,3vw,2.5rem)] flex justify-between gap-6 border-t border-[rgba(250,244,232,0.15)] pt-[clamp(2.5rem,4vw,3.5rem)] text-[0.7rem] uppercase tracking-[0.26em] text-[rgba(250,244,232,0.5)] max-sm:flex-col max-sm:gap-3">
        <span>&copy; Neuvesca Studio</span>
        <span>Poured by hand &middot; Shipped slowly</span>
      </div>
    </footer>
  );
}
