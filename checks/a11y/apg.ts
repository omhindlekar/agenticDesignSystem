/**
 * Keyboard contract for every component, from the WAI-ARIA Authoring Practices Guide
 * (https://www.w3.org/WAI/ARIA/apg/patterns/). Each interactive component names its
 * pattern and the keys that pattern requires; checks/a11y/tests/apg-coverage.test.ts
 * fails unless every key has a test named `APG <pattern>: <key>[, <key>…]` in that
 * component's tests. Components without keyboard interaction of their own say why.
 *
 * The keyboard table on each component's usage page is rendered from this file.
 */
export interface KeySpec {
  key: string;
  does: string;
}

export interface ApgInteractive {
  pattern: string;
  url: string;
  keys: KeySpec[];
}

export interface ApgExempt {
  exempt: string;
}

export type ApgEntry = ApgInteractive | ApgExempt;

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns';

const BUTTON: ApgInteractive = {
  pattern: 'button',
  url: `${APG}/button/`,
  keys: [
    { key: 'Enter', does: 'Activates the button' },
    { key: 'Space', does: 'Activates the button' },
  ],
};

const DIALOG = (modal: boolean): ApgInteractive => ({
  pattern: modal ? 'dialog (modal)' : 'dialog (non-modal)',
  url: `${APG}/dialog-modal/`,
  keys: [
    {
      key: 'Tab',
      does: modal
        ? 'Moves focus to the next element inside the dialog, wrapping at the end'
        : 'Moves focus within the dialog',
    },
    ...(modal
      ? [{ key: 'Shift+Tab', does: 'Moves focus to the previous element inside the dialog, wrapping at the start' }]
      : []),
    { key: 'Escape', does: 'Closes the dialog and returns focus to what opened it' },
  ],
});

const TEXT_FIELD =
  'A native text field: typing, selection and caret keys come from the platform. Tab moves in and out.';
const STATIC = 'Not interactive: it takes no focus and has no keys of its own.';

export const APG_CONTRACT: Record<string, ApgEntry> = {
  'app-header': {
    pattern: 'landmarks + menu button',
    url: `${APG}/landmarks/`,
    keys: [
      { key: 'Tab', does: 'Moves through the title, navigation links, search and actions in reading order' },
      { key: 'Enter', does: 'Follows a navigation link; on narrow screens opens the navigation menu' },
    ],
  },
  avatar: { exempt: STATIC },
  'avatar-group': { exempt: STATIC },
  badge: { exempt: STATIC },
  banner: {
    pattern: 'alert',
    url: `${APG}/alert/`,
    keys: [{ key: 'Enter', does: 'Activates the dismiss button or an action; the banner itself never takes focus' }],
  },
  breadcrumbs: {
    pattern: 'breadcrumb',
    url: `${APG}/breadcrumb/`,
    keys: [
      { key: 'Tab', does: 'Moves through the links; the current page is not a link' },
      { key: 'Enter', does: 'Follows a link, or shows the full path when collapsed' },
    ],
  },
  button: BUTTON,
  card: {
    pattern: 'button (interactive cards)',
    url: `${APG}/button/`,
    keys: [
      { key: 'Enter', does: 'Activates an interactive card' },
      { key: 'Space', does: 'Activates an interactive card (button cards)' },
    ],
  },
  checkbox: {
    pattern: 'checkbox',
    url: `${APG}/checkbox/`,
    keys: [{ key: 'Space', does: 'Toggles the checkbox' }],
  },
  combobox: {
    pattern: 'combobox',
    url: `${APG}/combobox/`,
    keys: [
      { key: 'Arrow Down', does: 'Opens the list and moves to the next option' },
      { key: 'Arrow Up', does: 'Moves to the previous option' },
      { key: 'Enter', does: 'Chooses the focused option and closes the list' },
      { key: 'Escape', does: 'Closes the list' },
    ],
  },
  'date-picker': {
    pattern: 'date picker dialog + spin buttons',
    url: `${APG}/dialog-modal/examples/datepicker-dialog/`,
    keys: [
      { key: 'Arrow Up', does: 'Increments the focused date segment' },
      { key: 'Arrow Down', does: 'Decrements the focused date segment' },
      { key: 'Arrow Right', does: 'In the calendar, moves to the next day' },
      { key: 'Enter', does: 'In the calendar, chooses the focused day and closes the dialog' },
      { key: 'Escape', does: 'Closes the calendar' },
    ],
  },
  divider: { exempt: STATIC },
  drawer: DIALOG(true),
  field: { exempt: 'A label and message wrapper: keyboard comes from the control inside it.' },
  heading: { exempt: STATIC },
  icon: { exempt: STATIC },
  'icon-button': BUTTON,
  image: { exempt: STATIC },
  input: { exempt: TEXT_FIELD },
  link: {
    pattern: 'link',
    url: `${APG}/link/`,
    keys: [{ key: 'Enter', does: 'Follows the link' }],
  },
  list: {
    pattern: 'grid (interactive lists)',
    url: `${APG}/grid/`,
    keys: [
      { key: 'Arrow Down', does: 'Moves to the next item' },
      { key: 'Arrow Up', does: 'Moves to the previous item' },
      { key: 'Home', does: 'Moves to the first item' },
      { key: 'End', does: 'Moves to the last item' },
      { key: 'Space', does: 'Selects the focused item' },
      { key: 'Enter', does: 'Opens the focused item' },
    ],
  },
  menu: {
    pattern: 'menu button',
    url: `${APG}/menu-button/`,
    keys: [
      { key: 'Enter', does: 'Opens the menu on the first item; on an item, runs it and closes the menu' },
      { key: 'Space', does: 'Opens the menu on the first item' },
      { key: 'Arrow Down', does: 'Moves to the next item' },
      { key: 'Arrow Up', does: 'Moves to the previous item' },
      { key: 'Home', does: 'Moves to the first item' },
      { key: 'End', does: 'Moves to the last item' },
      { key: 'Arrow Right', does: 'Opens a submenu' },
      { key: 'Escape', does: 'Closes the menu and returns focus to the trigger' },
    ],
  },
  modal: DIALOG(true),
  'number-field': {
    pattern: 'spinbutton',
    url: `${APG}/spinbutton/`,
    keys: [
      { key: 'Arrow Up', does: 'Increases the value by one step' },
      { key: 'Arrow Down', does: 'Decreases the value by one step' },
    ],
  },
  popover: DIALOG(false),
  'progress-bar': { exempt: STATIC },
  'radio-group': {
    pattern: 'radio group',
    url: `${APG}/radio/`,
    keys: [
      { key: 'Arrow Down', does: 'Moves to and selects the next option, skipping disabled ones' },
      { key: 'Arrow Up', does: 'Moves to and selects the previous option' },
      { key: 'Space', does: 'Selects the focused option' },
    ],
  },
  'search-field': {
    pattern: 'search landmark text field',
    url: `${APG}/landmarks/examples/search.html`,
    keys: [
      { key: 'Enter', does: 'Submits the search' },
      { key: 'Escape', does: 'Clears the field' },
    ],
  },
  'segmented-control': {
    pattern: 'radio group (segmented)',
    url: `${APG}/radio/`,
    keys: [
      { key: 'Arrow Right', does: 'Moves to the next segment' },
      { key: 'Arrow Left', does: 'Moves to the previous segment' },
    ],
  },
  select: {
    pattern: 'select-only combobox',
    url: `${APG}/combobox/examples/combobox-select-only/`,
    keys: [
      { key: 'Enter', does: 'Opens the list; on an option, chooses it' },
      { key: 'Arrow Down', does: 'Opens the list or moves to the next option' },
      { key: 'Arrow Up', does: 'Moves to the previous option' },
      { key: 'Escape', does: 'Closes the list without changing the value' },
      { key: 'Type-ahead', does: 'Typing characters moves to the matching option' },
    ],
  },
  'side-nav': {
    pattern: 'navigation landmark + disclosure',
    url: `${APG}/disclosure/`,
    keys: [
      { key: 'Tab', does: 'Moves through the navigation links and group toggles' },
      { key: 'Enter', does: 'Follows a link, or expands and collapses a group' },
    ],
  },
  slider: {
    pattern: 'slider',
    url: `${APG}/slider/`,
    keys: [
      { key: 'Arrow Right', does: 'Increases the value by one step' },
      { key: 'Arrow Left', does: 'Decreases the value by one step' },
      { key: 'Home', does: 'Sets the minimum' },
      { key: 'End', does: 'Sets the maximum' },
    ],
  },
  spinner: { exempt: STATIC },
  switch: {
    pattern: 'switch',
    url: `${APG}/switch/`,
    keys: [{ key: 'Space', does: 'Toggles the switch' }],
  },
  table: {
    pattern: 'grid (data grid)',
    url: `${APG}/grid/`,
    keys: [
      { key: 'Arrow Down', does: 'Moves to the next row' },
      { key: 'Arrow Up', does: 'Moves to the previous row' },
      { key: 'Arrow Right', does: 'Moves to the next cell' },
      { key: 'Arrow Left', does: 'Moves to the previous cell' },
      { key: 'Space', does: 'Selects the focused row (selectable tables)' },
      { key: 'Enter', does: 'Sorts by the focused column header' },
    ],
  },
  tabs: {
    pattern: 'tabs',
    url: `${APG}/tabs/`,
    keys: [
      { key: 'Arrow Right', does: 'Moves to the next tab (selects it with automatic activation)' },
      { key: 'Arrow Left', does: 'Moves to the previous tab' },
      { key: 'Home', does: 'Moves to the first tab' },
      { key: 'End', does: 'Moves to the last tab' },
      { key: 'Enter', does: 'Selects the focused tab (manual activation)' },
    ],
  },
  'tag-group': {
    pattern: 'grid (tags)',
    url: `${APG}/grid/`,
    keys: [
      { key: 'Arrow Right', does: 'Moves to the next tag' },
      { key: 'Arrow Left', does: 'Moves to the previous tag' },
      { key: 'Delete', does: 'Removes the focused tag (removable groups)' },
      { key: 'Backspace', does: 'Removes the focused tag (removable groups)' },
      { key: 'Space', does: 'Selects the focused tag (selectable groups)' },
    ],
  },
  text: { exempt: STATIC },
  textarea: { exempt: TEXT_FIELD },
  'toast-region': {
    pattern: 'alert + landmark region',
    url: `${APG}/alert/`,
    keys: [
      { key: 'F6', does: 'Moves focus to the notifications region; F6 again returns' },
      { key: 'Enter', does: 'Activates a toast action or its close button' },
    ],
  },
  tooltip: {
    pattern: 'tooltip',
    url: `${APG}/tooltip/`,
    keys: [
      { key: 'Tab', does: 'Focusing the trigger shows the tooltip' },
      { key: 'Escape', does: 'Hides the tooltip' },
    ],
  },
  tree: {
    pattern: 'treeview',
    url: `${APG}/treeview/`,
    keys: [
      { key: 'Arrow Down', does: 'Moves to the next visible node' },
      { key: 'Arrow Up', does: 'Moves to the previous visible node' },
      { key: 'Arrow Right', does: 'Expands a closed parent; on an open parent, moves to its first child' },
      { key: 'Arrow Left', does: 'Collapses an open parent; on a child, moves to its parent' },
      { key: 'Home', does: 'Moves to the first node' },
      { key: 'End', does: 'Moves to the last visible node' },
      { key: 'Enter', does: 'Activates the focused node' },
    ],
  },
};

export function isInteractive(entry: ApgEntry): entry is ApgInteractive {
  return 'pattern' in entry;
}
