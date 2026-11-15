import { useState } from 'react';
import { FieldError, Label, Radio, RadioGroup as RacRadioGroup, Text } from 'react-aria-components';
import { Icon } from '../icon/icon';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './radio-group.css';

export interface RadioGroupProps {
  label: string;
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>;
  value?: string;
  defaultValue?: string;
  orientation?: 'vertical' | 'horizontal';
  name?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  onChange?: (value: string) => void;
}

/** One choice from a short list. Arrow keys move the selection; Tab leaves the group. */
export function RadioGroup({
  label,
  options,
  value,
  defaultValue,
  orientation = 'vertical',
  name,
  disabled = false,
  required = false,
  helperText,
  errorMessage,
  onChange,
}: RadioGroupProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? null);
  const invalid = Boolean(errorMessage);

  return (
    <RacRadioGroup
      className="ads-field ads-radio-group"
      data-variant={invalid ? 'error' : 'default'}
      data-state={dataState({ disabled, error: invalid }, 'default')}
      orientation={orientation}
      {...(value !== undefined ? { value } : { value: uncontrolled })}
      onChange={(v) => {
        if (value === undefined) setUncontrolled(v);
        onChange?.(v);
      }}
      {...(name !== undefined ? { name } : {})}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={invalid}
    >
      <Label className="ads-field__label">
        {label}
        {required ? <span className="ads-field__required" aria-hidden="true"> *</span> : null}
      </Label>
      <div className="ads-radio-group__options">
        {options.map((option) => (
          <Radio key={option.value} value={option.value} className="ads-radio" isDisabled={option.disabled ?? false}>
            <span className="ads-radio__control" aria-hidden="true">
              <span className="ads-radio__layer" />
              <span className="ads-radio__box">
                <span className="ads-radio__dot" />
              </span>
            </span>
            <span className="ads-radio__text">
              <span className="ads-radio__label">{option.label}</span>
              {option.description ? <span className="ads-radio__description">{option.description}</span> : null}
            </span>
          </Radio>
        ))}
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
    </RacRadioGroup>
  );
}
