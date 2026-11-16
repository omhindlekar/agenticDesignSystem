import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './stack.meta.json';
import { Stack } from './stack';
import { Input } from '../input/input';

/** Do and don't examples for the Stack usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'One gap between siblings at the same level keeps the rhythm even.',
        example: (
          <Stack gap="md">
            <Input label="First name" />
            <Input label="Last name" />
            <Input label="Email address" type="email" />
          </Stack>
        ),
      },
      dont: {
        caption: "Don't mix gap sizes between siblings.",
        antiPattern: 'Mixing gap sizes between siblings at the same level',
        example: (
          <Stack gap="xs">
            <Input label="First name" />
            <Stack gap="section">
              <Input label="Last name" />
              <Input label="Email address" type="email" />
            </Stack>
          </Stack>
        ),
      },
    },
  ],
  textOnly: {
    'Inline margins or padding to space elements instead of a Stack gap':
      'It can look identical on screen; the problem is in the code, where the spacing escapes the token scale.',
  },
};

const meta = {
  title: 'Usage/Stack',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
