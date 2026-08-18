"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { LogoMark } from "@/components/ui/Logo";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useAuth } from "@/store/AuthProvider";

/**
 * Chrome + guard for every signed-in screen.
 *
 * The token lives in localStorage, so there is no session on the server and
 * nothing useful to prerender: the shell waits for `hydrated` before deciding
 * anything. Redirecting before that would bounce a signed-in admin to /login
 * on every hard refresh.
 *
 * This is a UX gate. It hides screens, it does not protect data — the API has
 * to reject non-admin tokens itself (see API-REVIEW.md).
 */
export default function AdminShell({ children }) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace("/login");
  }, [hydrated, isAuthenticated, router]);

  // The drawer is a mobile affordance. Deriving it rather than clearing the
  // flag on resize means widening the window can never leave a stale scrim
  // behind, and narrowing it again starts closed.
  const drawerOpen = navOpen && !isDesktop;

  // Body scroll would otherwise continue under the open drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  if (!hydrated || !isAuthenticated) return <ShellSplash />;

  return (
    <div className="min-h-dvh">
      <Sidebar open={drawerOpen} onClose={() => setNavOpen(false)} />

      <div className="flex min-h-dvh flex-col lg:pl-66">
        <Topbar onOpenNav={() => setNavOpen(true)} />

        {/* `key` restarts the enter animation on each navigation. */}
        <main
          key={pathname}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 md:px-6 lg:py-9"
        >
          {children}
        </main>

        <footer className="border-t border-line px-4 py-4 text-[12px] text-mist md:px-6">
          PADDLEHAUS admin · connected to the Pickleball Ecommerce API
        </footer>
      </div>
    </div>
  );
}

/** Shown while the session is being read, and during the redirect to /login. */
function ShellSplash() {
  return (
    <div
      className="grid min-h-dvh place-items-center bg-surface"
      role="status"
      aria-label="Loading the admin panel"
    >
      <LogoMark size="lg" tone="ink" className="animate-pulse" />
    </div>
  );
}
