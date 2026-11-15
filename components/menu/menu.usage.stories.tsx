import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './menu.meta.json';
import { Menu } from './menu';
import { Button } from '../button/button';

/** Do and don't examples for the Menu usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Keep the common action on the page; put the rest in the menu.',
        example: (
          <>
            <Button label="Share" />
            <Menu
              label="More actions"
              items={[
                { id: 'd', label: 'Duplicate' },
                { id: 'a', label: 'Archive' },
              ]}
            />
          </>
        ),
      },
      dont: {
        caption: "Don't hide the action people need most in a menu.",
        antiPattern: 'Hiding the only way to do a common task in a menu',
        example: (
          <Menu
            label="Actions"
            items={[
              { id: 's', label: 'Share' },
              { id: 'd', label: 'Duplicate' },
              { id: 'a', label: 'Archive' },
            ]}
          />
        ),
      },
    },
  ],
  textOnly: {
    'More than one level of submenu': 'Menu supports one level of submenu; deeper levels cannot be built with it.',
  },
};

const meta = {
  title: 'Usage/Menu',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
