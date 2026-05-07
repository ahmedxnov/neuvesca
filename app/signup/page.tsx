import type { Metadata } from "next";
import Link from "next/link";
import { signUp } from "./actions";

export const metadata: Metadata = {
  title: "Create Account | Neuvesca",
  description: "Create a Neuvesca account.",
};

type SignupPageProps = {
  searchParams?: {
    error?: string;
    message?: string;
  };
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  return (
    <section className="authSplit">
      <aside className="authVisual">
        <div className="authVisualCopy">
          <p className="eyebrow">Pour & Practice</p>
          <h2>A small studio for slow evenings.</h2>
          <p>
            Body serum candles, hand-poured in small batches and shipped in
            reusable glass.
          </p>
        </div>
      </aside>

      <div className="authPane">
        <div className="authCard">
          <div className="authIntro">
            <p className="eyebrow">Join Neuvesca</p>
            <h1>Create your account.</h1>
            <p className="lede">
              Keep your candle cabinet, checkout, and order notes in one quiet
              place.
            </p>
          </div>

          {searchParams?.error ? (
            <p className="authMessage authError">{searchParams.error}</p>
          ) : null}
          {searchParams?.message ? (
            <p className="authMessage">{searchParams.message}</p>
          ) : null}

          <form className="authForm" action={signUp}>
            <label>
              <span>Full name</span>
              <input type="text" name="fullName" placeholder="Your name" />
            </label>

            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </label>

            <button type="submit" className="button primary full">
              Create account
            </button>
          </form>

          <p className="authSwitch">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
