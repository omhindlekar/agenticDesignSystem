/**
 * Inline SVG icons drawn in currentColor. Square line caps and square shapes keep
 * them on brand (radius 0); no icon font, so the only fonts remain Saira and
 * Saira SemiCondensed. Every icon is decorative: aria-hidden and not focusable.
 */
import type * as React from 'react';

function Icon({ children, className }: { children: React.ReactNode; className?: string | undefined }) {
  return (
    <svg
      className={className ? `ads-icon ${className}` : 'ads-icon'}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
    </Icon>
  );
}

export function DashIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M6 12h12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
    </Icon>
  );
}

/** A filled square with the exclamation mark cut out. */
export function ErrorIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path fillRule="evenodd" fill="currentColor" d="M3 3h18v18H3V3zm8 4v7h2V7h-2zm0 9v2h2v-2h-2z" />
    </Icon>
  );
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Icon>
  );
}
