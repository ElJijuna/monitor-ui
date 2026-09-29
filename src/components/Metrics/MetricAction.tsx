import { Button } from '@gnome-ui/react';

interface MetricActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const MetricAction = ({ label, onClick, disabled }: MetricActionProps) => (
  <Button disabled={disabled} onClick={onClick} size="sm" variant="flat">
    {label}
  </Button>
);
