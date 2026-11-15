import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './badge.meta.json';
import { Badge } from './badge';
import { Text } from '../text/text';

/** Do and don't examples for the Badge usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Cap large counts; the full number is still read out.',
        example: <Badge variant="count" count={240} max={99} label="unread messages" tone="danger" />,
      },
      dont: {
        caption: "Don't show long counts that stretch the badge.",
        antiPattern: 'Counts above 99 shown in full',
        example: <Badge variant="count" count={240} max={999} label="unread messages" tone="danger" />,
      },
    },
    {
      do: {
        caption: 'Pair a dot with text that says what it means.',
        example: (
          <>
            <Badge variant="dot" label="Online" tone="success" />
            <Text as="span" variant="body2">
              Online
            </Text>
          </>
        ),
      },
      dont: {
        caption: "Don't rely on the colour of a dot alone.",
        antiPattern: 'A dot whose meaning is only its colour',
        example: (
          <>
            <Badge variant="dot" label="Online" tone="success" />
            <Badge variant="dot" label="Offline" tone="danger" />
          </>
        ),
      },
    },
  ],
};

const meta = {
  title: 'Usage/Badge',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
