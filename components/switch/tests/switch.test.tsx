// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../switch';

afterEach(cleanup);

describe('Switch', () => {
  it('NFR-9: is a switch named by its label', () => {
    render(<Switch label="Email alerts" />);
    expect(screen.getByRole('switch', { name: 'Email alerts' })).toBeTruthy();
  });

  it('NFR-9: Space toggles it and onChange receives the new state', async () => {
    const onChange = vi.fn();
    render(<Switch label="Email alerts" onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true);
  });

  it('NFR-9: disabled cannot be toggled', async () => {
    const onChange = vi.fn();
    render(<Switch label="Email alerts" disabled onChange={onChange} />);
    await userEvent.setup().click(screen.getByText('Email alerts'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('FR-3: exposes variant and state on its root', () => {
    const { container } = render(<Switch label="A" defaultChecked />);
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('default');
    expect(container.firstElementChild?.getAttribute('data-state')).toBe('checked');
  });
});
