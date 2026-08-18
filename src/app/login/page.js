"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CourtScene from "@/components/auth/CourtScene";
import LoginForm from "@/components/auth/LoginForm";
import Logo, { LogoMark } from "@/components/ui/Logo";
import { useAuth } from "@/store/AuthProvider";

/**
 * Split login: animated court on the left, form on the right.
 *
 * Someone already signed in who lands here is sent on to the dashboard rather
 * than shown a form they don't need — but only once `hydrated`, since the
 * session is read from localStorage after the first paint.
 */
export default function LoginPage() {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace("/dashboard");
  }, [hydrated, isAuthenticated, router]);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <main className="relative flex items-center justify-center overflow-hidden bg-paper px-5 py-12 sm:px-10">
        {/* A ball drifting behind the column, echoing the court next door. */}
        <BallWatermark />

        <div className="relative w-full max-w-sm">
          <div className="pb-rise lg:hidden">
            <Logo href={null} size="md" />
          </div>

          <div className="pb-rise" style={{ "--d": "60ms" }}>
            <h1 className="mt-8 text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.035em] lg:mt-0">
              Sign in
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              Manage the catalogue, categories and orders behind the PADDLEHAUS
              storefront.
            </p>
          </div>

          <div className="pb-rise mt-8" style={{ "--d": "140ms" }}>
            <LoginForm />
          </div>

        </div>
      </main>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="dark-chrome relative hidden overflow-hidden bg-shell pt-12 pl-12 pr-12 lg:flex lg:flex-col">
      {/* Two soft discs instead of a background image — nothing to load, and
          the panel keeps its shape at any viewport height. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-104 rounded-full bg-volt/12 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 size-88 rounded-full bg-volt/8 blur-[110px]"
      />

      <Logo href={null} dark size="md" className="pb-rise relative" />

      <div className="pb-rise relative mt-12 max-w-md" style={{ "--d": "120ms" }}>
        {/* <LogoMark size="lg" tone="volt" /> */}
        <p className="mt-8 text-[2.1rem] font-semibold leading-[1.12] tracking-[-0.035em] text-paper">
          The control room for{" "}
          <span className="text-volt">every paddle, ball and order</span>.
        </p>
        <p className="mt-5 text-[14px] leading-relaxed text-faint">
          Publish products, keep categories tidy and watch stock before it runs
          out — all against the same API the storefront reads from.
        </p>
      </div>

      {/* The rally gets a band of its own below the copy — bled out to the
          panel edges — so the paddles never swing across the headline. */}
      <div className="relative -mx-12 mt-10 min-h-[300px] flex-1">
        <CourtScene />
      </div>
    </aside>
  );
}

/**
 * Ball drawn as line art behind the form. Filled holes on a filled disc just
 * read as a blob at this opacity, so it is an outline with solid holes —
 * the shape survives being nearly invisible.
 */
function BallWatermark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      className="pb-drift pointer-events-none absolute -right-10 -top-10 size-52 text-volt-deep opacity-[0.16] sm:size-72"
    >
      <circle
        cx="20"
        cy="20"
        r="18.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      {[
        [20, 7],
        [31, 13.5],
        [31, 26.5],
        [20, 33],
        [9, 26.5],
        [9, 13.5],
        [20, 20],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.4" fill="currentColor" />
      ))}
    </svg>
  );
}
