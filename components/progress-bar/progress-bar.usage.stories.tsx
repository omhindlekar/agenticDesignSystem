import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './progress-bar.meta.json';
import { ProgressBar } from './progress-bar';

/** Do and don't examples for the ProgressBar usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Show measurable work as a determinate bar.',
        example: (
          <div style={{ width: '100%' }}>
            <ProgressBar label="Uploading files" value={64} />
          </div>
        ),
      },
      dont: {
        caption: "Don't use an indeterminate bar when you know how far along it is.",
        antiPattern: 'An indeterminate bar for work that can be measured',
        example: (
          <div style={{ width: '100%' }}>
            <ProgressBar label="Uploading files (64%)" indeterminate />
          </div>
        ),
      },
    },
  ],
  textOnly: {
    'Progress that jumps backwards': 'A behaviour over time; a still example would not show it.',
  },
};

const meta = {
  title: 'Usage/ProgressBar',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
