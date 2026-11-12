import { useId, useState } from 'react';
import type * as React from 'react';
import { dataState, describedBy } from '../shared/state';
import '../shared/shared.css';
import './select.css';

export interface SelectProps {
  label: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  errorMessage?: string;
  helperText?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'error' | 'success';
}

export function Select({
  label,
  options,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  required = false,
  errorMessage,
  helperText,
  onChange,
  variant,
}: SelectProps) {
  const id = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
  const current = value ?? uncontrolled;
  const resolvedVariant = variant ?? (errorMessage ? 'error' : 'default');
  const errorId = errorMessage ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (value === undefined) setUncontrolled(event.target.value);
    onChange?.(event.target.value);
  }

  const valueProps = value !== undefined ? { value } : { defaultValue: defaultValue ?? '' };

  return (
    <div
      className="ads-field ads-select"
      data-variant={resolvedVariant}
      data-state={dataState(
        {
          selected: current.length > 0,
          disabled,
          error: resolvedVariant === 'error',
          success: resolvedVariant === 'success',
        },
        'default',
      )}
    >
      <label className="ads-field__label" htmlFor={id}>
        {label}
        {required ? <span className="ads-field__required" aria-hidden="true"> *</span> : null}
      </label>
      <select
        id={id}
        className="ads-select__field"
        disabled={disabled}
        required={required}
        aria-invalid={resolvedVariant === 'error' || undefined}
        aria-describedby={describedBy(helperId, errorId)}
        onChange={handleChange}
        {...valueProps}
      >
        {placeholder !== undefined || current === '' ? (
          <option value="" disabled>
            {placeholder ?? ''}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText ? (
        <p id={helperId} className="ads-field__message">{helperText}</p>
      ) : null}
      {errorMessage ? (
        <p id={errorId} className="ads-field__message" data-tone="error">{errorMessage}</p>
      ) : null}
    </div>
  );
}
