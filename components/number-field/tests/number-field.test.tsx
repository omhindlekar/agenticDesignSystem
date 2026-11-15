// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberField } from '../number-field';

afterEach(cleanup);

describe('NumberField', () => {
  it('NFR-9: is a text box named by its label, with named step buttons', () => {
    render(<NumberField label="Seats" defaultValue={2} />);
    expect(screen.getByRole('textbox', { name: 'Seats' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Increase/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Decrease/ })).toBeTruthy();
  });

  it('NFR-9: Arrow Up and Down step the value within min and max', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Seats" defaultValue={9} minValue={1} maxValue={10} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('textbox'));
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(10);
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('NFR-9: the decrement button steps down', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Seats" defaultValue={3} onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Decrease/ }));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('FR-3: exposes variant and state on its root', () => {
    const { container } = render(<NumberField label="A" defaultValue={1} errorMessage="Too many" />);
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('error');
    expect(container.firstElementChild?.getAttribute('data-state')).toBe('filled error');
  });
});
