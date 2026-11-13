import { useState } from 'react';
import {
  Button,
  ComboBox as RacComboBox,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
} from 'react-aria-components';
import type { Key } from 'react-aria-components';
import { Icon } from '../icon/icon';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import '../shared/popover.css';
import '../icon-button/icon-button.css';
import './combobox.css';

export interface ComboboxProps {
  label: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string | null;
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  allowsCustomValue?: boolean;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  onChange?: (value: string | null) => void;
  onInputChange?: (text: string) => void;
}

/**
 * A text field that filters a list as the user types. Arrow Down opens the list,
 * Enter chooses, Escape closes. Use it for long or searchable lists.
 */
export function Combobox({
  label,
  options,
  value,
  defaultValue,
  placeholder,
  name,
  allowsCustomValue = false,
  disabled = false,
  required = false,
  helperText,
  errorMessage,
  onChange,
  onInputChange,
}: ComboboxProps) {
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue ?? null);
  const current = value !== undefined ? value : uncontrolled;
  const invalid = Boolean(errorMessage);

  return (
    <RacComboBox
      className="ads-field ads-combobox"
      data-variant={invalid ? 'error' : 'default'}
      data-state={dataState({ filled: current !== null, disabled, error: invalid }, 'default')}
      defaultItems={options}
      selectedKey={current}
      onSelectionChange={(key: Key | null) => {
        const next = key === null ? null : String(key);
        if (value === undefined) setUncontrolled(next);
        onChange?.(next);
      }}
      {...(onInputChange ? { onInputChange } : {})}
      disabledKeys={options.filter((o) => o.disabled).map((o) => o.value)}
      allowsCustomValue={allowsCustomValue}
      allowsEmptyCollection
      {...(name !== undefined ? { name } : {})}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={invalid}
    >
      <Label className="ads-field__label">
        {label}
        {required ? <span className="ads-field__required" aria-hidden="true"> *</span> : null}
      </Label>
      <div className="ads-combobox__control">
        <Input className="ads-combobox__input" {...(placeholder !== undefined ? { placeholder } : {})} />
        <Button
          className="ads-icon-button ads-state-layer ads-combobox__trigger"
          data-variant="standard"
          data-tone="primary"
          data-size="sm"
          data-state="default"
        >
          <Icon name="keyboard_arrow_down" />
        </Button>
      </div>
      {helperText ? (
        <Text slot="description" className="ads-field__message">
          {helperText}
        </Text>
      ) : null}
      <FieldError className="ads-field__message" data-tone="error">
        <Icon name="report" size="sm" />
        {errorMessage}
      </FieldError>
      <Popover className="ads-popover" offset={4}>
        <ListBox className="ads-listbox" renderEmptyState={() => <div className="ads-listbox__empty">No results</div>}>
          {(option: { value: string; label: string }) => (
            <ListBoxItem id={option.value} textValue={option.label} className="ads-listbox__item">
              <span>{option.label}</span>
              <span className="ads-listbox__check">
                <Icon name="check" />
              </span>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </RacComboBox>
  );
}
