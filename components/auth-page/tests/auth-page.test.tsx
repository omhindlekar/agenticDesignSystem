// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { AuthPage } from '../auth-page';

afterEach(cleanup);
const before = (a: Node, b: Node) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

const page = (props: Partial<Parameters<typeof AuthPage>[0]> = {}) =>
  render(
    <AuthPage
      title="Sign in"
      description="Use the email address registered to your account."
      brand={<span>Acme</span>}
      primaryAction={<button type="submit">Sign in</button>}
      secondaryActions={<a href="#forgot">Forgot your password?</a>}
      alternative={<button type="button">Sign in with single sign-on</button>}
      footer={<a href="#privacy">Privacy notice</a>}
      {...props}
    >
      <label>Email address<input type="email" /></label>
    </AuthPage>,
  );

describe('AuthPage', () => {
  it('NFR-9: one main landmark, an h1 title and a form named by it', () => {
    page();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeTruthy();
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  it('FR-3: slots render in order: title, fields, secondary actions, primary action, then the alternative', () => {
    page();
    const title = screen.getByRole('heading', { level: 1 });
    const field = screen.getByLabelText('Email address');
    const forgot = screen.getByRole('link', { name: 'Forgot your password?' });
    const primary = screen.getByRole('button', { name: 'Sign in' });
    const sso = screen.getByRole('button', { name: 'Sign in with single sign-on' });
    expect(before(title, field) && before(field, forgot) && before(forgot, primary) && before(primary, sso)).toBe(true);
    expect(within(screen.getByRole('form')).queryByRole('button', { name: /single sign-on/ })).toBeNull();
    expect(screen.getByText('or')).toBeTruthy();
  });

  it('FR-3: only the split variant shows the aside, as a named complementary landmark', () => {
    page({ aside: <p>Your connection is encrypted</p> });
    expect(screen.queryByRole('complementary')).toBeNull();
    cleanup();
    page({ variant: 'split', aside: <p>Your connection is encrypted</p>, asideLabel: 'Keeping your account safe' });
    expect(screen.getByRole('complementary', { name: 'Keeping your account safe' })).toBeTruthy();
  });

  it('FR-3: submitting calls onSubmit without reloading the page', async () => {
    const onSubmit = vi.fn();
    page({ onSubmit });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
