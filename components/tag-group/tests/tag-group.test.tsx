// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagGroup } from '../tag-group';

afterEach(cleanup);
const tags = [
  { id: 'react', label: 'React' },
  { id: 'tokens', label: 'Tokens' },
];

describe('TagGroup', () => {
  it('NFR-9: a named group of tags', () => {
    render(<TagGroup label="Topics" tags={tags} />);
    expect(screen.getByRole('grid', { name: 'Topics' })).toBeTruthy();
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });
  it('NFR-9: removable tags have named remove buttons and Delete removes the focused tag', async () => {
    const onRemove = vi.fn();
    render(<TagGroup label="Topics" tags={tags} onRemove={onRemove} />);
    expect(screen.getByRole('button', { name: 'Remove React' })).toBeTruthy();
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{Delete}');
    expect(onRemove).toHaveBeenLastCalledWith(['react']);
  });
  it('NFR-9: selectable tags report selection', async () => {
    const onSelectionChange = vi.fn();
    render(<TagGroup label="Topics" tags={tags} selectionMode="multiple" onSelectionChange={onSelectionChange} />);
    await userEvent.setup().click(screen.getByText('Tokens'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['tokens']);
  });
});
