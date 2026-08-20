"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import {
  ChevronDownIcon,
  LogOutIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/ui/Icons";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useAuth } from "@/store/AuthProvider";


export default function ProfileMenu() {
  const { user, signOut } = useAuth();
  const wrapperRef = useRef(null);
  const pathname = usePathname();

 
  const [openedAt, setOpenedAt] = useState(null);
  const open = openedAt === pathname;

  const close = useCallback(() => setOpenedAt(null), []);
  useClickOutside(wrapperRef, close, open);

  if (!user) return null;

  const label = user.name?.trim() || user.email || user.phone || "Administrator";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpenedAt(open ? null : pathname)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`tap flex items-center gap-2.5 rounded-full border py-1 pl-1 pr-2.5 transition-colors ${
          open
            ? "border-line-strong bg-surface"
            : "border-line hover:border-line-strong hover:bg-surface"
        }`}
      >
        <Avatar user={user} size="sm" />
        <span className="hidden max-w-36 flex-col items-start sm:flex">
          <span className="w-full truncate text-[13px] font-medium leading-tight text-ink">
            {label}
          </span>
          <span className="text-[11px] leading-tight text-mist">
            {user.role === "ADMIN" ? "Administrator" : user.role}
          </span>
        </span>
        <ChevronDownIcon
          className={`size-4 text-mist transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-70 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-xl border border-line bg-paper shadow-[0_24px_60px_-18px_rgba(15,17,21,0.28)]"
        >
          <div className="flex items-start gap-3 border-b border-line bg-surface px-4 py-4">
            <Avatar user={user} size="lg" />
            <div className="flex min-w-0 flex-col gap-1">
              <p className="truncate text-sm font-semibold text-ink">{label}</p>
              {user.email ? (
                <p className="break-anywhere text-[12.5px] text-mist">
                  {user.email}
                </p>
              ) : null}
              {user.phone ? (
                <p className="truncate text-[12.5px] text-mist">{user.phone}</p>
              ) : null}
              <Badge tone="accent" className="mt-1 self-start">
                <ShieldIcon className="size-3" aria-hidden="true" />
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col p-1.5">
            <MenuLink href="/settings" icon={UserIcon} onSelect={close}>
              Profile &amp; session
            </MenuLink>
          </div>

          <div className="border-t border-line p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                signOut();
              }}
              className="tap flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium text-bad transition-colors hover:bg-bad-tint"
            >
              <LogOutIcon className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ href, icon: Icon, onSelect, children }) {
  const className =
    "tap flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] text-ink transition-colors hover:bg-surface";

  return (
    <Link href={href} role="menuitem" onClick={onSelect} className={className}>
      <Icon className="size-4 text-mist" aria-hidden="true" />
      {children}
    </Link>
  );
}
