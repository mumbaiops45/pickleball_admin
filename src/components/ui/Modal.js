"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/ui/Icons";


export default function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const onCancel = (event) => {
      event.preventDefault(); // let React own the state, not the DOM
      onClose();
    };

    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  const width = size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md";

  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? "modal-title" : undefined}
  
      className={`m-auto max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden border border-line bg-paper p-0 text-ink shadow-[0_40px_90px_-30px_rgba(15,17,21,0.45)] backdrop:bg-ink/45 backdrop:backdrop-blur-[2px] open:flex max-sm:mx-0 max-sm:mb-0 max-sm:max-h-[92dvh] max-sm:w-screen max-sm:rounded-t-2xl sm:w-[calc(100vw-2rem)] sm:rounded-xl ${width}`}
    >
      {open ? (
        <>
          {/* Reads as a sheet that came up from the bottom edge. */}
          <span
            aria-hidden="true"
            className="mx-auto mt-2 block h-1 w-9 shrink-0 rounded-full bg-line-strong/50 sm:hidden"
          />

          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-4 py-4 sm:px-5">
            <div className="flex min-w-0 flex-col gap-1">
              <h2
                id="modal-title"
                className="break-anywhere text-[15px] font-semibold"
              >
                {title}
              </h2>
              {description ? (
                <p className="text-[13px] leading-snug text-mist">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="tap -mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-mist hover:bg-surface hover:text-ink"
            >
              <CloseIcon className="size-4" />
            </button>
          </header>

          
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
            {children}
          </div>

          {footer ? (
            <footer className="pad-safe-b flex shrink-0 gap-2 border-t border-line bg-surface px-4 py-4 [--pad-b:1rem] sm:justify-end sm:px-5 [&>*]:flex-1 sm:[&>*]:flex-none">
              {footer}
            </footer>
          ) : null}
        </>
      ) : null}
    </dialog>
  );
}
