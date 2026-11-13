import { Button, Card, Checkbox, Input } from '@ads/components';

export default function Screen() {
  return (
    <Card as="section" aria-label="Sign in" padding="lg">
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-component-padding-md)' }}
        onSubmit={(event) => event.preventDefault()}
      >
        <h1
          style={{
            margin: 0,
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-body)',
            fontWeight: 'var(--font-weight-label)',
          }}
        >
          Sign in
        </h1>
        <Input label="Email" type="email" name="email" required />
        <Input label="Password" type="password" name="password" required />
        <Checkbox label="Remember me" name="remember" />
        <Button label="Sign in" variant="primary" type="submit" />
      </form>
    </Card>
  );
}
