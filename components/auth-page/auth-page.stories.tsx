import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuthPage } from './auth-page';
import { Button } from '../button/button';
import { Checkbox } from '../checkbox/checkbox';
import { Icon } from '../icon/icon';
import { Input } from '../input/input';
import { Link } from '../link/link';
import { Stack } from '../stack/stack';
import { Text } from '../text/text';
import { Heading } from '../heading/heading';

const fields = (
  <>
    <Input label="Email address" type="email" name="email" required placeholder="name@company.com" />
    <Input label="Password" type="password" name="password" required />
  </>
);
const legal = (
  <Stack direction="horizontal" gap="md" wrap>
    <Link href="#privacy">Privacy notice</Link>
    <Link href="#terms">Terms of use</Link>
    <Link href="#accessibility">Accessibility</Link>
  </Stack>
);
const aside = (
  <Stack gap="lg">
    <Heading level={2}>Your account, kept secure</Heading>
    <Stack direction="horizontal" gap="md" align="start">
      <Icon name="lock" />
      <Text variant="body2">We never ask for your password by email, text or phone.</Text>
    </Stack>
    <Stack direction="horizontal" gap="md" align="start">
      <Icon name="person" />
      <Text variant="body2">On a shared computer, sign out when you finish.</Text>
    </Stack>
  </Stack>
);

const meta = {
  title: 'Templates/AuthPage',
  component: AuthPage,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Sign in',
    description: 'Use the email address registered to your account.',
    brand: (
      <Text variant="h4" as="span" tone="heading">
        Agentic DS
      </Text>
    ),
    children: fields,
    secondaryActions: (
      <Link href="#forgot" variant="standalone">
        Forgot your password?
      </Link>
    ),
    primaryAction: <Button label="Sign in" variant="contained" type="submit" size="lg" />,
    alternative: <Button label="Sign in with single sign-on" variant="outlined" size="lg" />,
    footer: legal,
  },
} satisfies Meta<typeof AuthPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Centred: Story = { args: { variant: 'centred' }, parameters: { ads: { variant: 'centred' } } };
export const Split: Story = {
  args: { variant: 'split', aside, asideLabel: 'Keeping your account safe' },
  parameters: { ads: { variant: 'split' } },
};
export const ForgotPassword: Story = {
  args: {
    variant: 'centred',
    title: 'Reset your password',
    description: 'Enter your email address. If it’s registered with us, we’ll email you a link to set a new password.',
    children: <Input label="Email address" type="email" name="email" required />,
    secondaryActions: undefined,
    primaryAction: <Button label="Send reset link" variant="contained" type="submit" size="lg" />,
    alternative: undefined,
  },
  parameters: { ads: { variant: 'centred' } },
};
export const WithRememberMe: Story = {
  args: {
    children: (
      <>
        {fields}
        <Checkbox label="Keep me signed in for 30 days" helperText="Don’t tick this on a shared computer." />
      </>
    ),
  },
  parameters: { ads: { variant: 'centred' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
