// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AvatarGroup } from '../avatar-group';

afterEach(cleanup);

describe('AvatarGroup', () => {
  it('NFR-9: shows up to max avatars and a named overflow count', () => {
    render(<AvatarGroup label="Project members" people={[{ name: 'A B' }, { name: 'C D' }, { name: 'E F' }, { name: 'G H' }]} max={2} />);
    expect(screen.getByRole('group', { name: 'Project members' })).toBeTruthy();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByRole('img', { name: '2 more' }).textContent).toBe('+2');
  });
});
