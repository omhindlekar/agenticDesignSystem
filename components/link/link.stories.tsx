import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './link';

const meta = { title: 'Components/Link', component: Link, args: { href: '#', children: 'Read the release notes' } } satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  args: { variant: 'inline' },
  render: (args) => (
    <p style={{ fontFamily: 'var(--type-body1-family)', fontSize: 'var(--type-body1-size)', margin: 0 }}>
      Version 2 changes the token names. <Link {...args} /> before upgrading.
    </p>
  ),
  parameters: { ads: { variant: 'inline' } },
};
export const Standalone: Story = { args: { variant: 'standalone' }, parameters: { ads: { variant: 'standalone' } } };
export const External: Story = { args: { variant: 'standalone', external: true, children: 'Status page', href: 'https://example.com' }, parameters: { ads: { variant: 'standalone' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
export const Hover: Story = { parameters: { ads: { state: 'hover' }, pseudo: { hover: true } } };
export const Focus: Story = { parameters: { ads: { state: 'focus' }, pseudo: { focusVisible: true } } };
