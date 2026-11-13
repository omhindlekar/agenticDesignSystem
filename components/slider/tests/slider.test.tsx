// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from '../slider';

afterEach(cleanup);

describe('Slider', () => {
  it('NFR-9: each thumb is a slider named by the label, with its value range', () => {
    render(<Slider label="Volume" defaultValue={[40]} />);
    const thumb = screen.getByRole('slider', { name: 'Volume' }) as HTMLInputElement;
    expect(thumb.getAttribute('min') ?? thumb.min).toBe('0');
    expect(thumb.value).toBe('40');
  });

  it('NFR-9: arrow keys step, Home and End jump to the ends', async () => {
    const onChange = vi.fn();
    render(<Slider label="Volume" defaultValue={[40]} step={5} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith([45]);
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith([100]);
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith([0]);
  });

  it('FR-1: two values make a range with two thumbs', () => {
    const { container } = render(<Slider label="Price" defaultValue={[20, 80]} />);
    expect(screen.getAllByRole('slider')).toHaveLength(2);
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('range');
  });

  it('FR-1: shows the formatted value', () => {
    const { container } = render(<Slider label="Discount" defaultValue={[0.25]} formatOptions={{ style: 'percent' }} maxValue={1} step={0.05} />);
    expect(container.querySelector('.ads-slider__output')?.textContent).toBe('25%');
  });
});
