import { render, screen, fireEvent } from '@testing-library/react';
import LoginButton from './LoginButton';
import axios from 'axios';

jest.mock('axios');
const mockManifestData = {
  port: [
    { north: 1, east: 1 },
    { north: 2, east: 2 },
  ],
};
jest.mock('../../context/ShipmentManifestContext', () => ({
  /**
   * @description Mocks the useManifest hook to provide a controlled context for testing.
   * @returns { object } An object containing the mocked `manifest` state.
   */
  useManifest: () => ({
    manifest: mockManifestData,
  }),
}));

describe('LoginButton', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { clientId: '12345' } });
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      writable: true,
      value: { setItem: jest.fn() },
    });
    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '', origin: 'http://localhost:3000' },
    });
  });

  test('renders the login button with default text when no children are provided', async () => {
    render(<LoginButton />);
    expect(await screen.findByRole('button', { name: /Login with Discord/i })).toBeInTheDocument();
  });

  test('renders the login button with custom text when children are provided', async () => {
    render(<LoginButton>Login to Schedule</LoginButton>);
    expect(await screen.findByRole('button', { name: /Login to Schedule/i })).toBeInTheDocument();
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

  test('saves pending manifest to session storage on login', async () => {
    render(<LoginButton />);
    const loginButton = await screen.findByRole('button', { name: /Login with Discord/i });
    fireEvent.click(loginButton);

    expect(sessionStorage.setItem).toHaveBeenCalledWith('pendingManifest', JSON.stringify(mockManifestData));
    expect(sessionStorage.setItem).toHaveBeenCalledTimes(1);
  });

  test('has correct styling', async () => {
    render(<LoginButton />);
    const buttonElement = await screen.findByRole('button', { name: /Login with Discord/i });
    expect(buttonElement).toHaveClass('bg-discord-blue');
    expect(buttonElement).toHaveClass('hover:bg-discord-blue-dark');
    expect(buttonElement).toHaveClass('text-off-white');
    expect(buttonElement).toHaveClass('font-bold');
    expect(buttonElement).toHaveClass('py-2');
    expect(buttonElement).toHaveClass('px-4');
    expect(buttonElement).toHaveClass('rounded-md');
    expect(buttonElement).toHaveClass('flex');
    expect(buttonElement).toHaveClass('items-center');
  });
});
