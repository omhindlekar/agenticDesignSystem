// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from '../segmented-control';

afterEach(cleanup);
const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

describe('SegmentedControl', () => {
  it('NFR-9: single selection is a radio group named by its label', () => {
    render(<SegmentedControl label="View" options={options} defaultValue={['week']} />);
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Week' }).getAttribute('aria-checked')).toBe('true');
  });

  it('NFR-9: clicking selects one segment and keeps one selected', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="View" options={options} defaultValue={['day']} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Month' }));
    expect(onChange).toHaveBeenLastCalledWith(['month']);
    await user.click(screen.getByRole('radio', { name: 'Month' }));
    expect(screen.getByRole('radio', { name: 'Month' }).getAttribute('aria-checked')).toBe('true');
  });

  it('NFR-9: arrow keys move focus between segments', async () => {
    render(<SegmentedControl label="View" options={options} defaultValue={['day']} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Week' }));
  });

  it('NFR-9: multiple selection uses toggle buttons with aria-pressed', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Format" selectionMode="multiple" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Day' }));
    await user.click(screen.getByRole('button', { name: 'Week' }));
    expect(onChange).toHaveBeenLastCalledWith(['day', 'week']);
    expect(screen.getByRole('button', { name: 'Week' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('FR-3: exposes the selection mode as its variant', () => {
    const { container } = render(<SegmentedControl label="A" selectionMode="multiple" options={options} />);
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('multiple');
  });
});
