import type * as React from 'react';
import { Tab, TabList, TabPanel, Tabs as RacTabs } from 'react-aria-components';
import type { Key } from 'react-aria-components';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import '../shared/shared.css';
import './tabs.css';

export interface TabsProps {
  label: string;
  tabs: Array<{ id: string; label: string; icon?: IconName; disabled?: boolean; content: React.ReactNode }>;
  selectedKey?: string;
  defaultSelectedKey?: string;
  orientation?: 'horizontal' | 'vertical';
  keyboardActivation?: 'automatic' | 'manual';
  onSelectionChange?: (id: string) => void;
}

/** Switches between views of related content on the same page. Arrow keys move between tabs. */
export function Tabs({
  label,
  tabs,
  selectedKey,
  defaultSelectedKey,
  orientation = 'horizontal',
  keyboardActivation = 'automatic',
  onSelectionChange,
}: TabsProps) {
  return (
    <RacTabs
      className="ads-tabs"
      data-variant={orientation}
      data-state="default"
      orientation={orientation}
      keyboardActivation={keyboardActivation}
      {...(selectedKey !== undefined ? { selectedKey } : {})}
      {...(defaultSelectedKey !== undefined ? { defaultSelectedKey } : {})}
      {...(onSelectionChange ? { onSelectionChange: (k: Key) => onSelectionChange(String(k)) } : {})}
      disabledKeys={tabs.filter((t) => t.disabled).map((t) => t.id)}
    >
      <TabList className="ads-tabs__list" aria-label={label}>
        {tabs.map((t) => (
          <Tab key={t.id} id={t.id} className="ads-tabs__tab">
            {t.icon ? <Icon name={t.icon} /> : null}
            <span>{t.label}</span>
          </Tab>
        ))}
      </TabList>
      {tabs.map((t) => (
        <TabPanel key={t.id} id={t.id} className="ads-tabs__panel">
          {t.content}
        </TabPanel>
      ))}
    </RacTabs>
  );
}
