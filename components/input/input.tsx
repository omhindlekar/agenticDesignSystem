import { useId, useState } from 'react';
import type * as React from 'react';
import { dataState, describedBy } from '../shared/state';
import { ErrorIcon } from '../shared/icons';
import '../shared/shared.css';
import './input.css';

export interface InputProps {
  label: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  errorMessage?: string;
  helperText?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'error' | 'success';
}

export function Input({
  label,
  value,
  defaultValue,
  placeholder,
  type = 'text',
  name,
  disabled = false,
  readOnly = false,
  required = false,
  errorMessage,
  helperText,
  onChange,
  variant,
}: InputProps) {
  const id = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
  const current = value ?? uncontrolled;
  const resolvedVariant = variant ?? (errorMessage ? 'error' : 'default');
  const errorId = errorMessage ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (value === undefined) setUncontrolled(event.target.value);
    onChange?.(event.target.value);
  }

  const valueProps = value !== undefined ? { value } : { defaultValue: defaultValue ?? '' };

  return (
    <div
      className="ads-field ads-input"
      data-variant={resolvedVariant}
      data-state={dataState(
        {
          filled: current.length > 0,
          disabled,
          'read-only': readOnly,
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
      <input
        id={id}
        className="ads-input__field"
        type={type}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        aria-invalid={resolvedVariant === 'error' || undefined}
        aria-describedby={describedBy(helperId, errorId)}
        onChange={handleChange}
        {...valueProps}
      />
      {helperText ? (
        <p id={helperId} className="ads-field__message">{helperText}</p>
      ) : null}
      {errorMessage ? (
        <p id={errorId} className="ads-field__message" data-tone="error">
          <ErrorIcon />
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
