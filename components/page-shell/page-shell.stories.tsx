import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageShell } from './page-shell';
import { AppHeader } from '../app-header/app-header';
import { Container } from '../container/container';
import { Heading } from '../heading/heading';
import { Section } from '../section/section';
import { Stack } from '../stack/stack';
import { Link } from '../link/link';
import { Text } from '../text/text';

const content = (
  <Container size="md">
    <Stack gap="lg">
      <Heading level={1}>Account settings</Heading>
      <Section title="Profile" variant="surface" description="This is how other people in your business see you.">
        <Text>Section content</Text>
      </Section>
    </Stack>
  </Container>
);
const meta = {
  title: 'Layout/PageShell',
  component: PageShell,
  parameters: { layout: 'fullscreen' },
  args: {
    header: <AppHeader title="Agentic DS" nav={[{ label: 'Home', href: '#home', current: true }]} />,
    footer: <Link href="#privacy">Privacy notice</Link>,
    children: content,
  },
} satisfies Meta<typeof PageShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = { args: { background: 'page' }, parameters: { ads: { variant: 'page' } } };
export const Sunken: Story = { args: { background: 'sunken' }, parameters: { ads: { variant: 'sunken' } } };
export const Default: Story = { parameters: { ads: { state: 'default' } } };
