import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignInScreen, ForgotPasswordScreen, CheckEmailScreen } from './northwind-signin';

const meta: Meta = {
  title: 'Examples/Northwind Business sign-in',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

export const SignIn: Story = { name: '1. Sign in', render: () => <SignInScreen /> };
export const SignInFailed: Story = { name: '1b. Sign in, wrong details', render: () => <SignInScreen failed /> };
export const ForgotPassword: Story = { name: '2. Forgot password', render: () => <ForgotPasswordScreen /> };
export const ForgotPasswordInvalid: Story = {
  name: '2b. Forgot password, invalid email',
  render: () => <ForgotPasswordScreen invalidEmail />,
};
export const CheckEmail: Story = { name: '3. Check your email', render: () => <CheckEmailScreen /> };
