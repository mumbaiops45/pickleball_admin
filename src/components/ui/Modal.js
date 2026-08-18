"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/ui/Icons";

/**
 * Dialog built on `<dialog>`, so the browser owns the top layer, the backdrop
 * and the focus trap instead of this component reimplementing them.
 *
 * `showModal()` throws if the element is already open, hence the `open` check
 * on both sides. Escape fires the native `cancel` event, which is where the
 * close handler hangs.
 */
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

  const width = size === "lg" ? "max-w-2xl" : "max-w-md";

  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? "modal-title" : undefined}
      className={`w-[calc(100vw-2rem)] ${width} rounded-xl border border-line bg-paper p-0 text-ink shadow-[0_40px_90px_-30px_rgba(15,17,21,0.45)] backdrop:bg-ink/45 backdrop:backdrop-blur-[2px]`}
      // `<dialog>` is centred by the UA; the margin keeps it off the edges on
      // short viewports where it would otherwise touch the top.
      style={{ margin: "auto" }}
    >
      {open ? (
        <>
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="flex flex-col gap-1">
              <h2 id="modal-title" className="text-[15px] font-semibold">
                {title}
              </h2>
              {description ? (
                <p className="text-[13px] text-mist">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-mist hover:bg-surface hover:text-ink"
            >
              <CloseIcon className="size-4" />
            </button>
          </header>

          <div className="max-h-[70dvh] overflow-y-auto px-5 py-5">{children}</div>

          {footer ? (
            <footer className="flex justify-end gap-2 border-t border-line bg-surface px-5 py-4">
              {footer}
            </footer>
          ) : null}
        </>
      ) : null}
    </dialog>
  );
}
