import { render, screen } from '@testing-library/react';
import Header from './Header';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Mock the useAuth hook
jest.mock('../../context/AuthContext');

// Mock the child components
jest.mock('../auth/LoginButton.js', () => () => <button>Login</button>);
jest.mock('../auth/LogoutButton.js', () => () => <button>Logout</button>);
jest.mock('../auth/UserProfile.js', () => () => <div data-testid="user-profile">User Profile</div>);
jest.mock('../logo/Logo.js', () => () => <div data-testid="logo">Logo</div>);

describe('Header component', () => {
  test('renders the logo', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  test('shows "About us" link on the homepage', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });
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
    useAuth.mockReturnValue({ isAuthenticated: false });
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Header />
      </MemoryRouter>
    );
    const linkElement = screen.getByText(/Calculator/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('shows Login button when not authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument();
  });

  test('shows Logout button when authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });
});
