import { render, screen, fireEvent } from '@testing-library/react';
import LogoutButton from './LogoutButton';
import { useAuth } from '../../context/AuthContext';
// Mock the useAuth hook
jest.mock('../../firebase/firebase');
jest.mock('../../context/AuthContext');
describe('LogoutButton', () => {
  test('renders the logout button', () => {
    const setIsAuthenticatedMock = jest.fn();
    useAuth.mockReturnValue({ setIsAuthenticated: setIsAuthenticatedMock });
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  test('calls setIsAuthenticated(false) when clicked', () => {
    const logoutMock = jest.fn();
    useAuth.mockReturnValue({ logout: logoutMock });
    render(<LogoutButton />);

    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  test('has correct styling', () => {
    const setIsAuthenticatedMock = jest.fn();
    useAuth.mockReturnValue({ setIsAuthenticated: setIsAuthenticatedMock });
    render(<LogoutButton />);
    const buttonElement = screen.getByRole('button', { name: /Logout/i });
    expect(buttonElement).toHaveClass('bg-red-500');
    expect(buttonElement).toHaveClass('hover:bg-red-700');
    expect(buttonElement).toHaveClass('text-white');
    expect(buttonElement).toHaveClass('font-bold');
    expect(buttonElement).toHaveClass('py-2');
    expect(buttonElement).toHaveClass('px-4');
    expect(buttonElement).toHaveClass('rounded');
  });
});
