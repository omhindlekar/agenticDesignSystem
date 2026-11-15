import { useState } from 'react';
import { Label, Slider as RacSlider, SliderOutput, SliderThumb, SliderTrack } from 'react-aria-components';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './slider.css';

export interface SliderProps {
  label: string;
  value?: number[];
  defaultValue?: number[];
  minValue?: number;
  maxValue?: number;
  step?: number;
  formatOptions?: Intl.NumberFormatOptions;
  showValue?: boolean;
  disabled?: boolean;
  onChange?: (value: number[]) => void;
}

/**
 * Picks a number, or a range with two values, by dragging a square thumb along a track.
 * Arrow keys step, Page Up and Down take bigger steps, Home and End jump to the ends.
 */
export function Slider({
  label,
  value,
  defaultValue = [0],
  minValue = 0,
  maxValue = 100,
  step = 1,
  formatOptions,
  showValue = true,
  disabled = false,
  onChange,
}: SliderProps) {
  const [uncontrolled, setUncontrolled] = useState<number[]>(defaultValue);
  const current = value ?? uncontrolled;
  const range = current.length > 1;

  return (
    <RacSlider
      className="ads-field ads-slider"
      data-variant={range ? 'range' : 'single'}
      data-state={dataState({ disabled }, 'default')}
      value={current}
      onChange={(v) => {
        const next = Array.isArray(v) ? v : [v];
        if (value === undefined) setUncontrolled(next);
        onChange?.(next);
      }}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      {...(formatOptions ? { formatOptions } : {})}
      isDisabled={disabled}
    >
      <div className="ads-slider__header">
        <Label className="ads-field__label">{label}</Label>
        {showValue ? <SliderOutput className="ads-slider__output" /> : null}
      </div>
      <SliderTrack className="ads-slider__track">
        {({ state }) => {
          const start = range ? state.getThumbPercent(0) : 0;
          const end = state.getThumbPercent(range ? 1 : 0);
          return (
            <>
              <div className="ads-slider__rail" />
              {/* Filled part of the track, from the start (or first thumb) to the last thumb. */}
              <div className="ads-slider__fill" style={{ insetInlineStart: `${start * 100}%`, width: `${(end - start) * 100}%` }} />
              {current.map((_, i) => (
                <SliderThumb key={i} index={i} className="ads-slider__thumb" />
              ))}
            </>
          );
        }}
      </SliderTrack>
    </RacSlider>
  );
}
