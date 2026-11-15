import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './image.meta.json';
import { Image } from './image';

/** Do and don't examples for the Image usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Describe what the image shows.',
        example: (
          <div style={{ width: 'var(--size-modal-sm)' }}>
            <Image src="" alt="Team photo from the 2026 offsite" ratio="16:9" />
          </div>
        ),
      },
      dont: {
        caption: "Don't use a file name or 'image' as the alt text.",
        antiPattern: 'Missing or meaningless alt text',
        example: (
          <div style={{ width: 'var(--size-modal-sm)' }}>
            <Image src="" alt="IMG_2041.jpg" ratio="16:9" />
          </div>
        ),
      },
    },
  ],
  textOnly: {
    'Text inside images': 'Text belongs in the page next to the image, where it can be read, resized and translated.',
  },
};

const meta = {
  title: 'Usage/Image',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
