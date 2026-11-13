import { useState } from 'react';
import { Switch as RacSwitch } from 'react-aria-components';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './switch.css';

export interface SwitchProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  onChange?: (checked: boolean) => void;
}

/** Turns a setting on or off with immediate effect. Space toggles it. */
export function Switch({ label, checked, defaultChecked = false, disabled = false, name, value, onChange }: SwitchProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const on = checked ?? uncontrolled;

  return (
    <RacSwitch
      className="ads-switch"
      data-variant="default"
      data-state={dataState({ checked: on, unchecked: !on, disabled })}
      isSelected={on}
      onChange={(next) => {
        if (checked === undefined) setUncontrolled(next);
        onChange?.(next);
      }}
      isDisabled={disabled}
      {...(name !== undefined ? { name } : {})}
      {...(value !== undefined ? { value } : {})}
    >
      <span className="ads-switch__control" aria-hidden="true">
        <span className="ads-switch__layer" />
        <span className="ads-switch__track">
          <span className="ads-switch__thumb" />
        </span>
      </span>
      <span className="ads-switch__label">{label}</span>
    </RacSwitch>
  );
}
