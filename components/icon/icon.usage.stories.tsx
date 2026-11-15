import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './icon.meta.json';
import { Icon } from './icon';
import { Text } from '../text/text';

/** Do and don't examples for the Icon usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Leave decorative icons unlabelled when text says the same thing.',
        example: (
          <Text as="span">
            <Icon name="mail" /> Email
          </Text>
        ),
      },
      dont: {
        caption: "Don't label a decorative icon; it is announced twice.",
        antiPattern: 'Giving a decorative icon a label, so screen readers announce it twice',
        example: (
          <Text as="span">
            <Icon name="mail" label="Email" /> Email
          </Text>
        ),
      },
    },
  ],
  textOnly: {
    'Pasting raw <svg> markup into a component instead of using Icon':
      'Token lint rejects raw SVG in components (DS-I-001).',
    'Using an icon font': 'Token lint rejects icon fonts (DS-I-001).',
    'Colouring an icon with a hardcoded value instead of the text colour':
      'Token lint rejects hardcoded colours, so the wrong version is not renderable.',
  },
};

const meta = {
  title: 'Usage/Icon',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
