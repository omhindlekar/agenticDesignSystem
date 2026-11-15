import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './tooltip.meta.json';
import { Tooltip } from './tooltip';
import { IconButton } from '../icon-button/icon-button';
import { Text } from '../text/text';

/** Do and don't examples for the Tooltip usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Put tooltips on focusable controls.',
        example: (
          <Tooltip content="Copy link">
            <IconButton icon="content_copy" label="Copy link" />
          </Tooltip>
        ),
      },
      dont: {
        caption: "Don't put tooltips on plain text: keyboard and touch users never see them.",
        antiPattern: 'Tooltips on non-focusable elements',
        example: (
          <Text as="span" variant="body2">
            Plan limits (hover me)
          </Text>
        ),
      },
    },
  ],
  textOnly: {
    'Links or buttons inside a tooltip': 'Tooltips cannot hold interactive content (DS-C-007); use Popover.',
  },
};

const meta = {
  title: 'Usage/Tooltip',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
