import { useState } from 'react';
import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as RacSelect,
  SelectValue,
  Text,
} from 'react-aria-components';
import type { Key } from 'react-aria-components';
import { Icon } from '../icon/icon';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import '../shared/popover.css';
import './select.css';

export interface SelectProps {
  label: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  errorMessage?: string;
  helperText?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'error' | 'success';
}

/**
 * Picks one option from a short list. A field-styled button opens a list box with
 * typeahead and full keyboard support; a hidden native select submits it with forms.
 */
export function Select({
  label,
  options,
  value,
  defaultValue,
  placeholder,
  name,
  disabled = false,
  required = false,
  errorMessage,
  helperText,
  onChange,
  variant,
}: SelectProps) {
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue ?? null);
  const current = value ?? uncontrolled;
  const resolvedVariant = variant ?? (errorMessage ? 'error' : 'default');
  const disabledKeys = options.filter((o) => o.disabled).map((o) => o.value);

  return (
    <RacSelect
      className="ads-field ads-select"
      data-variant={resolvedVariant}
      data-state={dataState(
        {
          selected: current !== null && current !== '',
          disabled,
          error: resolvedVariant === 'error',
          success: resolvedVariant === 'success',
        },
        'default',
      )}
      selectedKey={current}
      onSelectionChange={(key: Key | null) => {
        const next = key === null ? '' : String(key);
        if (value === undefined) setUncontrolled(next);
        onChange?.(next);
      }}
      disabledKeys={disabledKeys}
      {...(placeholder !== undefined ? { placeholder } : {})}
      {...(name !== undefined ? { name } : {})}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={resolvedVariant === 'error'}
    >
      <Label className="ads-field__label">
        {label}
        {required ? <span className="ads-field__required" aria-hidden="true"> *</span> : null}
      </Label>
      <Button className="ads-select__field">
        <SelectValue className="ads-select__value" />
        <span className="ads-select__chevron">
          <Icon name="keyboard_arrow_down" />
        </span>
      </Button>
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
        <ListBox className="ads-listbox">
          {options.map((option) => (
            <ListBoxItem key={option.value} id={option.value} textValue={option.label} className="ads-listbox__item">
              <span>{option.label}</span>
              <span className="ads-listbox__check">
                <Icon name="check" />
              </span>
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </RacSelect>
  );
}
