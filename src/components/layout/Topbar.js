"use client";

import { usePathname } from "next/navigation";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { MenuIcon } from "@/components/ui/Icons";
import { findNavItem } from "@/lib/nav";

/**
 * Sticky header: the drawer trigger, the current screen's name (read from the
 * same nav config the sidebar renders) and the profile menu.
 */
export default function Topbar({ onOpenNav }) {
  const pathname = usePathname();
  const current = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-paper/85 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="grid size-10 shrink-0 place-items-center rounded-lg border border-line text-ink hover:bg-surface lg:hidden"
      >
        <MenuIcon className="size-5" />
      </button>

      {/* Not a heading — each screen renders its own <h1> through
          <PageHeader>, and two competing h1s make the outline unreadable. */}
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-ink">
          {current?.label ?? "Admin"}
        </p>
        {current?.description ? (
          <p className="hidden truncate text-[12.5px] leading-tight text-mist sm:block">
            {current.description}
          </p>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ProfileMenu />
      </div>
    </header>
  );
}
