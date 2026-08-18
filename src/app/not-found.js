import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <LogoMark size="lg" tone="ink" />
        <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.22em] text-volt-deep">
          404
        </p>
        <h1 className="mt-3 text-[1.8rem] font-semibold leading-tight tracking-[-0.03em]">
          No such screen
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          That route is not part of the admin panel.
        </p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex h-11 items-center rounded-lg bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-shell-2"
        >
          Back to the dashboard
        </Link>
      </div>
    </main>
  );
}
