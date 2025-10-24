import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  test('renders with placeholder user when no user prop is provided', () => {
    render(<UserProfile />);
    expect(screen.getByText('Guest')).toBeInTheDocument();
    expect(screen.getByAltText("Guest's avatar")).toHaveAttribute(
      'src',
      'https://cdn.discordapp.com/embed/avatars/0.png'
    );
  });

  test('renders with provided user data', () => {
    const testUser = {
      username: 'TestUser',
      avatar: 'https://example.com/test-avatar.png',
    };
    render(<UserProfile user={testUser} />);
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByAltText("TestUser's avatar")).toHaveAttribute('src', 'https://example.com/test-avatar.png');
  });

  test('has correct styling for the avatar image', () => {
    render(<UserProfile />);
    const avatarElement = screen.getByAltText("Guest's avatar");
    expect(avatarElement).toHaveClass('w-10');
    expect(avatarElement).toHaveClass('h-10');
    expect(avatarElement).toHaveClass('rounded-full');
    expect(avatarElement).toHaveClass('mr-4');
  });

  test('has correct styling for the username span', () => {
    render(<UserProfile />);
    const usernameElement = screen.getByText('Guest');
    expect(usernameElement).toHaveClass('text-white');
    expect(usernameElement).toHaveClass('font-bold');
  });
});
