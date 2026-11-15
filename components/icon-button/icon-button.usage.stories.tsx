import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './icon-button.meta.json';
import { IconButton } from './icon-button';
import { Tooltip } from '../tooltip/tooltip';

/** Do and don't examples for the IconButton usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Name the action, and add a tooltip when the icon is not obvious.',
        example: (
          <Tooltip content="Filter projects">
            <IconButton icon="filter_list" label="Filter projects" />
          </Tooltip>
        ),
      },
      dont: {
        caption: "Don't leave an unfamiliar icon without a tooltip or text.",
        antiPattern: 'Using an icon whose meaning is ambiguous without a tooltip or text',
        example: <IconButton icon="filter_list" label="Filter projects" />,
      },
    },
    {
      do: {
        caption: 'Use one contained icon button, the rest standard.',
        example: (
          <>
            <IconButton icon="add" label="New project" variant="contained" />
            <IconButton icon="edit" label="Rename" />
            <IconButton icon="delete" label="Delete" />
          </>
        ),
      },
      dont: {
        caption: "Don't line up several contained icon buttons.",
        antiPattern: 'Placing several contained icon buttons side by side',
        example: (
          <>
            <IconButton icon="add" label="New project" variant="contained" />
            <IconButton icon="edit" label="Rename" variant="contained" />
            <IconButton icon="delete" label="Delete" variant="contained" />
          </>
        ),
      },
    },
  ],
  textOnly: {
    'Leaving out the label or repeating the icon name ("close icon") instead of the action ("Close dialog")':
      'The difference is only in what a screen reader announces, which a picture cannot show.',
  },
};

const meta = {
  title: 'Usage/IconButton',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
