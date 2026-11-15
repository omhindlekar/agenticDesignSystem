// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagGroup } from '../tag-group';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('TagGroup keyboard', () => {
  const tags = [
    { id: 'react', label: 'React' },
    { id: 'tokens', label: 'Tokens' },
    { id: 'a11y', label: 'Accessibility' },
  ];
  it('NFR-9: APG grid (tags): Arrow Right, Arrow Left — move between tags', async () => {
    render(<TagGroup label="Topics" tags={tags} selectionMode="single" />);
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement?.textContent).toContain('React');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toContain('Tokens');
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement?.textContent).toContain('React');
  });
  it('NFR-9: APG grid (tags): Delete, Backspace — remove the focused tag', async () => {
    const onRemove = vi.fn();
    render(<TagGroup label="Topics" tags={tags} onRemove={onRemove} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{Delete}');
    expect(onRemove).toHaveBeenLastCalledWith(['react']);
    await user.keyboard('{ArrowRight}{Backspace}');
    expect(onRemove).toHaveBeenLastCalledWith(['tokens']);
  });
  it('NFR-9: APG grid (tags): Space — selects the focused tag', async () => {
    const onSelectionChange = vi.fn();
    render(<TagGroup label="Topics" tags={tags} selectionMode="multiple" onSelectionChange={onSelectionChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard(' ');
    expect(onSelectionChange).toHaveBeenLastCalledWith(['react']);
  });
});
