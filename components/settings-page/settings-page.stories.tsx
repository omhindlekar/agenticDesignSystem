import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsPage } from './settings-page';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Section } from '../section/section';
import { SideNav } from '../side-nav/side-nav';
import { Switch } from '../switch/switch';

const sections = (
  <>
    <Section title="Profile" variant="surface" description="This is how other people in your business see you.">
      <Input label="Full name" defaultValue="Alex Morgan" />
      <Input label="Email address" type="email" defaultValue="alex@company.com" />
      <div>
        <Button label="Save profile" variant="contained" />
      </div>
    </Section>
    <Section title="Notifications" variant="surface" description="Changes take effect straight away.">
      <Switch label="Email me a weekly summary" defaultChecked />
      <Switch label="Tell me when a payment arrives" defaultChecked />
      <Switch label="Product news and offers" />
    </Section>
  </>
);
const danger = (
  <Section
    title="Delete account"
    variant="danger"
    description="This permanently deletes your account and its data. You can’t undo it."
  >
    <div>
      <Button label="Delete account" variant="outlined" tone="danger" />
    </div>
  </Section>
);

const meta = {
  title: 'Templates/SettingsPage',
  component: SettingsPage,
  parameters: { layout: 'fullscreen' },
  args: { title: 'Settings', description: 'Manage your profile and notifications.', children: sections, dangerZone: danger },
} satisfies Meta<typeof SettingsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { variant: 'single' }, parameters: { ads: { variant: 'single' } } };
export const WithNav: Story = {
  args: {
    variant: 'with-nav',
    nav: (
      <SideNav
        label="Settings"
        currentId="profile"
        items={[
          { id: 'profile', label: 'Profile', href: '#profile', icon: 'person' },
          { id: 'notifications', label: 'Notifications', href: '#notifications', icon: 'mail' },
          { id: 'security', label: 'Security', href: '#security', icon: 'lock' },
        ]}
      />
    ),
  },
  parameters: { ads: { variant: 'with-nav' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
