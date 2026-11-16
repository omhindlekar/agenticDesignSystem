import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './section.meta.json';
import { Section } from './section';
import { Button } from '../button/button';
import { Stack } from '../stack/stack';
import { Text } from '../text/text';

/** Do and don't examples for the Section usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Put destructive actions in a danger section, last on the page.',
        example: (
          <Section variant="danger" title="Delete account" description="This permanently deletes your account. It cannot be undone.">
            <div>
              <Button label="Delete account" variant="contained" tone="danger" />
            </div>
          </Section>
        ),
      },
      dont: {
        caption: "Don't place a destructive action among everyday settings.",
        antiPattern: 'Destructive actions outside a danger section',
        example: (
          <Section variant="surface" title="Notifications">
            <Stack direction="horizontal" gap="sm" wrap>
              <Text>Email me a weekly summary</Text>
              <Button label="Delete account" variant="contained" tone="danger" />
            </Stack>
          </Section>
        ),
      },
    },
  ],
  textOnly: {
    'Skipping heading levels, such as an h3 section directly under the h1':
      'Heading levels are invisible on screen; screen reader users hear the gap in the outline.',
    'A Section with only a heading and no content': 'An empty example would show nothing useful.',
  },
};

const meta = {
  title: 'Usage/Section',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
