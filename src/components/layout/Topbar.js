"use client";

import { usePathname } from "next/navigation";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { MenuIcon } from "@/components/ui/Icons";
import { findNavItem } from "@/lib/nav";


export default function Topbar({ onOpenNav }) {
  const pathname = usePathname();
  const current = findNavItem(pathname);

  return (
    <header className="pad-safe-x sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-paper/85 backdrop-blur-md [--pad-x:1rem] md:[--pad-x:1.5rem]">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="tap grid size-10 shrink-0 place-items-center rounded-lg border border-line text-ink hover:bg-surface lg:hidden"
      >
        <MenuIcon className="size-5" />
      </button>

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
