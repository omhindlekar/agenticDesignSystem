// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useRef, useState } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../modal';

afterEach(cleanup);

describe('Modal', () => {
  it('NFR-9: open modal is a dialog, aria-modal, labelled by its title', () => {
    render(<Modal isOpen onClose={() => {}} title="Delete file">Body</Modal>);
    const dialog = screen.getByRole('dialog', { name: 'Delete file' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('NFR-9: danger variant uses role alertdialog', () => {
    render(<Modal isOpen onClose={() => {}} title="Delete" variant="danger">Body</Modal>);
    expect(screen.getByRole('alertdialog', { name: 'Delete' })).toBeTruthy();
  });

  it('NFR-9: closed modal is not exposed', () => {
    render(<Modal isOpen={false} onClose={() => {}} title="Hidden">Body</Modal>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('NFR-9: Escape calls onClose', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="T">Body</Modal>);
    await userEvent.setup().keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('NFR-9: focus moves into the dialog and Tab is trapped inside it', async () => {
    render(
      <>
        <button>Outside</button>
        <Modal isOpen onClose={() => {}} title="T" footer={<button>Confirm</button>}>
          <input aria-label="Name" />
        </Modal>
      </>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
    const user = userEvent.setup();
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('NFR-9: initialFocusRef receives focus on open', () => {
    function Harness() {
      const ref = useRef<HTMLInputElement>(null);
      return (
        <Modal isOpen onClose={() => {}} title="T" initialFocusRef={ref}>
          <button>First</button>
          <input aria-label="Target" ref={ref} />
        </Modal>
      );
    }
    render(<Harness />);
    expect(document.activeElement).toBe(screen.getByLabelText('Target'));
  });

  it('NFR-9: focus returns to the trigger when the modal closes', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="T">Body</Modal>
        </>
      );
    }
    render(<Harness />);
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(document.activeElement).toBe(trigger);
  });

  it('overlay click closes only when closeOnOverlayClick is not false', async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Modal isOpen onClose={onClose} title="T">Body</Modal>);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('ads-modal-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<Modal isOpen onClose={onClose} title="T" closeOnOverlayClick={false}>Body</Modal>);
    await user.click(screen.getByTestId('ads-modal-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('NFR-9: loading sets aria-busy on the dialog', () => {
    render(<Modal isOpen onClose={() => {}} title="T" loading>Body</Modal>);
    expect(screen.getByRole('dialog').getAttribute('aria-busy')).toBe('true');
  });

  it('NFR-9: the close control is an icon button named Close, with no visible text', () => {
    render(<Modal isOpen onClose={() => {}} title="T">Body</Modal>);
    const close = screen.getByRole('button', { name: 'Close' });
    expect(close.classList.contains('ads-icon-button')).toBe(true);
    expect(close.textContent).toBe('');
    expect(close.querySelector('svg')).not.toBeNull();
  });
});
