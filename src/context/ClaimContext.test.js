import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { ClaimProvider, useClaims } from './ClaimContext';
import normalizeString from '../utils/Helper';

jest.mock('axios');
jest.mock('../utils/Helper');

/**
 * @description A test component that consumes the `ClaimContext` and displays its state for testing purposes.
 * @returns {object} A React component displaying claims data, loading, error, and search results.
 */
const MockClaimConsumer = () => {
  const { claims, count, loading, error, findClaimByName, getClaimLocation } = useClaims();
  const foundClaim = findClaimByName('Test Claim');
  const location = getClaimLocation(foundClaim[0]);

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error ? error.message : ''}</div>
      <div data-testid="claims">{JSON.stringify(claims)}</div>
      <div data-testid="count">{count}</div>
      <div data-testid="found-claim">{JSON.stringify(foundClaim)}</div>
      <div data-testid="claim-location">{JSON.stringify(location)}</div>
    </div>
  );
};

describe('ClaimProvider', () => {
  const mockClaims = [
    { name: 'Test Claim', locationX: 30, locationZ: 60 },
    { name: 'Another Claim', locationX: 90, locationZ: 120 },
  ];

  beforeEach(() => {
    axios.get.mockClear();
    normalizeString.mockClear();
    // Mock normalizeString to return the lowercased string for predictable filtering
    normalizeString.mockImplementation((text) => text.toLowerCase());
  });

  it('fetches and provides claims and count on successful load', async () => {
    axios.get.mockResolvedValueOnce({ data: { claims: mockClaims, count: mockClaims.length } });

    render(
      <ClaimProvider>
        <MockClaimConsumer />
      </ClaimProvider>
    );

    // Initial state should be loading
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // After fetch, loading should be false and data should be present
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('claims').textContent).toBe(JSON.stringify(mockClaims));
    expect(screen.getByTestId('count').textContent).toBe(String(mockClaims.length));
    expect(screen.getByTestId('error').textContent).toBe('');
  });

  it('handles errors during fetch', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorMessage = 'Failed to fetch';
    axios.get.mockRejectedValueOnce(new Error(errorMessage));

    render(
      <ClaimProvider>
        <MockClaimConsumer />
      </ClaimProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('error').textContent).toBe(errorMessage);
    expect(screen.getByTestId('claims').textContent).toBe('[]');
    expect(screen.getByTestId('count').textContent).toBe('0');
    consoleSpy.mockRestore();
  });

  it('finds a claim by name and gets its location', async () => {
    axios.get.mockResolvedValueOnce({ data: { claims: mockClaims, count: mockClaims.length } });

    render(
      <ClaimProvider>
        <MockClaimConsumer />
      </ClaimProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Test findClaimByName
    expect(screen.getByTestId('found-claim').textContent).toBe(JSON.stringify([mockClaims[0]]));

    // Test getClaimLocation
    const expectedLocation = { name: 'Test Claim', north: 20, east: 10 };
    expect(screen.getByTestId('claim-location').textContent).toBe(JSON.stringify(expectedLocation));
  });

  it('returns null from getClaimLocation if claim is invalid', async () => {
    axios.get.mockResolvedValueOnce({ data: { claims: [{ name: 'Incomplete' }], count: 1 } });
    render(
      <ClaimProvider>
        <MockClaimConsumer />
      </ClaimProvider>
    );
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('claim-location').textContent).toBe('null');
  });
});
