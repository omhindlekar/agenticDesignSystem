import { useId } from 'react';
import type * as React from 'react';
import { Icon } from '../icon/icon';
import { dataState, describedBy } from '../shared/state';
import '../shared/shared.css';
import './field.css';

/** Props Field hands to the control it wraps. Spread them onto the control. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
  disabled?: boolean;
}

export interface FieldProps {
  label: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  children: (control: FieldControlProps) => React.ReactNode;
}

/**
 * Label, helper and error layout for a control the design system does not provide.
 * The render prop receives the id and ARIA attributes that link the control to them.
 */
export function Field({ label, helperText, errorMessage, required = false, disabled = false, children }: FieldProps) {
  const id = useId();
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const invalid = Boolean(errorMessage);
  const describe = describedBy(helperId, errorId);

  const control: FieldControlProps = {
    id,
    ...(describe ? { 'aria-describedby': describe } : {}),
    ...(invalid ? { 'aria-invalid': true as const } : {}),
    ...(required ? { 'aria-required': true as const } : {}),
    ...(disabled ? { disabled: true } : {}),
  };

  return (
    <div
      className="ads-field ads-form-field"
      data-variant={invalid ? 'error' : 'default'}
      data-state={dataState({ disabled, error: invalid }, 'default')}
    >
      <label className="ads-field__label" htmlFor={id}>
        {label}
        {required ? <span className="ads-field__required" aria-hidden="true"> *</span> : null}
      </label>
      {children(control)}
      {helperText ? (
        <p id={helperId} className="ads-field__message">
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
