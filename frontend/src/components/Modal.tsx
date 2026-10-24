import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Tailwind max-width class for the panel. */
  size?: 'max-w-md' | 'max-w-2xl';
}

/**
 * Accessible modal dialog: labelled by its title, closes on Escape or a
 * backdrop click, moves focus into the panel and restores it on close.
 */
export function Modal({ title, onClose, children, size = 'max-w-md' }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Captured during the first render, before any child autoFocus runs, so focus returns to the trigger.
  const [returnFocusTo] = useState(() => document.activeElement as HTMLElement | null);

  useEffect(() => {
    // Respect a child's autoFocus (e.g. the first form field); otherwise focus the panel itself.
    if (!panelRef.current?.contains(document.activeElement)) panelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusTo?.focus();
    };
  }, [onClose, returnFocusTo]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative max-h-[90vh] w-full ${size} overflow-y-auto rounded-2xl border border-ink-600 bg-ink-900 p-6 shadow-2xl outline-none`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-2xl text-white">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-ink-400 hover:bg-ink-800 hover:text-white" aria-label="Close dialog">
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
