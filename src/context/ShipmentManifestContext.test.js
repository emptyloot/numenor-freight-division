import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ManifestProvider, useManifest } from './ShipmentManifestContext';
import { useAuth } from './AuthContext';
import { useCargo } from './CargoContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';

// Mock the useAuth hook
jest.mock('./AuthContext');

jest.mock('./CargoContext');

// Mock Firestore
jest.mock('../firebase/firebase', () => ({
  firestore: {},
}));
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  addDoc: jest.fn(),
  collection: jest.fn(),
  serverTimestamp: jest.fn(),
}));

/**
 * @description A test component designed to consume and interact with the `ShipmentManifestContext`.
 * It renders parts of the manifest state and provides buttons to trigger context functions
 * like `updatePortField`, `updateCargoField`, `resetManifest`, and `handleScheduleShipment`.
 * @returns {object} (JSX.Element) A React component that provides UI for testing `ManifestContext` functionalities.
 */
const TestConsumer = () => {
  const { manifest, updatePortField, updateCargoField, resetManifest, handleScheduleShipment } = useManifest();

  return (
    <div>
      <div data-testid="port-0-name">{manifest.port[0].name}</div>
      <div data-testid="cargo-0-name">{manifest.cargo[0].name}</div>
      <button onClick={() => updatePortField(0, 'name', 'New Port')}>Update Port</button>
      <button onClick={() => updateCargoField(0, 'name', 'New Cargo')}>Update Cargo</button>
      <button onClick={() => resetManifest()}>Reset</button>
      <button onClick={handleScheduleShipment}>Schedule</button>
    </div>
  );
};

/**
 * @description Test suite for the `ShipmentManifestContext`, covering its state update functions and the shipment scheduling logic.
 */
describe('ShipmentManifestContext', () => {
  /**
   * @description Resets mocks before each test to ensure a clean and isolated testing environment. It mocks `useAuth` to return an authenticated user and clears any previous calls to Firestore mock functions.
   */
  beforeEach(() => {
    useAuth.mockReturnValue({ currentUser: { uid: 'test-user' } });
    useCargo.mockReturnValue({
      cargoTypes: [{ name: 'Gold' }, { name: 'Silver' }],
      findCargoByName: jest.fn(),
    });
    addDoc.mockClear();
    collection.mockClear();
    serverTimestamp.mockClear();
  });

  /**
   * @description Verifies that `updatePortField` correctly updates a field in a port object within the manifest state.
   */
  test('updatePortField updates the port field correctly', () => {
    render(
      <ManifestProvider>
        <TestConsumer />
      </ManifestProvider>
    );

    fireEvent.click(screen.getByText('Update Port'));

    expect(screen.getByTestId('port-0-name').textContent).toBe('New Port');
  });

  /**
   * @description Verifies that `updateCargoField` correctly updates a field in a cargo object within the manifest state.
   */
  test('updateCargoField updates the cargo field correctly', () => {
    render(
      <ManifestProvider>
        <TestConsumer />
      </ManifestProvider>
    );

    fireEvent.click(screen.getByText('Update Cargo'));

    expect(screen.getByTestId('cargo-0-name').textContent).toBe('New Cargo');
  });

  /**
   * @description Verifies that `resetManifest` correctly reverts the manifest state to its initial default values after it has been modified.
   */
  test('resetManifest resets the manifest to its initial state', () => {
    render(
      <ManifestProvider>
        <TestConsumer />
      </ManifestProvider>
    );

    fireEvent.click(screen.getByText('Update Port'));

    expect(screen.getByTestId('port-0-name').textContent).toBe('New Port');

    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByTestId('port-0-name').textContent).toBe('');
  });

  /**
   * @description Test suite for the `handleScheduleShipment` function, covering various validation scenarios and the success case.
   */
  describe('handleScheduleShipment', () => {
    /**
     * @description Verifies that `handleScheduleShipment` throws an error if no user is authenticated.
     */
    test('throws an error if user is not logged in', async () => {
      useAuth.mockReturnValue({ currentUser: null });
      let error;
      /**
       * @description A test component to safely trigger and catch errors from `handleScheduleShipment`.
       * @returns {object} (JSX.Element) A React component that provides a button to trigger `handleScheduleShipment` and displays any error.
       */
      const TestComponent = () => {
        const { handleScheduleShipment } = useManifest();
        /**
         * @description Asynchronously calls `handleScheduleShipment` and captures any thrown error.
         */
        const handleClick = async () => {
          try {
            await handleScheduleShipment();
          } catch (e) {
            error = e;
          }
        };
        return <button onClick={handleClick}>Schedule</button>;
      };
      render(
        <ManifestProvider>
          <TestComponent />
        </ManifestProvider>
      );

      await fireEvent.click(screen.getByText('Schedule'));

      expect(error.message).toBe('You must be logged in to schedule a shipment.');
    });

    /**
     * @description Verifies that `handleScheduleShipment` throws an error if the port coordinates are invalid (e.g., origin is 0,0).
     */
    test('throws an error for invalid port coordinates', async () => {
      let error;
      /**
       * @description A test component to safely trigger and catch errors from `handleScheduleShipment`.
       * @returns {object} (JSX.Element) A React component that provides a button to trigger `handleScheduleShipment` and displays any error.
       */
      const TestComponent = () => {
        const { handleScheduleShipment } = useManifest();
        /**
         * @description Asynchronously calls `handleScheduleShipment` and captures any thrown error.
         */
        const handleClick = async () => {
          try {
            await handleScheduleShipment();
          } catch (e) {
            error = e;
          }
        };
        return <button onClick={handleClick}>Schedule</button>;
      };
      render(
        <ManifestProvider>
          <TestComponent />
        </ManifestProvider>
      );

      await fireEvent.click(screen.getByText('Schedule'));

      expect(error.message).toBe('Port of Origin coordinates cannot be (0, 0).');
    });

    /**
     * @description Verifies that `handleScheduleShipment` throws an error if the origin and destination ports have the same coordinates.
     */
    test('throws an error if origin and destination are the same', async () => {
      let error;
      /**
       * @description A test component that sets identical coordinates for origin and destination ports before attempting to schedule a shipment.
       * @returns {object} (JSX.Element) A React component that provides buttons to set port coordinates and trigger `handleScheduleShipment`.
       */
      const TestComponent = () => {
        const { updatePortField, handleScheduleShipment } = useManifest();
        /**
         * @description Asynchronously calls `handleScheduleShipment` and captures any thrown error.
         */
        const handleClick = async () => {
          try {
            await handleScheduleShipment();
          } catch (e) {
            error = e;
          }
        };
        return (
          <div>
            <button
              onClick={() => {
                updatePortField(0, 'north', 10);
                updatePortField(0, 'east', 10);
                updatePortField(1, 'north', 10);
                updatePortField(1, 'east', 10);
              }}
            >
              Set Same Coordinates
            </button>
            <button onClick={handleClick}>Schedule</button>
          </div>
        );
      };

      render(
        <ManifestProvider>
          <TestComponent />
        </ManifestProvider>
      );

      fireEvent.click(screen.getByText('Set Same Coordinates'));

      await fireEvent.click(screen.getByText('Schedule'));

      expect(error.message).toBe('Port of Origin and Final Destination cannot be the same coordinates.');
    });

    /**
     * @description Verifies that `handleScheduleShipment` throws an error if the manifest contains no cargo items with a quantity greater than zero.
     */
    test('throws an error if there is no cargo', async () => {
      let error;
      /**
       * @description A test component that sets valid port coordinates but no cargo before attempting to schedule a shipment.
       * @returns {object} (JSX.Element) A React component that provides buttons to set port coordinates and trigger `handleScheduleShipment`.
       */
      const TestComponent = () => {
        const { updatePortField, handleScheduleShipment } = useManifest();
        /**
         * @description Asynchronously calls `handleScheduleShipment` and captures any thrown error.
         */
        const handleClick = async () => {
          try {
            await handleScheduleShipment();
          } catch (e) {
            error = e;
          }
        };
        return (
          <div>
            <button
              onClick={() => {
                updatePortField(0, 'north', 10);
                updatePortField(0, 'east', 10);
                updatePortField(1, 'north', 20);
                updatePortField(1, 'east', 20);
              }}
            >
              Set Coords
            </button>
            <button onClick={handleClick}>Schedule</button>
          </div>
        );
      };

      render(
        <ManifestProvider>
          <TestComponent />
        </ManifestProvider>
      );

      fireEvent.click(screen.getByText('Set Coords'));

      await fireEvent.click(screen.getByText('Schedule'));

      expect(error.message).toBe('At least one cargo item with a quantity greater than zero is required.');
    });

    /**
     * @description Verifies that `handleScheduleShipment` successfully calls Firestore's `addDoc` with the correct data when the manifest is valid.
     */
    test('successfully schedules a shipment', async () => {
      /**
       * @description A test component that populates the manifest with valid data before scheduling a shipment.
       * @returns {object} (JSX.Element) A React component that provides buttons to fill the form and trigger `handleScheduleShipment`.
       */
      const TestComponent = () => {
        const { updatePortField, updateCargoField, handleScheduleShipment } = useManifest();
        return (
          <div>
            <button
              onClick={() => {
                updatePortField(0, 'north', 10);
                updatePortField(0, 'east', 10);
                updatePortField(1, 'north', 20);
                updatePortField(1, 'east', 20);
                updateCargoField(0, 'name', 'Gold');
                updateCargoField(0, 'quantity', 100);
              }}
            >
              Fill Form
            </button>
            <button onClick={handleScheduleShipment}>Schedule</button>
          </div>
        );
      };

      addDoc.mockResolvedValue({ id: 'test-doc-id' });
      collection.mockReturnValue({});

      render(
        <ManifestProvider>
          <TestComponent />
        </ManifestProvider>
      );

      fireEvent.click(screen.getByText('Fill Form'));

      await fireEvent.click(screen.getByText('Schedule'));

      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(collection).toHaveBeenCalledWith(firestore, 'shipments');
      expect(serverTimestamp).toHaveBeenCalledTimes(1);
    });
  });
});
