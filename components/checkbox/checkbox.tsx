import { useEffect, useId, useRef, useState } from 'react';
import type * as React from 'react';
import { dataState, describedBy } from '../shared/state';
import { Icon } from '../icon/icon';
import '../shared/shared.css';
import './checkbox.css';

export interface CheckboxProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  errorMessage?: string;
  helperText?: string;
  name?: string;
  value?: string;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({
  label,
  checked,
  defaultChecked = false,
  indeterminate = false,
  disabled = false,
  required = false,
  errorMessage,
  helperText,
  name,
  value,
  onChange,
}: CheckboxProps) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const isChecked = checked ?? uncontrolled;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;

  // indeterminate is a DOM property only; there is no HTML attribute for it.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (checked === undefined) setUncontrolled(event.target.checked);
    onChange?.(event.target.checked);
  }

  const checkedProps = checked !== undefined ? { checked } : { defaultChecked };

  return (
    <div
      className="ads-field ads-checkbox"
      data-variant={indeterminate ? 'indeterminate' : 'default'}
      data-state={dataState({
        unchecked: !indeterminate && !isChecked,
        checked: !indeterminate && isChecked,
        indeterminate,
        disabled,
        error: Boolean(errorMessage),
      })}
    >
      <div className="ads-checkbox__row">
        {/* A label wrapping the input makes the 40px square clickable; its only
            content is decorative, so the visible label still names the control. */}
        <label className="ads-checkbox__control">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="ads-checkbox__box"
            name={name}
            value={value}
            disabled={disabled}
            required={required}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={describedBy(helperId, errorId)}
            onChange={handleChange}
            {...checkedProps}
          />
          {/* Square state layer over the 40px hit area, shown on hover, focus and press. */}
          <span className="ads-checkbox__layer" aria-hidden="true" />
          {/* Both icons render; CSS shows the one matching :checked or :indeterminate. */}
          <span className="ads-checkbox__check">
            <Icon name="check_small" />
          </span>
          <span className="ads-checkbox__dash">
            <Icon name="remove" />
          </span>
        </label>
        <label className="ads-field__label ads-checkbox__label" htmlFor={id}>
          {label}
          {required ? <span className="ads-field__required" aria-hidden="true"> *</span> : null}
        </label>
      </div>
      {helperText ? (
        <p id={helperId} className="ads-field__message">{helperText}</p>
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
