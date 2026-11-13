/**
 * Builds the value of a component's `data-state` attribute.
 *
 * Convention (checked by the FR-3 parity test):
 * - hover, active and focus are CSS pseudo-classes, never data-state values.
 * - Every other metadata state appears as a space-separated token in data-state
 *   and is styled with `[data-state~="<state>"]`.
 */
export function dataState(flags: Record<string, boolean | undefined>, fallback?: string): string {
  const active = Object.entries(flags)
    .filter(([, on]) => on === true)
    .map(([name]) => name);
  if (active.length === 0 && fallback !== undefined) return fallback;
  return active.join(' ');
}

/** Joins ids for aria-describedby, dropping empty entries. Returns undefined when none. */
export function describedBy(...ids: Array<string | false | undefined>): string | undefined {
  const joined = ids.filter((id): id is string => typeof id === 'string' && id.length > 0).join(' ');
  return joined.length > 0 ? joined : undefined;
}
