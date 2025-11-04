import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { useAuth } from './AuthContext';
import { onSnapshot } from 'firebase/firestore';

// Mock dependencies
jest.mock('./AuthContext');
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  getFirestore: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
}));

/**
 * @description A simple test component to consume and display the context's values.
 * @returns {React.ReactElement} A component that displays dashboard state.
 */
const TestConsumer = () => {
  const { shipments, loading, error } = useDashboard();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="error">{error ? error.message : 'null'}</div>
      <div data-testid="shipments">{JSON.stringify(shipments)}</div>
    </div>
  );
};

describe('DashboardContext', () => {
  let onSnapshotSuccessCallback;
  let onSnapshotErrorCallback;
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Capture the onSnapshot callbacks to simulate Firestore events
    onSnapshot.mockImplementation((query, success, error) => {
      onSnapshotSuccessCallback = success;
      onSnapshotErrorCallback = error;
      return mockUnsubscribe; // Return a mock unsubscribe function
    });
  });

  test('provides a loading state and empty shipments for unauthenticated users', () => {
    useAuth.mockReturnValue({ currentUser: null });

    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('null');
    expect(screen.getByTestId('shipments')).toHaveTextContent('[]');
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  test('fetches and sets shipments correctly on successful data snapshot', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'test-user-123' } });

    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    const mockSnapshot = {
      docs: [
        {
          id: 'ship1',
          /**
           * @description Mocks the Firestore Timestamp toDate method.
           * @returns {Date} A mock Date object.
           */
          data: () => ({
            port: [{}, { north: 10, east: 20 }],
            createdAt: {
              /**
               * @description Mocks the Firestore Timestamp toDate method.
               * @returns {Date} A mock Date object.
               */
              toDate: () => new Date('2023-01-01T12:00:00Z'),
            },
            status: 'In Transit',
          }),
        },
      ],
    };

    // Simulate Firestore sending data
    await act(async () => {
      onSnapshotSuccessCallback(mockSnapshot);
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('error')).toHaveTextContent('null');
    const shipments = JSON.parse(screen.getByTestId('shipments').textContent);
    expect(shipments).toHaveLength(1);
    expect(shipments[0].id).toBe('ship1');
    expect(shipments[0].destination).toBe('North:10 East:20');
    expect(shipments[0].currentStatus).toBe('In Transit');
    expect(new Date(shipments[0].lastUpdated)).toEqual(new Date('2023-01-01T12:00:00Z'));
  });

  test('handles errors during shipment fetching', async () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'test-user-123' } });
    const mockError = new Error('Permission denied');

    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>
    );

    // Simulate Firestore returning an error
    await act(async () => {
      onSnapshotErrorCallback(mockError);
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('error')).toHaveTextContent('Permission denied');
    expect(screen.getByTestId('shipments')).toHaveTextContent('[]');
  });

  test('unsubscribes from snapshot listener on unmount', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'test-user-123' } });
    const { unmount } = render(<DashboardProvider />);

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
