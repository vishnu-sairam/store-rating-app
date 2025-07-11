import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

test('renders app name', () => {
  render(<Navbar />);
  expect(screen.getByText(/Store Rating App/i)).toBeInTheDocument();
}); 