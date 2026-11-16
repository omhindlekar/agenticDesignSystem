/**
 * Northwind Business sign-in experience: an example built only from Agentic DS components
 * and tokens, for review as a reference screen set (sign-in, forgot password, check your email).
 *
 * UX decisions:
 * - Errors never reveal whether an account exists: sign-in shows one combined message, and the
 *   reset flow always says "if it's registered".
 * - "Keep me signed in" is off by default, with a warning for shared office computers.
 * - Company SSO is the secondary action, below the primary "Sign in".
 * - Trust cues are factual and calm: how to recognise a genuine request, and signing out on
 *   shared computers, plus legal links on every screen.
 */
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Banner, Button, Checkbox, Divider, Heading, Icon, Input, Link, Text } from '../../components/index';
import type { IconName } from '../../components/index';
import './auth-layout.css';

const PRODUCT = 'Northwind Business';

const TRUST_POINTS: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: 'lock',
    title: 'Your connection is encrypted',
    body: 'Check the address bar shows our web address before you enter your details.',
  },
  {
    icon: 'mail',
    title: 'We never ask for your password',
    body: 'Not by email, text or phone. If someone asks, it isn’t us. Report it to our security team.',
  },
  {
    icon: 'person',
    title: 'On a shared computer?',
    body: 'Leave “Keep me signed in” unticked and sign out when you finish.',
  },
];

function Brand() {
  return (
    <div className="nw-auth__brand">
      <span className="nw-auth__mark" aria-hidden="true">
        N
      </span>
      <Text variant="h4" as="span" tone="heading">
        {PRODUCT}
      </Text>
    </div>
  );
}

function LegalFooter() {
  return (
    <footer className="nw-auth__footer">
      <Text variant="caption" tone="secondary">
        © 2026 {PRODUCT}
      </Text>
      <nav aria-label="Legal">
        <ul className="nw-auth__legal">
          <li>
            <Link href="#privacy">Privacy notice</Link>
          </li>
          <li>
            <Link href="#terms">Terms of use</Link>
          </li>
          <li>
            <Link href="#security">Security centre</Link>
          </li>
          <li>
            <Link href="#accessibility">Accessibility</Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

function TrustPanel() {
  return (
    <aside className="nw-auth__aside" aria-label="Keeping your account safe">
      <div className="nw-auth__aside-inner">
        <div className="nw-auth__intro">
          <Heading level={2} appearance="h2">
            Banking for your business, kept secure
          </Heading>
          <Text variant="body1">Here’s how we protect your account, and how you can help.</Text>
        </div>
        <ul className="nw-auth__points">
          {TRUST_POINTS.map((p) => (
            <li key={p.title} className="nw-auth__point">
              <span className="nw-auth__icon">
                <Icon name={p.icon} size="md" />
              </span>
              <span className="nw-auth__point-text">
                <Text variant="subtitle" as="strong" tone="heading">
                  {p.title}
                </Text>
                <Text variant="body2">{p.body}</Text>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="nw-auth">
      <div className="nw-auth__panels">
        <main className="nw-auth__main">
          <Brand />
          <div className="nw-auth__content">{children}</div>
        </main>
        <TrustPanel />
      </div>
      <LegalFooter />
    </div>
  );
}

function Intro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="nw-auth__intro">
      <Heading level={1} appearance="h1">
        {title}
      </Heading>
      <Text variant="body1" tone="secondary">
        {children}
      </Text>
    </div>
  );
}

const prevent = (e: FormEvent) => e.preventDefault();

/** 1. Sign in. `failed` shows the state after a wrong email or password. */
export function SignInScreen({ failed = false }: { failed?: boolean }) {
  const [error, setError] = useState(failed);
  return (
    <AuthLayout>
      <form
        className="nw-auth__stack"
        noValidate
        aria-label="Sign in"
        onSubmit={(e) => {
          prevent(e);
          setError(true);
        }}
      >
        <Intro title="Sign in">Use the email address registered to your business account.</Intro>
        {error && (
          <Banner tone="danger" title="We couldn’t sign you in">
            The email address or password is incorrect. Check both and try again, or reset your password.
          </Banner>
        )}
        <Input label="Email address" type="email" name="email" required placeholder="name@yourbusiness.com" />
        <Input label="Password" type="password" name="password" required />
        <div className="nw-auth__end">
          <Link href="#forgot-password" variant="standalone">
            Forgot your password?
          </Link>
        </div>
        <Checkbox
          label="Keep me signed in for 30 days"
          name="remember"
          helperText="Don’t tick this on a shared or public computer."
        />
        <Button label="Sign in" variant="contained" type="submit" size="lg" />
        <div className="nw-auth__or">
          <Divider />
          <Text variant="caption" as="span" tone="secondary">
            or
          </Text>
          <Divider />
        </div>
        <Button label="Sign in with company single sign-on" variant="outlined" size="lg" />
        <Text variant="body2" tone="secondary">
          New to {PRODUCT}? <Link href="#open-account">Open a business account</Link>
        </Text>
      </form>
    </AuthLayout>
  );
}

/** 2. Forgot password: request a reset link. `invalidEmail` shows the format error. */
export function ForgotPasswordScreen({ invalidEmail = false }: { invalidEmail?: boolean }) {
  return (
    <AuthLayout>
      <form className="nw-auth__stack" noValidate aria-label="Reset your password" onSubmit={prevent}>
        <Link href="#sign-in" variant="standalone">
          <span className="nw-auth__back">
            <Icon name="arrow_back" size="sm" />
            Back to sign in
          </span>
        </Link>
        <Intro title="Reset your password">
          Enter the email address for your business account. If it’s registered with us, we’ll email you a link to
          set a new password.
        </Intro>
        <Input
          label="Email address"
          type="email"
          name="email"
          required
          placeholder="name@yourbusiness.com"
          {...(invalidEmail
            ? { variant: 'error' as const, errorMessage: 'Enter an email address in the format name@yourbusiness.com' }
            : {})}
        />
        <Button label="Send reset link" variant="contained" type="submit" size="lg" />
        <Banner tone="info" title="Use company single sign-on?">
          Your password is managed by your company. Contact your IT team to reset it.
        </Banner>
      </form>
    </AuthLayout>
  );
}

/** 3. Check your email. The address is the one the person typed, so nothing is revealed. */
export function CheckEmailScreen({ email = 'name@yourbusiness.com' }: { email?: string }) {
  return (
    <AuthLayout>
      <div className="nw-auth__stack">
        <span className="nw-auth__badge">
          <Icon name="mail" size="lg" />
        </span>
        <Intro title="Check your email">
          If <strong>{email}</strong> is registered with us, we’ve sent a link to reset your password. The link works for 30 minutes.
        </Intro>
        <Heading level={2} appearance="h4">
          Didn’t get the email?
        </Heading>
        <ul className="nw-auth__tips">
          <li>
            <Text variant="body2">Check your spam or junk folder.</Text>
          </li>
          <li>
            <Text variant="body2">Make sure you used the email address registered to your business account.</Text>
          </li>
          <li>
            <Text variant="body2">Wait a few minutes. Emails can take a moment to arrive.</Text>
          </li>
        </ul>
        <Button label="Send the link again" variant="outlined" size="lg" />
        <Link href="#sign-in" variant="standalone">
          <span className="nw-auth__back">
            <Icon name="arrow_back" size="sm" />
            Back to sign in
          </span>
        </Link>
      </div>
    </AuthLayout>
  );
}
