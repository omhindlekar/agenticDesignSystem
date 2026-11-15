import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './slider.meta.json';
import { Slider } from './slider';

/** Do and don't examples for the Slider usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Show the value when it matters.',
        example: (
          <div style={{ width: '100%' }}>
            <Slider
              label="Opacity"
              defaultValue={[0.4]}
              formatOptions={{ style: 'percent' }}
              maxValue={1}
              step={0.01}
            />
          </div>
        ),
      },
      dont: {
        caption: "Don't hide a value people need to set precisely.",
        antiPattern: 'Hiding the value when precision matters',
        example: (
          <div style={{ width: '100%' }}>
            <Slider label="Opacity" defaultValue={[40]} showValue={false} />
          </div>
        ),
      },
    },
  ],
  textOnly: {
    'Steps so small that keyboard users need hundreds of key presses':
      'A keyboard behaviour; the slider looks the same.',
  },
};

const meta = {
  title: 'Usage/Slider',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
