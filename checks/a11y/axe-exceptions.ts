/**
 * axe findings that are not WCAG failures, each scoped to a selector and explained.
 * Both axe runs (jsdom: checks/a11y/tests/axe.test.tsx; browser: npm run a11y) drop a
 * violation node only when it matches one of these. Anything else fails the run.
 */
export interface AxeException {
  rule: string;
  /** CSS selector the violating element must match. */
  selector: string;
  reason: string;
}

export const AXE_EXCEPTIONS: AxeException[] = [
  {
    rule: 'label-content-name-mismatch',
    selector: '.ads-menu__item:has(.ads-menu__shortcut, .ads-menu__description)',
    reason:
      'WCAG 2.5.3 asks that the name contain the visible label. The label is the item text ("Edit"), ' +
      'which is the accessible name; the shortcut and description are separate text, exposed through ' +
      "aria-describedby by React Aria. axe's heuristic counts all visible text in the item.",
  },
  {
    rule: 'color-contrast',
    selector: '.ads-slider[data-state~="disabled"] :is(.ads-field__label, .ads-slider__output)',
    reason:
      'The label and value of a disabled slider. WCAG 1.4.3 exempts inactive user interface ' +
      'components; axe cannot tell that they belong to the disabled slider.',
  },
];

/** True when the element matches an exception for the rule. */
export function isExcepted(rule: string, element: { matches(selector: string): boolean }): boolean {
  return AXE_EXCEPTIONS.some((e) => e.rule === rule && element.matches(e.selector));
}
