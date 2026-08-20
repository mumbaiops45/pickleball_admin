"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { CloseIcon } from "@/components/ui/Icons";
import { NAV_SECTIONS } from "@/lib/nav";


export default function Sidebar({ open, inert = false, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink/45 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

   
      <aside
        inert={inert || undefined}
        className={`dark-chrome inset-safe-l fixed inset-y-0 left-0 z-40 flex w-66 max-w-[85vw] flex-col bg-shell transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-5">
          <Logo dark tone="volt" size="sm" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="tap -mr-2 grid size-9 place-items-center rounded-lg text-faint hover:bg-shell-2 hover:text-paper lg:hidden"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <nav
          aria-label="Admin sections"
          className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
        >
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-faint">
                {section.label}
              </p>

              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`tap group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-shell-2 font-medium text-paper"
                        : "text-faint hover:bg-shell-2/60 hover:text-paper"
                    }`}
                  >
                   
                    <span
                      aria-hidden="true"
                      className={`h-5 w-0.5 rounded-full transition-colors ${
                        active ? "bg-volt" : "bg-transparent"
                      }`}
                    />
                    <item.icon
                      className={`size-[18px] shrink-0 ${
                        active ? "text-volt" : "text-faint group-hover:text-paper"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>

                    {item.pending ? (
                      <span
                        title="Waiting on an API endpoint"
                        className="ml-auto rounded bg-shell-line px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-faint"
                      >
                        Soon
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
