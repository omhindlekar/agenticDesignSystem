import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import type * as React from 'react';
import { Button } from '../button/button';
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Open and close the native dialog, move focus in, and return it on close.
  useIsoLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;

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
  }, [isOpen, initialFocusRef]);

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
      hidden={!isOpen}
      data-variant={variant}
      data-size={layout}
      data-state={dataState({ open: isOpen, closed: !isOpen, loading: isOpen && loading })}
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
          <Button label="Close" variant="text" size="sm" onClick={onClose} />
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
