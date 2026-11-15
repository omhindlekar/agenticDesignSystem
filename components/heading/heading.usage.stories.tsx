import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './heading.meta.json';
import { Heading } from './heading';

/** Do and don't examples for the Heading usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Keep the outline in order and change the look with appearance.',
        example: (
          <div>
            <Heading level={2}>Settings</Heading>
            <Heading level={3} appearance="h4">
              Notifications
            </Heading>
          </div>
        ),
      },
      dont: {
        caption: "Don't skip levels to get a smaller size.",
        antiPattern: 'Skipping levels to get a size; use appearance instead',
        example: (
          <div>
            <Heading level={2}>Settings</Heading>
            <Heading level={4}>Notifications</Heading>
          </div>
        ),
      },
    },
  ],
};

const meta = {
  title: 'Usage/Heading',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
