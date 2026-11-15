import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './side-nav.meta.json';
import { SideNav } from './side-nav';

/** Do and don't examples for the SideNav usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Navigation links only, with one level of groups.',
        example: (
          <SideNav
            label="Main"
            currentId="components"
            items={[
              { id: 'home', label: 'Home', href: '#', icon: 'menu' },
              {
                type: 'group',
                id: 'lib',
                label: 'Library',
                items: [{ id: 'components', label: 'Components', href: '#' }],
              },
            ]}
          />
        ),
      },
      dont: {
        caption: "Don't mix actions into the navigation.",
        antiPattern: 'Actions mixed into navigation links',
        example: (
          <SideNav
            label="Main"
            currentId="home"
            items={[
              { id: 'home', label: 'Home', href: '#', icon: 'menu' },
              { id: 'new', label: 'New project…', href: '#', icon: 'add' },
              { id: 'out', label: 'Sign out', href: '#' },
            ]}
          />
        ),
      },
    },
  ],
  textOnly: {
    'More than one level of groups': 'SideNav supports one level of groups; deeper levels cannot be built with it.',
  },
};

const meta = {
  title: 'Usage/SideNav',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
