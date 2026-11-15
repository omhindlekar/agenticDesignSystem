import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './avatar.meta.json';
import { Avatar } from './avatar';
import { Text } from '../text/text';

/** Do and don't examples for the Avatar usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Derive the initials from the name shown beside the avatar.',
        example: (
          <>
            <Avatar name="Grace Hopper" />
            <Text as="span">Grace Hopper</Text>
          </>
        ),
      },
      dont: {
        caption: "Don't show initials that disagree with the visible name.",
        antiPattern: 'Initials that do not match the name shown beside it',
        example: (
          <>
            <Avatar name="Admiral" />
            <Text as="span">Grace Hopper</Text>
          </>
        ),
      },
    },
  ],
};

const meta = {
  title: 'Usage/Avatar',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
