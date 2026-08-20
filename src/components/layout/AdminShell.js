"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { LogoMark } from "@/components/ui/Logo";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useAuth } from "@/store/AuthProvider";

export default function AdminShell({ children }) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace("/login");
  }, [hydrated, isAuthenticated, router]);

 
  const drawerOpen = navOpen && !isDesktop;

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

      <Sidebar
        open={drawerOpen}
        inert={!isDesktop && !drawerOpen}
        onClose={() => setNavOpen(false)}
      />

      <div className="flex min-h-dvh flex-col lg:pl-66">
        <Topbar onOpenNav={() => setNavOpen(true)} />

        <main
          key={pathname}
          className="pad-safe-x mx-auto w-full max-w-7xl flex-1 py-6 [--pad-x:1rem] md:py-7 md:[--pad-x:1.5rem] lg:py-9"
        >
          {children}
        </main>

        <footer className="pad-safe-x pad-safe-b border-t border-line py-4 text-[12px] text-mist [--pad-b:1rem] [--pad-x:1rem] md:[--pad-x:1.5rem]">
          PADDLEHAUS admin · connected to the Pickleball Ecommerce API
        </footer>
      </div>
    </div>
  );
}

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
