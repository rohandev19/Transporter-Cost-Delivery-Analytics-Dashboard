import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders valid status correctly', () => {
    const { getByText } = render(<StatusBadge status="valid" />);
    const badge = getByText('Valid');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100 text-green-700');
  });

  it('renders anomaly status correctly', () => {
    const { getByText } = render(<StatusBadge status="anomaly" />);
    const badge = getByText('Anomaly');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100 text-red-700');
  });

  it('renders warning status correctly', () => {
    const { getByText } = render(<StatusBadge status="warning" />);
    const badge = getByText('Warning');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100 text-yellow-700');
  });
});
