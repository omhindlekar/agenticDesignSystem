import type * as React from 'react';
import {
  Header,
  Keyboard,
  Menu as RacMenu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Popover,
  Separator,
  SubmenuTrigger,
  Text,
} from 'react-aria-components';
import type { Key, Selection } from 'react-aria-components';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import '../shared/shared.css';
import '../shared/popover.css';
import './menu.css';

export interface MenuItemSpec {
  type?: 'item';
  id: string;
  label: string;
  icon?: IconName;
  description?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  children?: MenuItemSpec[];
}

export type MenuEntry =
  MenuItemSpec | { type: 'section'; title: string; items: MenuItemSpec[] } | { type: 'separator' };

export interface MenuProps {
  label: string;
  items: MenuEntry[];
  trigger?: React.ReactElement;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  onAction?: (id: string) => void;
}

function Item({ item, onAction }: { item: MenuItemSpec; onAction?: (id: string) => void }) {
  const row = (
    <MenuItem
      id={item.id}
      textValue={item.label}
      className="ads-listbox__item ads-menu__item"
      data-tone={item.danger ? 'danger' : undefined}
      isDisabled={item.disabled ?? false}
      {...(onAction ? { onAction: () => onAction(item.id) } : {})}
    >
      {({ isSelected, selectionMode, hasSubmenu }) => (
        <>
          {selectionMode !== 'none' ? (
            <span className="ads-menu__check">{isSelected ? <Icon name="check" /> : null}</span>
          ) : item.icon ? (
            <span className="ads-menu__icon">
              <Icon name={item.icon} />
            </span>
          ) : null}
          <span className="ads-menu__text">
            <Text slot="label">{item.label}</Text>
            {item.description ? (
              <Text slot="description" className="ads-menu__description">
                {item.description}
              </Text>
            ) : null}
          </span>
          {item.shortcut ? <Keyboard className="ads-menu__shortcut">{item.shortcut}</Keyboard> : null}
          {hasSubmenu ? (
            <span className="ads-menu__submenu">
              <Icon name="keyboard_arrow_right" />
            </span>
          ) : null}
        </>
      )}
    </MenuItem>
  );
  if (!item.children?.length) return row;
  return (
    <SubmenuTrigger>
      {row}
      <Popover className="ads-popover" offset={-4} crossOffset={-4}>
        <RacMenu className="ads-listbox ads-menu" aria-label={item.label}>
          {item.children.map((child) => (
            <Item key={child.id} item={child} {...(onAction ? { onAction } : {})} />
          ))}
        </RacMenu>
      </Popover>
    </SubmenuTrigger>
  );
}

/**
 * A list of actions or options opened from a trigger. With no trigger, a "label ▾"
 * Button is used (a menu button). Arrow keys move, typing jumps, Enter runs, Escape closes.
 */
export function Menu({
  label,
  items,
  trigger,
  selectionMode = 'none',
  selectedKeys,
  onSelectionChange,
  onAction,
}: MenuProps) {
  return (
    <span className="ads-overlay-root" data-variant={selectionMode} data-state="default">
      <MenuTrigger>
        {trigger ?? <Button label={label} variant="outlined" iconEnd={<Icon name="keyboard_arrow_down" />} />}
        <Popover className="ads-popover" offset={4} placement="bottom start">
          <RacMenu
            className="ads-listbox ads-menu"
            aria-label={label}
            selectionMode={selectionMode}
            {...(selectedKeys ? { selectedKeys: new Set<Key>(selectedKeys) } : {})}
            {...(onSelectionChange
              ? {
                  onSelectionChange: (keys: Selection) =>
                    onSelectionChange(keys === 'all' ? [] : [...keys].map((k) => String(k))),
                }
              : {})}
          >
            {items.map((entry, i) => {
              if (entry.type === 'separator') return <Separator key={`sep-${i}`} className="ads-menu__separator" />;
              if (entry.type === 'section') {
                return (
                  <MenuSection key={`sec-${entry.title}`} className="ads-menu__section">
                    <Header className="ads-menu__header">{entry.title}</Header>
                    {entry.items.map((item) => (
                      <Item key={item.id} item={item} {...(onAction ? { onAction } : {})} />
                    ))}
                  </MenuSection>
                );
              }
              return <Item key={entry.id} item={entry} {...(onAction ? { onAction } : {})} />;
            })}
          </RacMenu>
        </Popover>
      </MenuTrigger>
    </span>
  );
}
