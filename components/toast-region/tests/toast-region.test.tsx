// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastRegion, toast, toastQueue } from '../toast-region';

afterEach(() => {
  act(() => toastQueue.clear());
  cleanup();
});

describe('ToastRegion and toast()', () => {
  it('NFR-9: toast() shows a toast in a labelled region', () => {
    render(<ToastRegion />);
    act(() => {
      toast({ title: 'Project saved', description: 'All changes are live' });
    });
    expect(screen.getByRole('region', { name: /notification/i })).toBeTruthy();
    expect(screen.getByText('Project saved')).toBeTruthy();
  });
  it('NFR-9: the close button removes it', async () => {
    render(<ToastRegion />);
    act(() => {
      toast({ title: 'Saved' });
    });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Saved')).toBeNull();
  });
  it('FR-1: an action runs and closes the toast; toasts with an action do not time out (WCAG 2.2.1)', async () => {
    const onAction = vi.fn();
    render(<ToastRegion />);
    act(() => {
      toast({ title: 'Deleted', action: { label: 'Undo', onAction } });
    });
    expect(toastQueue.visibleToasts[0]?.timeout).toBeUndefined();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction).toHaveBeenCalled();
    expect(screen.queryByText('Deleted')).toBeNull();
  });
  it('FR-1: toasts without an action time out after 6 seconds by default', () => {
    render(<ToastRegion />);
    act(() => {
      toast({ title: 'Saved' });
    });
    expect(toastQueue.visibleToasts[0]?.timeout).toBe(6000);
  });
});
