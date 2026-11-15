import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './avatar-group.meta.json';
import { AvatarGroup } from './avatar-group';

const people = [
  'Om Hindlekar',
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
  'Edsger Dijkstra',
  'Barbara Liskov',
  'Donald Knuth',
  'Margaret Hamilton',
].map((name) => ({ name }));

/** Do and don't examples for the AvatarGroup usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Show a few faces and summarise the rest as +n.',
        example: <AvatarGroup label="Project members" people={people} max={4} />,
      },
      dont: {
        caption: "Don't show so many avatars that none can be recognised.",
        antiPattern: 'Showing more than about six avatars',
        example: <AvatarGroup label="Project members" people={people} max={9} />,
      },
    },
  ],
};

const meta = {
  title: 'Usage/AvatarGroup',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
