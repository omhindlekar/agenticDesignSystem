import { useState } from 'react';
import { Button, Input, Label, SearchField as RacSearchField } from 'react-aria-components';
import { Icon } from '../icon/icon';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import '../icon-button/icon-button.css';
import './search-field.css';

export interface SearchFieldProps {
  label: string;
  hideLabel?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
}

/** A search box: search icon, Clear button while it has a value, Escape clears, Enter submits. */
export function SearchField({
  label,
  hideLabel = false,
  value,
  defaultValue,
  placeholder,
  name,
  disabled = false,
  onChange,
  onSubmit,
  onClear,
}: SearchFieldProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
  const current = value ?? uncontrolled;

  return (
    <RacSearchField
      className="ads-field ads-search-field"
      data-variant="default"
      data-state={dataState({ filled: current.length > 0, disabled }, 'default')}
      {...(value !== undefined ? { value } : { defaultValue: defaultValue ?? '' })}
      onChange={(v) => {
        if (value === undefined) setUncontrolled(v);
        onChange?.(v);
      }}
      {...(onSubmit ? { onSubmit } : {})}
      onClear={() => {
        if (value === undefined) setUncontrolled('');
        onClear?.();
      }}
      {...(name !== undefined ? { name } : {})}
      isDisabled={disabled}
    >
      <Label className={hideLabel ? 'ads-visually-hidden' : 'ads-field__label'}>{label}</Label>
      <div className="ads-search-field__control">
        <span className="ads-search-field__icon">
          <Icon name="search" />
        </span>
        <Input className="ads-search-field__input" {...(placeholder !== undefined ? { placeholder } : {})} />
        {current.length > 0 ? (
          <Button
            className="ads-icon-button ads-state-layer ads-search-field__clear"
            data-variant="standard"
            data-tone="primary"
            data-size="sm"
            data-state="default"
            aria-label="Clear search"
          >
            <Icon name="close" />
          </Button>
        ) : null}
      </div>
    </RacSearchField>
  );
}
