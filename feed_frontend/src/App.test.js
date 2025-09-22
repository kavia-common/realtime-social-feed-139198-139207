import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app shell (unauthenticated -> auth page)', () => {
  render(<App />);
  const el = screen.getByText(/OceanFeed/i);
  expect(el).toBeInTheDocument();
});
