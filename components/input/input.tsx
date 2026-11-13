import { useId, useRef, useState } from 'react';
import type * as React from 'react';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import { IconButton } from '../icon-button/icon-button';
import { dataState, describedBy } from '../shared/state';
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
  startIcon?: IconName;
  clearable?: boolean;
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
  startIcon,
  clearable = false,
}: InputProps) {
  const id = useId();
  const fieldRef = useRef<HTMLInputElement>(null);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
  const [revealed, setRevealed] = useState(false);
  const current = value ?? uncontrolled;
  const resolvedVariant = variant ?? (errorMessage ? 'error' : 'default');
  const errorId = errorMessage ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const editable = !disabled && !readOnly;
  const isPassword = type === 'password';
  const showClear = clearable && editable && current.length > 0;
  const endActions = (showClear ? 1 : 0) + (isPassword ? 1 : 0);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (value === undefined) setUncontrolled(event.target.value);
    onChange?.(event.target.value);
  }

  function clear() {
    const field = fieldRef.current;
    if (value === undefined) {
      if (field) field.value = '';
      setUncontrolled('');
    }
    onChange?.('');
    field?.focus();
  }

  const valueProps = value !== undefined ? { value } : { defaultValue: defaultValue ?? '' };

  return (
    <div
      className="ads-field ads-input"
      data-variant={resolvedVariant}
      data-start={startIcon !== undefined ? 'true' : undefined}
      data-end={endActions > 0 ? String(endActions) : undefined}
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
      <div className="ads-input__control">
        {startIcon !== undefined ? (
          <span className="ads-input__start">
            <Icon name={startIcon} />
          </span>
        ) : null}
        <input
          ref={fieldRef}
          id={id}
          className="ads-input__field"
          type={isPassword && revealed ? 'text' : type}
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
        {endActions > 0 ? (
          <span className="ads-input__end">
            {showClear ? <IconButton icon="close" label={`Clear ${label}`} size="sm" onClick={clear} /> : null}
            {isPassword ? (
              <IconButton
                icon={revealed ? 'visibility_off' : 'visibility'}
                label="Show password"
                size="sm"
                pressed={revealed}
                disabled={disabled}
                onClick={() => setRevealed((r) => !r)}
              />
            ) : null}
          </span>
        ) : null}
      </div>
      {helperText ? (
        <p id={helperId} className="ads-field__message" data-tone={resolvedVariant === 'success' ? 'success' : undefined}>
          {resolvedVariant === 'success' ? <Icon name="check_circle" size="sm" /> : null}
          {helperText}
        </p>
      ) : null}
      {errorMessage ? (
        <p id={errorId} className="ads-field__message" data-tone="error">
          <Icon name="report" size="sm" />
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
