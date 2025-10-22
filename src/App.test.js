/**
 * @description This is the default test file for the main App component.
 * It has been modified to support React Router.
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { MemoryRouter } from 'react-router';

afterEach(cleanup);

/**
 * @description Renders the full App components and verifies text on screen.
 */
test('Renders the main homepage title', () => {
  render(
    <MemoryRouter> 
      <App />
    </MemoryRouter>);
  // Check for the main H1 title on the homepage
  const headingElement = screen.getByText(/"By land or sea, the world turns on our trade"/i);
  expect(headingElement).toBeInTheDocument();
});

/**
 * @description Renders the full App and navigates to the about us page.
 */
test('Navigates to About page when About Us link is clicked', async () => {
  render(
    <MemoryRouter> 
      <App />
    </MemoryRouter>);

  // Find the "About us" link (case-insensitive)
  const aboutLink = screen.getByRole('link', { name: /about us/i });

  // Simulate a user clicking the link
  await userEvent.click(aboutLink);

  // Check if the heading of the About page is now visible
  const aboutHeading = screen.getByRole('heading', { name: /about númenor freight division/i });
  expect(aboutHeading).toBeInTheDocument();
});


test('Render the About agian page and navigates back to calculator', async () => {
  render(
    <MemoryRouter initialEntries={['/about']}> 
      <App />
    </MemoryRouter>);

  //Find the Calculator link (case insensitive)
  screen.debug()
  const calculatorLink = screen.getByRole('link', { name: /calculator/i });

  await userEvent.click(calculatorLink);

  const calculatorHeading = screen.getByRole('heading', { name: /Instant Quote Calculator/i });

  expect(calculatorHeading).toBeInTheDocument();
});


test('Render the schedule page and navigates back to calculator', async () => {
    render(
    <MemoryRouter initialEntries={['/schedule']}> 
      <App />
    </MemoryRouter>);

  //Find the Calculator link (case insensitive)
   screen.debug()
  const calculatorLink = screen.getByRole('link', { name: /calculator/i });

  await userEvent.click(calculatorLink);

  const calculatorHeading = screen.getByRole('heading', { name: /Instant Quote Calculator/i });

  expect(calculatorHeading).toBeInTheDocument();
});