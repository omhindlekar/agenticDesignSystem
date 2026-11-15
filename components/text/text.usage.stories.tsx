import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './text.meta.json';
import { Text } from './text';
import { Heading } from '../heading/heading';

/** Do and don't examples for the Text usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Use Heading for headings so they are in the outline.',
        example: (
          <div>
            <Heading level={2}>Release notes</Heading>
            <Text>Version 2 renames tokens.</Text>
          </div>
        ),
      },
      dont: {
        caption: "Don't make a paragraph look like a heading.",
        antiPattern: 'Using a heading role on a paragraph to make it look like a heading',
        example: (
          <div>
            <Text variant="h2">Release notes</Text>
            <Text>Version 2 renames tokens.</Text>
          </div>
        ),
      },
    },
  ],
};

const meta = {
  title: 'Usage/Text',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
