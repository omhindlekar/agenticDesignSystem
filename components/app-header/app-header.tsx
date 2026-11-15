import { useEffect, useState } from 'react';
import type * as React from 'react';
import tokens from '../../styles/tokens.json';
import { IconButton } from '../icon-button/icon-button';
import { Menu } from '../menu/menu';
import '../shared/shared.css';
import './app-header.css';

export interface AppHeaderProps {
  title: string;
  logo?: React.ReactNode;
  nav?: Array<{ label: string; href: string; current?: boolean }>;
  search?: React.ReactNode;
  actions?: React.ReactNode;
  layout?: 'auto' | 'wide' | 'compact';
}

/** CSS media queries cannot read custom properties, so the breakpoint comes from tokens.json. */
const WIDE = `(min-width: ${(tokens as { base: Record<string, string> }).base['breakpoint-md'] ?? '900px'})`;

function useWide(): boolean {
  const query = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(WIDE).matches : true);
  const [wide, setWide] = useState(query);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(WIDE);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
}

/**
 * The bar across the top of the app: product name, primary navigation, search and actions.
 * Below breakpoint-md the navigation collapses into a menu.
 */
export function AppHeader({ title, logo, nav = [], search, actions, layout = 'auto' }: AppHeaderProps) {
  const viewportWide = useWide();
  const wide = layout === 'auto' ? viewportWide : layout === 'wide';
  return (
    <header className="ads-app-header" data-variant={wide ? 'wide' : 'compact'} data-state="default">
      {!wide && nav.length ? (
        <Menu
          label="Navigation"
          trigger={<IconButton icon="menu" label="Navigation" />}
          items={nav.map((n) => ({ id: n.href, label: n.label }))}
          onAction={(href) => {
            if (typeof window !== 'undefined') window.location.assign(href);
          }}
        />
      ) : null}
      <span className="ads-app-header__brand">
        {logo}
        <span className="ads-app-header__title">{title}</span>
      </span>
      {wide && nav.length ? (
        <nav aria-label="Primary" className="ads-app-header__nav">
          {nav.map((n) => (
            <a key={n.href} className="ads-app-header__link" href={n.href} {...(n.current ? { 'aria-current': 'page' as const } : {})}>
              {n.label}
            </a>
          ))}
        </nav>
      ) : null}
      <span className="ads-app-header__spacer" />
      {search ? <span className="ads-app-header__search">{search}</span> : null}
      {actions ? <span className="ads-app-header__actions">{actions}</span> : null}
    </header>
  );
}
