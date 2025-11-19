import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';
import { useAuth } from '../../context/AuthContext';
//Mock
jest.mock('../../firebase/firebase');
jest.mock('../../context/AuthContext');
const mockedUseAuth = useAuth;

describe('UserProfile', () => {
  test('renders with placeholder user when no user prop is provided', () => {
    mockedUseAuth.mockReturnValue({ currentUser: null });
    render(<UserProfile />);
    expect(screen.getByText('Guest')).toBeInTheDocument();
    expect(screen.getByAltText("Guest's avatar")).toHaveAttribute(
      'src',
      'https://cdn.discordapp.com/embed/avatars/0.png'
    );
  });

  test('renders with provided user data', () => {
    const testUser = {
      global_name: 'TestUser',
      avatar: 'test-avatar',
      discordId: '12345',
    };
    mockedUseAuth.mockReturnValue({ currentUser: testUser });
    render(<UserProfile />);
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByAltText("TestUser's avatar")).toHaveAttribute(
      'src',
      'https://cdn.discordapp.com/avatars/12345/test-avatar.png'
    );
  });

  test('has correct styling for the avatar image', () => {
    mockedUseAuth.mockReturnValue({ currentUser: null });
    render(<UserProfile />);
    const avatarElement = screen.getByAltText("Guest's avatar");
    expect(avatarElement).toHaveClass('w-10');
    expect(avatarElement).toHaveClass('h-10');
    expect(avatarElement).toHaveClass('rounded-full');
    expect(avatarElement).toHaveClass('mr-4');
  });

  test('has correct styling for the username span', () => {
    mockedUseAuth.mockReturnValue({ currentUser: null });
    render(<UserProfile />);
    const usernameElement = screen.getByText('Guest');
    expect(usernameElement).toHaveClass('text-white');
    expect(usernameElement).toHaveClass('font-bold');
  });
});
