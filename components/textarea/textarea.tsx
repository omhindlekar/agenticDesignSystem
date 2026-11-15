import { useState } from 'react';
import { FieldError, Label, Text, TextArea as RacTextArea, TextField } from 'react-aria-components';
import { Icon } from '../icon/icon';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './textarea.css';

export interface TextareaProps {
  label: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  onChange?: (value: string) => void;
}

/** Multi-line text entry. Grows with its content up to ten lines, then scrolls. */
export function Textarea({
  label,
  value,
  defaultValue,
  placeholder,
  name,
  rows = 3,
  maxLength,
  disabled = false,
  readOnly = false,
  required = false,
  helperText,
  errorMessage,
  onChange,
}: TextareaProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
  const current = value ?? uncontrolled;
  const invalid = Boolean(errorMessage);

  return (
    <TextField
      className="ads-field ads-textarea"
      data-variant={invalid ? 'error' : 'default'}
      data-state={dataState({ filled: current.length > 0, disabled, 'read-only': readOnly, error: invalid }, 'default')}
      {...(value !== undefined ? { value } : { defaultValue: defaultValue ?? '' })}
      onChange={(v) => {
        if (value === undefined) setUncontrolled(v);
        onChange?.(v);
      }}
      {...(name !== undefined ? { name } : {})}
      {...(maxLength !== undefined ? { maxLength } : {})}
      isDisabled={disabled}
      isReadOnly={readOnly}
      isRequired={required}
      isInvalid={invalid}
    >
      <Label className="ads-field__label">
        {label}
        {required ? <span className="ads-field__required" aria-hidden="true"> *</span> : null}
      </Label>
      <RacTextArea className="ads-textarea__field" rows={rows} {...(placeholder !== undefined ? { placeholder } : {})} />
      {helperText !== undefined || maxLength !== undefined ? (
        <Text slot="description" className="ads-field__message ads-textarea__description">
          <span>{helperText}</span>
          {maxLength !== undefined ? (
            <span className="ads-textarea__count">
              {current.length}/{maxLength}
            </span>
          ) : null}
        </Text>
      ) : null}
      <FieldError className="ads-field__message" data-tone="error">
        <Icon name="report" size="sm" />
        {errorMessage}
      </FieldError>
    </TextField>
  );
}
