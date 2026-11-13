import type { Decorator, Preview } from '@storybook/react-vite';
import '../styles/tokens.css';
import './preview.css';

/**
 * Applies the toolbar's theme as data-theme on <html>. Light is set explicitly too,
 * so an OS dark preference cannot override the choice made in the toolbar.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals['theme'] as string | undefined) ?? 'light';
  const doc = (globalThis as { document?: { documentElement: { setAttribute(name: string, value: string): void } } }).document;
  doc?.documentElement.setAttribute('data-theme', theme);
  return Story();
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'high-contrast', title: 'High contrast' },
        ],
      },
    },
  },
  initialGlobals: { theme: 'light' },
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
