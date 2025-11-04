import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { useAuth } from './AuthContext';
import { onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';

// Mock dependencies
jest.mock('./AuthContext');
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  getFirestore: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
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
/**
 * @description A test component for `updateShipment` function. It provides a button to trigger the update
 *              and displays any error that occurs during the update process.
 * @param {object} root0 - The props object.
 * @param {string} root0.shipmentId - The ID of the shipment to update.
 * @param {object} root0.updates - An object containing the fields to update.
 * @param {string} root0.role - The role of the current user for testing authorization.
 * @returns {React.ReactElement} A component for testing shipment updates.
 */
const TestConsumerForUpdates = ({ shipmentId, updates, role }) => {
  const { updateShipment } = useDashboard();
  const [updateError, setUpdateError] = React.useState(null);

  /**
   *
   */
  const handleUpdate = async () => {
    try {
      await updateShipment(shipmentId, updates);
    } catch (e) {
      setUpdateError(e);
    }
  };

  React.useEffect(() => {
    if (role) {
      handleUpdate();
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <button data-testid="update-button" onClick={handleUpdate}>
        Update
      </button>
      <div data-testid="update-error">{updateError ? updateError.message : 'null'}</div>
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

    // Mock the chaining behavior of firestore query functions.
    // This allows `where` clauses to be added to the query object.
    query.mockImplementation((_collection, ...constraints) => {
      return { _query: { constraints: constraints || [] } };
    });

    where.mockImplementation((field, op, value) => {
      return { _field: field, _op: op, _value: value };
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

  describe('updateShipment', () => {
    const shipmentId = 'ship-to-update-1';
    const mockShipmentRef = { type: 'DocumentReference' };

    beforeEach(() => {
      // Mock doc to return a reference object
      doc.mockReturnValue(mockShipmentRef);
      // Reset updateDoc mock call history
      updateDoc.mockClear();
    });

    // --- Authorization Tests ---

    test('throws an error if the user is not authenticated', async () => {
      useAuth.mockReturnValue({ currentUser: null });

      render(
        <DashboardProvider>
          <TestConsumerForUpdates shipmentId={shipmentId} updates={{ status: 'in-transit' }} />
        </DashboardProvider>
      );

      act(() => {
        screen.getByTestId('update-button').click();
      });

      await waitFor(() =>
        expect(screen.getByTestId('update-error')).toHaveTextContent('You are not authorized to perform this action.')
      );
      expect(updateDoc).not.toHaveBeenCalled();
    });

    test('throws an error if the user role is not "staff" or "driver" (e.g., a client)', async () => {
      useAuth.mockReturnValue({ currentUser: { uid: 'client-123', role: 'client' } });

      render(
        <DashboardProvider>
          <TestConsumerForUpdates shipmentId={shipmentId} updates={{ status: 'in-transit' }} />
        </DashboardProvider>
      );

      act(() => {
        screen.getByTestId('update-button').click();
      });

      await waitFor(() =>
        expect(screen.getByTestId('update-error')).toHaveTextContent('You are not authorized to perform this action.')
      );
      expect(updateDoc).not.toHaveBeenCalled();
    });

    // --- Driver Role Tests ---

    test('driver can only update the "status" field', async () => {
      useAuth.mockReturnValue({ currentUser: { uid: 'driver-123', role: 'driver' } });
      const updates = { status: 'Delivered', paid: true, secretField: 'test' };

      render(
        <DashboardProvider>
          <TestConsumerForUpdates shipmentId={shipmentId} updates={updates} role="driver" />
        </DashboardProvider>
      );

      await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
      expect(updateDoc).toHaveBeenCalledWith(mockShipmentRef, { status: 'Delivered' });
    });

    test('driver can assign themselves using "driverId" and "driverName"', async () => {
      useAuth.mockReturnValue({ currentUser: { uid: 'driver-123', role: 'driver' } });
      const updates = { driverId: 'driver-123', driverName: 'John Doe', paid: true };

      render(
        <DashboardProvider>
          <TestConsumerForUpdates shipmentId={shipmentId} updates={updates} role="driver" />
        </DashboardProvider>
      );

      await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
      // Only driverId and driverName should be allowed
      expect(updateDoc).toHaveBeenCalledWith(mockShipmentRef, {
        driverId: 'driver-123',
        driverName: 'John Doe',
      });
    });

    // --- Staff Role Tests ---

    test('staff can update "status" and "paid" fields, ignoring others', async () => {
      useAuth.mockReturnValue({ currentUser: { uid: 'staff-123', role: 'staff' } });
      const updates = { status: 'Received', paid: true, secretField: 'test' };

      render(
        <DashboardProvider>
          <TestConsumerForUpdates shipmentId={shipmentId} updates={updates} role="staff" />
        </DashboardProvider>
      );

      await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
      expect(updateDoc).toHaveBeenCalledWith(mockShipmentRef, {
        status: 'Received',
        paid: true,
      });
    });

    test('staff can update "driverId" and "driverName"', async () => {
      useAuth.mockReturnValue({ currentUser: { uid: 'staff-123', role: 'staff' } });
      const updates = { driverId: 'another-driver-456', driverName: 'Jane Smith' };

      render(
        <DashboardProvider>
          <TestConsumerForUpdates shipmentId={shipmentId} updates={updates} role="staff" />
        </DashboardProvider>
      );

      await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
      expect(updateDoc).toHaveBeenCalledWith(mockShipmentRef, {
        driverId: 'another-driver-456',
        driverName: 'Jane Smith',
      });
    });
  });
});
