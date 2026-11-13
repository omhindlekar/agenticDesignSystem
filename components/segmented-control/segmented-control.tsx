import { useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components';
import type { Key } from 'react-aria-components';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './segmented-control.css';

export interface SegmentedControlProps {
  label: string;
  options: Array<{ value: string; label: string; icon?: IconName; disabled?: boolean }>;
  selectionMode?: 'single' | 'multiple';
  value?: string[];
  defaultValue?: string[];
  size?: 'sm' | 'md';
  disabled?: boolean;
  onChange?: (value: string[]) => void;
}

/**
 * A row of connected toggle buttons. Single mode is a radio group (one always
 * selected; arrow keys move between segments); multiple mode is a set of toggles.
 */
export function SegmentedControl({
  label,
  options,
  selectionMode = 'single',
  value,
  defaultValue,
  size = 'md',
  disabled = false,
  onChange,
}: SegmentedControlProps) {
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultValue ?? []);
  const selected = value ?? uncontrolled;

  return (
    <ToggleButtonGroup
      className="ads-segmented"
      data-variant={selectionMode}
      data-size={size}
      data-state={dataState({ disabled }, 'default')}
      aria-label={label}
      selectionMode={selectionMode}
      disallowEmptySelection={selectionMode === 'single'}
      selectedKeys={new Set<Key>(selected)}
      onSelectionChange={(keys) => {
        const next = options.map((o) => o.value).filter((v) => keys.has(v));
        if (value === undefined) setUncontrolled(next);
        onChange?.(next);
      }}
      isDisabled={disabled}
    >
      {options.map((option) => (
        <ToggleButton key={option.value} id={option.value} className="ads-segmented__item" isDisabled={option.disabled ?? false}>
          {option.icon ? <Icon name={option.icon} /> : null}
          <span>{option.label}</span>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
