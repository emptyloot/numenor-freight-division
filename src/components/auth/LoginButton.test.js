import { render, screen, fireEvent } from '@testing-library/react';
import LoginButton from './LoginButton';
import axios from 'axios';

jest.mock('axios');

describe('LoginButton', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { clientId: '12345' } });
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  test('renders the login button', async () => {
    render(<LoginButton />);
    expect(await screen.findByRole('button', { name: /Login with Discord/i })).toBeInTheDocument();
  });

  test('redirects to Discord authorization URL when clicked', async () => {
    render(<LoginButton />);

    // Wait for the button to be enabled after clientId is fetched
    const loginButton = await screen.findByRole('button', { name: /Login with Discord/i });
    expect(loginButton).not.toBeDisabled();

    fireEvent.click(loginButton);

    const expectedClientId = '12345';
    const redirectUri = 'http://localhost:3000/auth/callback';
    const scope = 'identify';
    const expectedAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${expectedClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}`;

    expect(window.location.href).toBe(expectedAuthUrl);
  });

  test('has correct styling', async () => {
    render(<LoginButton />);
    const buttonElement = await screen.findByRole('button', { name: /Login with Discord/i });
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
