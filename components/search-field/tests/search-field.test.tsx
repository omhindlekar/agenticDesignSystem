// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from '../search-field';

afterEach(cleanup);

describe('SearchField', () => {
  it('NFR-9: is a searchbox named by its label, even when the label is visually hidden', () => {
    render(<SearchField label="Search projects" hideLabel />);
    expect(screen.getByRole('searchbox', { name: 'Search projects' })).toBeTruthy();
  });

  it('NFR-9: Escape clears the value and calls onClear', async () => {
    const onClear = vi.fn();
    render(<SearchField label="Search" defaultValue="tokens" onClear={onClear} />);
    const box = screen.getByRole('searchbox') as HTMLInputElement;
    const user = userEvent.setup();
    await user.click(box);
    await user.keyboard('{Escape}');
    expect(box.value).toBe('');
    expect(onClear).toHaveBeenCalled();
  });

  it('NFR-9: the Clear button is named and appears only with a value', () => {
    const { container, rerender } = render(<SearchField label="Search" value="" onChange={() => {}} />);
    expect(container.querySelector('.ads-search-field')?.getAttribute('data-state')).toBe('default');
    rerender(<SearchField label="Search" value="abc" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeTruthy();
  });

  it('NFR-9: Enter calls onSubmit with the value', async () => {
    const onSubmit = vi.fn();
    render(<SearchField label="Search" onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('searchbox'), 'grid{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('grid');
  });
});
