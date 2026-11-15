import { Label, ProgressBar as RacProgressBar } from 'react-aria-components';
import '../shared/shared.css';
import './progress-bar.css';

export interface ProgressBarProps {
  label: string;
  value?: number;
  minValue?: number;
  maxValue?: number;
  indeterminate?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
  showValue?: boolean;
}

/** Shows how far a task has got, or that work is ongoing when the amount is unknown. */
export function ProgressBar({
  label,
  value = 0,
  minValue = 0,
  maxValue = 100,
  indeterminate = false,
  formatOptions,
  showValue = true,
}: ProgressBarProps) {
  return (
    <RacProgressBar
      className="ads-progress"
      data-variant={indeterminate ? 'indeterminate' : 'determinate'}
      data-state="default"
      value={value}
      minValue={minValue}
      maxValue={maxValue}
      isIndeterminate={indeterminate}
      {...(formatOptions ? { formatOptions } : {})}
    >
      {({ percentage, valueText }) => (
        <>
          <div className="ads-progress__header">
            <Label className="ads-field__label">{label}</Label>
            {showValue && !indeterminate ? <span className="ads-progress__value">{valueText}</span> : null}
          </div>
          <div className="ads-progress__track">
            <div className="ads-progress__fill" style={indeterminate ? undefined : { width: `${percentage ?? 0}%` }} />
          </div>
        </>
      )}
    </RacProgressBar>
  );
}
