import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer" id="letter">
      <div className="footerIntro">
        <div className="brand">neuvesca</div>
        <p>Quiet fragrance for considered spaces.</p>
        <div className="footerNav">
          <Link href="/shop">Shop</Link>
          <Link href="/about">Studio</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <form className="footerForm">
        <label htmlFor="email">Join the scent letter</label>
        <p className="footerNote">
          A short note four times a year — new pours, slow recipes, and the
          occasional rest day.
        </p>
        <div>
          <input id="email" type="email" placeholder="Email address" />
          <button type="submit">Subscribe</button>
        </div>
      </form>
      <div className="footerBase">
        <span>© Neuvesca Studio</span>
        <span>Poured by hand · Shipped slowly</span>
      </div>
    </footer>
  );
}
