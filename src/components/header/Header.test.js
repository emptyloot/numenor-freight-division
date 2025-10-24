import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

// Mock the child components
jest.mock('../auth/LoginButton.js', () => () => <button>Login</button>);
jest.mock('../auth/LogoutButton.js', () => () => <button>Logout</button>);
jest.mock('../auth/UserProfile.js', () => () => <div data-testid="user-profile">User Profile</div>);
jest.mock('../logo/Logo.js', () => () => <div data-testid="logo">Logo</div>);

describe('Header component', () => {
  test('renders the logo', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  test('shows "About us" link on the homepage', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );
    const linkElement = screen.getByText(/About us/i);
    expect(linkElement).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /About us/i })).toHaveAttribute('href', '/about');
  });

  test('shows "Calculator" link when not on the homepage', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Header />
      </MemoryRouter>
    );
    const linkElement = screen.getByText(/Calculator/i);
    expect(linkElement).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Calculator/i })).toHaveAttribute('href', '/');
  });

  test('shows Login button when not authenticated', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument();
  });
});
