// Fixture: uses CSS custom properties (semantic tokens) — lint must pass
const style = {
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-background-surface)',
  margin: 'var(--space-component-padding-md)',
  padding: 'var(--space-component-padding-sm)',
  borderRadius: 'var(--radius-component-md)',
};

export default function GoodButton() {
  return (
    <button style={{ color: 'var(--color-interactive-default)' }}>
      Click
    </button>
  );
}
