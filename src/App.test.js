/**
 * @description This is the default test file for the main App component.
 * It has been modified to support React Router.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

/**
 * @description Renders the full App components and verifys text on screen.
 */
test('renders the main homepage title', () => {
  render(<App />);
  // Check for the main H1 title on the homepage
  const headingElement = screen.getByText(/"By land or sea, the world turns on our trade"/i);
  expect(headingElement).toBeInTheDocument();
});

/**
 * @description Renders the full App and navigates to the about us page.
 */
test('navigates to About page when About Us link is clicked', async () => {
  render(<App />);

  // Find the "About us" link (case-insensitive)
  const aboutLink = screen.getByRole('link', { name: /about us/i });

  // Simulate a user clicking the link
  await userEvent.click(aboutLink);

  // Check if the heading of the About page is now visible
  const aboutHeading = screen.getByRole('heading', { name: /about númenor freight division/i });
  expect(aboutHeading).toBeInTheDocument();
});

test('starts at About page and navigates back to calculator', async () => {
  render(<App initialEntries={['/about']} />);

  //Find the Calculator link (case insensitive)
  const calculatorLink = screen.getByRole('link', { name: /calculator/i });

  await userEvent.click(calculatorLink);

  const calculatorHeading = screen.getByRole('heading', { name: /Instant Quote Calculator/i });

  expect(calculatorHeading).toBeInTheDocument();
});
