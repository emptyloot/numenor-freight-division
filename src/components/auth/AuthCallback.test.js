import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import axios from 'axios';
import AuthCallback from './AuthCallback';
import { auth } from '../../firebase/firebase';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  signInWithCustomToken: jest.fn(),
}));

jest.mock('axios');

jest.mock('../../firebase/firebase', () => ({
  auth: {}, // Mock the auth object
}));

describe('AuthCallback', () => {
  const mockNavigate = jest.fn();
  const mockUseLocation = useLocation;
  const mockSignInWithCustomToken = signInWithCustomToken;
  const mockAxiosPost = axios.post;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    // Mock console.error to avoid polluting test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should render loading text initially', () => {
    mockUseLocation.mockReturnValue({ search: '' });
    render(<AuthCallback />);
    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument();
  });

  it('should do nothing if no code is present in the URL', () => {
    mockUseLocation.mockReturnValue({ search: '?foo=bar' });
    render(<AuthCallback />);
    expect(mockAxiosPost).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle successful authentication and redirect to home', async () => {
    const mockCode = 'test_code_123';
    const mockFirebaseToken = 'test_firebase_token';
    mockUseLocation.mockReturnValue({ search: `?code=${mockCode}` });
    mockAxiosPost.mockResolvedValue({
      data: { firebaseToken: mockFirebaseToken },
    });
    mockSignInWithCustomToken.mockResolvedValue({ user: { uid: '123' } });

    render(<AuthCallback />);

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith(expect.stringContaining('/api/auth/discord'), { code: mockCode });
    });

    await waitFor(() => {
      expect(mockSignInWithCustomToken).toHaveBeenCalledWith(auth, mockFirebaseToken);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should handle backend API failure and redirect to error page', async () => {
    const mockCode = 'test_code_456';
    mockUseLocation.mockReturnValue({ search: `?code=${mockCode}` });
    const apiError = new Error('API request failed');
    mockAxiosPost.mockRejectedValue(apiError);

    render(<AuthCallback />);

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith(expect.stringContaining('/api/auth/discord'), { code: mockCode });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login-error');
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Authentication failed:', apiError); // Separate assertion
    });

    expect(mockSignInWithCustomToken).not.toHaveBeenCalled();
  });

  it('should handle Firebase sign-in failure and redirect to error page', async () => {
    const mockCode = 'test_code_789';
    const mockFirebaseToken = 'test_firebase_token_fail';
    mockUseLocation.mockReturnValue({ search: `?code=${mockCode}` });
    mockAxiosPost.mockResolvedValue({
      data: { firebaseToken: mockFirebaseToken },
    });
    const firebaseError = new Error('Firebase sign-in failed');
    mockSignInWithCustomToken.mockRejectedValue(firebaseError);

    render(<AuthCallback />);

    await waitFor(() => {
      expect(mockSignInWithCustomToken).toHaveBeenCalledWith(auth, mockFirebaseToken);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login-error');
    });
    expect(console.error).toHaveBeenCalledWith('Authentication failed:', firebaseError);
  });
});
