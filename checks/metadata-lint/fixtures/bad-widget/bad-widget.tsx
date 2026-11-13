// Fixture: deliberately out of sync with bad-widget.meta.json.
// Missing prop `disabled`, extra prop `aria-label`, variant `tertiary` instead of `secondary`.
export interface BadWidgetProps {
  label: string;
  variant?: 'primary' | 'tertiary';
  'aria-label'?: string;
}

export function BadWidget({ label, variant = 'primary' }: BadWidgetProps) {
  return (
    <span className="bad-widget" data-variant={variant} data-state="default">
      {label}
    </span>
  );
}
