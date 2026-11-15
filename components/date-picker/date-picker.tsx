import { useState } from 'react';
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker as RacDatePicker,
  DateSegment,
  Dialog,
  FieldError,
  Group,
  Heading,
  Label,
  Popover,
  Text,
} from 'react-aria-components';
import { parseDate } from '@internationalized/date';
import type { CalendarDate, DateValue } from '@internationalized/date';
import { Icon } from '../icon/icon';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import '../shared/popover.css';
import '../icon-button/icon-button.css';
import './date-picker.css';

export interface DatePickerProps {
  label: string;
  value?: string | null;
  defaultValue?: string;
  minValue?: string;
  maxValue?: string;
  isDateUnavailable?: (date: string) => boolean;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  onChange?: (value: string | null) => void;
}

const toDate = (iso: string | null | undefined): CalendarDate | null => (iso ? parseDate(iso) : null);

/**
 * A date as editable day, month and year segments (in the user's locale order) with a
 * calendar popover. Values are ISO dates, for example "2026-03-15".
 */
export function DatePicker({
  label,
  value,
  defaultValue,
  minValue,
  maxValue,
  isDateUnavailable,
  name,
  disabled = false,
  required = false,
  helperText,
  errorMessage,
  onChange,
}: DatePickerProps) {
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue ?? null);
  const current = value !== undefined ? value : uncontrolled;
  const invalid = Boolean(errorMessage);
  const min = toDate(minValue);
  const max = toDate(maxValue);

  return (
    <RacDatePicker
      className="ads-field ads-date-picker"
      data-variant={invalid ? 'error' : 'default'}
      data-state={dataState({ filled: current !== null, disabled, error: invalid }, 'default')}
      value={toDate(current)}
      onChange={(next: DateValue | null) => {
        const iso = next ? next.toString().slice(0, 10) : null;
        if (value === undefined) setUncontrolled(iso);
        onChange?.(iso);
      }}
      {...(min ? { minValue: min } : {})}
      {...(max ? { maxValue: max } : {})}
      {...(isDateUnavailable ? { isDateUnavailable: (d: DateValue) => isDateUnavailable(d.toString().slice(0, 10)) } : {})}
      {...(name !== undefined ? { name } : {})}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={invalid}
    >
      <Label className="ads-field__label">
        {label}
        {required ? <span className="ads-field__required" aria-hidden="true"> *</span> : null}
      </Label>
      <Group className="ads-date-picker__group">
        <DateInput className="ads-date-picker__input">
          {(segment) => <DateSegment segment={segment} className="ads-date-picker__segment" />}
        </DateInput>
        <Button
          className="ads-icon-button ads-state-layer ads-date-picker__button"
          data-variant="standard"
          data-tone="primary"
          data-size="sm"
          data-state="default"
          aria-label="Calendar"
        >
          <Icon name="calendar_today" />
        </Button>
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
      <Popover className="ads-popover ads-date-picker__popover" offset={4}>
        <Dialog className="ads-date-picker__dialog">
          <Calendar className="ads-calendar">
            <header className="ads-calendar__header">
              <Button
                slot="previous"
                className="ads-icon-button ads-state-layer ads-calendar__nav"
                data-variant="standard"
                data-tone="primary"
                data-size="sm"
                data-state="default"
              >
                <Icon name="keyboard_arrow_left" />
              </Button>
              <Heading className="ads-calendar__heading" />
              <Button
                slot="next"
                className="ads-icon-button ads-state-layer ads-calendar__nav"
                data-variant="standard"
                data-tone="primary"
                data-size="sm"
                data-state="default"
              >
                <Icon name="keyboard_arrow_right" />
              </Button>
            </header>
            <CalendarGrid className="ads-calendar__grid">{(date) => <CalendarCell date={date} className="ads-calendar__cell" />}</CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </RacDatePicker>
  );
}
