import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type * as React from 'react';
import { IconButton } from '../icon-button/icon-button';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'fullscreen';
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  loading?: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
}

/**
 * How long the close animation runs: the --motion-duration-overlay-exit token, or 0 under
 * prefers-reduced-motion or when the token is not available (for example in tests).
 */
function exitDurationMs(): number {
  if (typeof window === 'undefined') return 0;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--motion-duration-overlay-exit').trim();
  const ms = raw.endsWith('ms') ? parseFloat(raw) : raw.endsWith('s') ? parseFloat(raw) * 1000 : 0;
  return Number.isFinite(ms) ? ms : 0;
}

// useLayoutEffect warns during server rendering; fall back to useEffect there.
const useIsoLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  variant = 'default',
  size = 'md',
  footer,
  closeOnOverlayClick = true,
  initialFocusRef,
  loading = false,
}: ModalProps) {
  const titleId = useId();
  // Stays true for the exit animation after isOpen turns false, so the modal can animate out.
  const [exiting, setExiting] = useState(false);
  const wasOpen = useRef(isOpen);
  useEffect(() => {
    if (wasOpen.current && !isOpen) {
      const ms = exitDurationMs();
      if (ms > 0) {
        setExiting(true);
        const timer = setTimeout(() => setExiting(false), ms);
        wasOpen.current = isOpen;
        return () => clearTimeout(timer);
      }
    }
    if (isOpen) setExiting(false);
    wasOpen.current = isOpen;
    return undefined;
  }, [isOpen]);
  const shown = isOpen || exiting;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Open and close the native dialog, move focus in, and return it on close.
  useIsoLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !shown) return;

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) {
      // showModal gives the top layer and an inert background where supported.
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }

    const panel = panelRef.current;
    const target = initialFocusRef?.current ?? (panel ? focusableIn(panel)[0] : undefined) ?? panel;
    target?.focus();

    return () => {
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      returnFocusRef.current?.focus();
    };
  }, [shown, initialFocusRef]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !panelRef.current) return;
    const items = focusableIn(panelRef.current);
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const layout = variant === 'fullscreen' || size === 'fullscreen' ? 'fullscreen' : size;

  return (
    <dialog
      ref={dialogRef}
      className="ads-modal"
      role={variant === 'danger' ? 'alertdialog' : 'dialog'}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      hidden={!shown}
      data-variant={variant}
      data-size={layout}
      data-state={dataState({ open: shown, closed: !shown, loading: shown && loading })}
      data-exiting={exiting || undefined}
      onKeyDown={handleKeyDown}
      // The browser's own Escape handling is replaced by handleKeyDown so
      // onClose stays the single source of truth for closing.
      onCancel={(event) => event.preventDefault()}
    >
      <div
        className="ads-modal__overlay"
        data-testid="ads-modal-overlay"
        aria-hidden="true"
        onClick={() => {
          if (closeOnOverlayClick) onClose();
        }}
      />
      <div ref={panelRef} className="ads-modal__panel" tabIndex={-1}>
        <header className="ads-modal__header">
          <h2 id={titleId} className="ads-modal__title">
            {title}
          </h2>
          <IconButton icon="close" label="Close" size="sm" onClick={onClose} />
        </header>
        <div className="ads-modal__body">
          {loading ? (
            <p className="ads-modal__status" role="status">
              <span className="ads-spinner" aria-hidden="true" />
              <span>Loading</span>
            </p>
          ) : null}
          {children}
        </div>
        {footer ? <footer className="ads-modal__footer">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
