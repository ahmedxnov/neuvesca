import type { Metadata } from "next";
import Link from "next/link";
import { login } from "./actions";

export const metadata: Metadata = {
  title: "Sign In | Neuvesca",
  description: "Sign in to your Neuvesca account.",
};

type LoginPageProps = {
  searchParams?: {
    error?: string;
    next?: string;
  };
};

function getNext(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/account";
  if (next.startsWith("/login") || next.startsWith("/signup")) return "/account";

  return next;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const next = getNext(searchParams?.next);

  return (
    <section className="authSection">
      <div className="authCard">
        <div className="authIntro">
          <p className="eyebrow">Account</p>
          <h1>Welcome back.</h1>
          <p className="lede">
            Sign in to keep your cart, orders, and slow rituals close.
          </p>
        </div>

        {searchParams?.error ? (
          <p className="authMessage authError">{searchParams.error}</p>
        ) : null}

        <form className="authForm" action={login}>
          <input type="hidden" name="next" value={next} />

          <label>
            <span>Email</span>
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Your password"
              required
            />
          </label>

          <button type="submit" className="button primary">
            Sign in
          </button>
        </form>

        <p className="authSwitch">
          New to Neuvesca? <Link href="/signup">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
