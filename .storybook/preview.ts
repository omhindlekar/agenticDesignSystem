import { createElement } from 'react';
import { I18nProvider } from 'react-aria-components';
import type { Decorator, Preview } from '@storybook/react-vite';
import '../styles/tokens.css';
import './preview.css';

/**
 * Applies the toolbar's theme and density to <html>. Light is set explicitly, so an OS
 * dark preference cannot override the toolbar.
 */
const withThemeAndDensity: Decorator = (Story, context) => {
  const theme = (context.globals['theme'] as string | undefined) ?? 'light';
  const density = (context.globals['density'] as string | undefined) ?? 'comfortable';
  const doc = (globalThis as { document?: { documentElement: { setAttribute(name: string, value: string): void } } })
    .document;
  doc?.documentElement.setAttribute('data-theme', theme);
  doc?.documentElement.setAttribute('data-density', density);
  return Story();
};

/**
 * Right to left: sets dir on <html> and gives React Aria a right-to-left locale (Hebrew),
 * so keyboard arrows, popover placement and calendars follow the reading direction.
 */
const withDirection: Decorator = (Story, context) => {
  const direction = (context.globals['direction'] as string | undefined) ?? 'ltr';
  const doc = (globalThis as { document?: { documentElement: { setAttribute(name: string, value: string): void } } })
    .document;
  doc?.documentElement.setAttribute('dir', direction);
  return createElement(I18nProvider, { locale: direction === 'rtl' ? 'he-IL' : 'en-US', children: Story() });
};

const preview: Preview = {
  decorators: [withThemeAndDensity, withDirection],
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
    density: {
      description: 'Density',
      toolbar: {
        title: 'Density',
        icon: 'component',
        dynamicTitle: true,
        items: [
          { value: 'comfortable', title: 'Comfortable' },
          { value: 'compact', title: 'Compact' },
        ],
      },
    },
    direction: {
      description: 'Reading direction',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        dynamicTitle: true,
        items: [
          { value: 'ltr', title: 'Left to right' },
          { value: 'rtl', title: 'Right to left' },
        ],
      },
    },
  },
  initialGlobals: { theme: 'light', density: 'comfortable', direction: 'ltr' },
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
