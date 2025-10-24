import { render, screen, fireEvent } from '@testing-library/react';
import LoginButton from './LoginButton';
import { useAuth } from '../../context/AuthContext';

// Mock the useAuth hook
jest.mock('../../context/AuthContext');

describe('LoginButton', () => {
  test('renders the login button', () => {
    useAuth.mockReturnValue({ setIsAuthenticated: jest.fn() });
    render(<LoginButton />);
    expect(screen.getByRole('button', { name: /Login with Discord/i })).toBeInTheDocument();
  });

  test('calls setIsAuthenticated(true) when clicked', () => {
    const setIsAuthenticatedMock = jest.fn();
    useAuth.mockReturnValue({ setIsAuthenticated: setIsAuthenticatedMock });
    render(<LoginButton />);

    fireEvent.click(screen.getByRole('button', { name: /Login with Discord/i }));
    expect(setIsAuthenticatedMock).toHaveBeenCalledWith(true);
  });

  test('has correct styling', () => {
    useAuth.mockReturnValue({ setIsAuthenticated: jest.fn() });
    render(<LoginButton />);
    const buttonElement = screen.getByRole('button', { name: /Login with Discord/i });
    expect(buttonElement).toHaveClass('bg-[#5865F2]');
    expect(buttonElement).toHaveClass('hover:bg-[#4752C4]');
    expect(buttonElement).toHaveClass('text-white');
    expect(buttonElement).toHaveClass('font-bold');
    expect(buttonElement).toHaveClass('py-2');
    expect(buttonElement).toHaveClass('px-4');
    expect(buttonElement).toHaveClass('rounded-md');
    expect(buttonElement).toHaveClass('flex');
    expect(buttonElement).toHaveClass('items-center');
  });
});
