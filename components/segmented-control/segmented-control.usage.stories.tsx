import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './segmented-control.meta.json';
import { SegmentedControl } from './segmented-control';

/** Do and don't examples for the SegmentedControl usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Use short labels of similar length.',
        example: (
          <SegmentedControl
            label="View"
            options={[
              { value: 'd', label: 'Day' },
              { value: 'w', label: 'Week' },
              { value: 'm', label: 'Month' },
            ]}
            defaultValue={['w']}
          />
        ),
      },
      dont: {
        caption: "Don't mix very short and very long segments.",
        antiPattern: 'Segments with very different label lengths',
        example: (
          <SegmentedControl
            label="View"
            options={[
              { value: 'd', label: 'Day' },
              { value: 'w', label: 'The current working week' },
              { value: 'm', label: 'M' },
            ]}
            defaultValue={['w']}
          />
        ),
      },
    },
  ],
  textOnly: {
    'Mixing actions and selections in one control':
      'Segments only select; an action segment cannot be built with the component.',
  },
};

const meta = {
  title: 'Usage/SegmentedControl',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
