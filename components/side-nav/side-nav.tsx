import { Button, Disclosure, DisclosurePanel } from 'react-aria-components';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import '../shared/shared.css';
import './side-nav.css';

export interface SideNavItem {
  type?: 'item';
  id: string;
  label: string;
  href: string;
  icon?: IconName;
}

export type SideNavEntry = SideNavItem | { type: 'group'; id: string; label: string; icon?: IconName; items: SideNavItem[] };

export interface SideNavProps {
  label: string;
  items: SideNavEntry[];
  currentId?: string;
  collapsed?: boolean;
}

function NavLink({ item, currentId, nested }: { item: SideNavItem; currentId?: string | undefined; nested?: boolean }) {
  const current = item.id === currentId;
  return (
    <li>
      <a
        className="ads-side-nav__link"
        data-nested={nested || undefined}
        href={item.href}
        {...(current ? { 'aria-current': 'page' as const } : {})}
      >
        {item.icon ? <Icon name={item.icon} /> : <span className="ads-side-nav__spacer" aria-hidden="true" />}
        <span className="ads-side-nav__label">{item.label}</span>
      </a>
    </li>
  );
}

/**
 * The app's primary navigation down the side: links, collapsible groups, the current page
 * marked with aria-current. Rail mode shows icons only, keeping every link named.
 */
export function SideNav({ label, items, currentId, collapsed = false }: SideNavProps) {
  return (
    <nav aria-label={label} className="ads-side-nav" data-variant={collapsed ? 'rail' : 'expanded'} data-state="default">
      <ul className="ads-side-nav__list">
        {items.map((entry) => {
          if (entry.type !== 'group') return <NavLink key={entry.id} item={entry} currentId={currentId} />;
          const holdsCurrent = entry.items.some((i) => i.id === currentId);
          return (
            <li key={entry.id}>
              <Disclosure className="ads-side-nav__group" defaultExpanded={holdsCurrent}>
                <Button slot="trigger" className="ads-side-nav__link ads-side-nav__toggle">
                  {entry.icon ? <Icon name={entry.icon} /> : <span className="ads-side-nav__spacer" aria-hidden="true" />}
                  <span className="ads-side-nav__label">{entry.label}</span>
                  <span className="ads-side-nav__chevron" aria-hidden="true">
                    <Icon name="keyboard_arrow_down" />
                  </span>
                </Button>
                <DisclosurePanel>
                  <ul className="ads-side-nav__list">
                    {entry.items.map((item) => (
                      <NavLink key={item.id} item={item} currentId={currentId} nested />
                    ))}
                  </ul>
                </DisclosurePanel>
              </Disclosure>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
