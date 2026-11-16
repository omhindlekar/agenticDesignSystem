import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './page-shell.meta.json';
import { Section } from '../section/section';
import { Heading } from '../heading/heading';
import { Input } from '../input/input';
import { Stack } from '../stack/stack';

/** Do and don't examples for the PageShell usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Give every screen a frame: a page title, titled sections and a background. PageShell provides the frame.',
        example: (
          <Stack gap="lg">
            <Heading level={2} appearance="h2">Account settings</Heading>
            <Section variant="surface" title="Profile" headingLevel={3}>
              <Input label="Full name" />
            </Section>
          </Stack>
        ),
      },
      dont: {
        caption: "Don't ship a bare stack of fields with no title, structure or background.",
        antiPattern: 'Screens with a bare stack of fields and no page frame',
        example: (
          <Stack>
            <Input label="Full name" />
            <Input label="Email address" type="email" />
          </Stack>
        ),
      },
    },
  ],
  textOnly: {
    'Two main landmarks on one page': 'Landmarks are invisible on screen; screen reader users find two places called main.',
  },
};

const meta = {
  title: 'Usage/PageShell',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
