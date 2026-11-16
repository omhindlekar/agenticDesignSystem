import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaymentSentScreen } from './payment-sent';

const meta: Meta = {
  title: 'Examples/Northwind Business payment sent',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

export const PaymentSent: Story = { name: '1. Payment sent', render: () => <PaymentSentScreen /> };
export const ConfirmCancel: Story = { name: '2. Cancel, confirmation', render: () => <PaymentSentScreen confirmingCancel /> };
export const Cancelled: Story = { name: '3. Payment cancelled', render: () => <PaymentSentScreen cancelled /> };
export const WindowClosed: Story = { name: '4. Cancel window closed', render: () => <PaymentSentScreen cancelWindowClosed /> };
