import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './error-page.meta.json';
import { Stack } from '../stack/stack';
import { Text } from '../text/text';

/** Do and don't examples for the ErrorPage usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Say what happened in plain words, and what to do next.',
        example: (
          <Stack gap="sm">
            <Text variant="h4" tone="heading">Something went wrong on our side</Text>
            <Text tone="secondary">It isn’t anything you did. Try again in a few minutes.</Text>
          </Stack>
        ),
      },
      dont: {
        caption: "Don't show technical detail people can't act on.",
        antiPattern: 'Technical jargon or stack traces',
        example: (
          <Stack gap="sm">
            <Text variant="h4" tone="heading">Unhandled exception</Text>
            <Text tone="secondary">TypeError: cannot read properties of undefined (reading 'id')</Text>
          </Stack>
        ),
      },
    },
  ],
  textOnly: {
    'An error page with no way back': 'The fault is an absence; ErrorPage requires a primary action.',
  },
};

const meta = {
  title: 'Usage/ErrorPage',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
