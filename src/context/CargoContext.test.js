import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { CargoProvider, useCargo } from './CargoContext';
import normalizeString from '../utils/Helper';

jest.mock('axios');
jest.mock('../utils/Helper');

/**
 * @description A test component that consumes the `CargoContext` and displays its state for testing purposes.
 * @returns {object} A React component displaying cargo data, loading, error, and search results.
 */
const MockCargoConsumer = () => {
  const { cargoTypes, loading, error, findCargoByName } = useCargo();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error ? error.message : ''}</div>
      <div data-testid="cargo-types">{JSON.stringify(cargoTypes)}</div>
      <div data-testid="found-cargo">{JSON.stringify(findCargoByName('Test Cargo'))}</div>
    </div>
  );
};

describe('CargoProvider', () => {
  beforeEach(() => {
    axios.get.mockClear();
    normalizeString.mockClear();
  });

  it('fetches and provides cargo types', async () => {
    const mockCargo = [{ name: 'Test Cargo' }, { name: 'Another Cargo' }];
    axios.get.mockResolvedValueOnce({ data: { cargo: mockCargo } });
    normalizeString.mockImplementation((text) => text);

    render(
      <CargoProvider>
        <MockCargoConsumer />
      </CargoProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('cargo-types').textContent).toBe(JSON.stringify(mockCargo));
    expect(screen.getByTestId('error').textContent).toBe('');
  });

  it('handles errors during fetch', async () => {
    const errorMessage = 'Network Error';
    axios.get.mockRejectedValueOnce(new Error(errorMessage));

    render(
      <CargoProvider>
        <MockCargoConsumer />
      </CargoProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('error').textContent).toBe(errorMessage);
    expect(screen.getByTestId('cargo-types').textContent).toBe('[]');
  });

  it('finds cargo by name', async () => {
    const mockCargo = [{ name: 'Test Cargo' }, { name: 'Another Cargo' }];
    axios.get.mockResolvedValueOnce({ data: { cargo: mockCargo } });
    normalizeString.mockImplementation((text) => text.toLowerCase());

    render(
      <CargoProvider>
        <MockCargoConsumer />
      </CargoProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cargo-types').textContent).toBe(JSON.stringify(mockCargo));
    });

    expect(screen.getByTestId('found-cargo').textContent).toBe(JSON.stringify([mockCargo[0]]));
  });
});
