import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './container.meta.json';
import { Container } from './container';
import { Input } from '../input/input';
import { Stack } from '../stack/stack';

/** Do and don't examples for the Container usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Keep forms in a narrow column, so fields stay a readable width.',
        example: (
          <Container size="sm">
            <Stack>
              <Input label="Email address" type="email" />
              <Input label="Password" type="password" />
            </Stack>
          </Container>
        ),
      },
      dont: {
        caption: "Don't stretch fields across a wide screen.",
        antiPattern: 'Full-width form fields on a wide screen',
        example: (
          <Stack>
            <Input label="Email address" type="email" />
            <Input label="Password" type="password" />
          </Stack>
        ),
      },
    },
  ],
  textOnly: {
    'Nesting one Container in another': 'The inner one only adds a second side margin, which is hard to see in a small example.',
  },
};

const meta = {
  title: 'Usage/Container',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
