import type { Preview } from '@storybook/react-vite';
import '../styles/tokens.css';
import './preview.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    // storybook-addon-pseudo-states copies a story's `pseudo` parameter into the user
    // globals, which persist across navigation. Defaulting every state to false gives
    // each story an explicit config, so opening a story resets the globals and only
    // Hover / Active / Focus stories force their state.
    pseudo: {
      hover: false,
      active: false,
      focusVisible: false,
      focusWithin: false,
      focus: false,
      visited: false,
      link: false,
      target: false,
    },
  },
};

export default preview;
