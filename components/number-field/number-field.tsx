import { useState } from 'react';
import { Button, FieldError, Group, Input, Label, NumberField as RacNumberField, Text } from 'react-aria-components';
import { Icon } from '../icon/icon';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import '../icon-button/icon-button.css';
import './number-field.css';

export interface NumberFieldProps {
  label: string;
  value?: number;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  formatOptions?: Intl.NumberFormatOptions;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  onChange?: (value: number) => void;
}

/** A number with step buttons. Arrow Up and Down step; the value is clamped and formatted for the locale. */
export function NumberField({
  label,
  value,
  defaultValue,
  minValue,
  maxValue,
  step = 1,
  formatOptions,
  name,
  disabled = false,
  required = false,
  helperText,
  errorMessage,
  onChange,
}: NumberFieldProps) {
  const [uncontrolled, setUncontrolled] = useState<number>(defaultValue ?? Number.NaN);
  const current = value ?? uncontrolled;
  const invalid = Boolean(errorMessage);

  return (
    <RacNumberField
      className="ads-field ads-number-field"
      data-variant={invalid ? 'error' : 'default'}
      data-state={dataState({ filled: !Number.isNaN(current), disabled, error: invalid }, 'default')}
      value={current}
      onChange={(v) => {
        if (value === undefined) setUncontrolled(v);
        onChange?.(v);
      }}
      {...(minValue !== undefined ? { minValue } : {})}
      {...(maxValue !== undefined ? { maxValue } : {})}
      step={step}
      {...(formatOptions ? { formatOptions } : {})}
      {...(name !== undefined ? { name } : {})}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={invalid}
    >
      <Label className="ads-field__label">
        {label}
        {required ? <span className="ads-field__required" aria-hidden="true"> *</span> : null}
      </Label>
      <Group className="ads-number-field__group">
        <Input className="ads-number-field__input" />
        {(['decrement', 'increment'] as const).map((slot) => (
          <Button
            key={slot}
            slot={slot}
            className="ads-icon-button ads-state-layer ads-number-field__step"
            data-variant="standard"
            data-tone="primary"
            data-size="sm"
            data-state="default"
          >
            <Icon name={slot === 'increment' ? 'add' : 'remove'} />
          </Button>
        ))}
      </Group>
      {helperText ? (
        <Text slot="description" className="ads-field__message">
          {helperText}
        </Text>
      ) : null}
      <FieldError className="ads-field__message" data-tone="error">
        <Icon name="report" size="sm" />
        {errorMessage}
      </FieldError>
    </RacNumberField>
  );
}
