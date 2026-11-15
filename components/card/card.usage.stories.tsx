import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './card.meta.json';
import { Card } from './card';
import { Button } from '../button/button';

/** Do and don't examples for the Card usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Group related content in one card.',
        example: (
          <Card title="Pro plan" subtitle="Billed yearly" actions={<Button label="Choose" variant="outlined" />}>
            Unlimited projects and priority support.
          </Card>
        ),
      },
      dont: {
        caption: "Don't put cards inside cards.",
        antiPattern: 'Nesting a Card inside another Card',
        example: (
          <Card title="Plans">
            <Card title="Pro plan">Unlimited projects.</Card>
          </Card>
        ),
      },
    },
  ],
  textOnly: {
    'Using Card as an interactive element without setting role and keyboard handling':
      'Card renders a real button or link when given onClick or href, so the mistake cannot be made with the component.',
    'Hardcoding padding, a border-radius or a custom box-shadow — use the padding prop and the elevation tokens':
      'Token lint rejects these values in components, so the wrong version is not renderable here.',
  },
};

const meta = {
  title: 'Usage/Card',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
