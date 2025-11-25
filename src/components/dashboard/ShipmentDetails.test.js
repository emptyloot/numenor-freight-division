import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShipmentDetails from './ShipmentDetails';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import { useParams, useNavigate } from 'react-router-dom';
import * as firestore from 'firebase/firestore';

// Mock dependencies
jest.mock('../../firebase/firebase');
jest.mock('../../context/AuthContext');
jest.mock('../../context/DashboardContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  getFirestore: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockUpdateShipment = jest.fn();

const mockShipment = {
  id: 'ship123',
  status: 'in-transit',
  paid: false,
  port: [
    { north: '321', east: '654' },
    { north: '123', east: '456' },
  ],
  createdAt: {
    /** @returns {Date} A Date object representing the creation date. */
    toDate: () => new Date('2023-10-28T12:00:00Z'),
  },
  driverId: null,
  driverName: null,
};

describe('ShipmentDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    useParams.mockReturnValue({ shipmentId: 'ship123' });
    useNavigate.mockReturnValue(mockNavigate);
    useDashboard.mockReturnValue({ updateShipment: mockUpdateShipment });
    useAuth.mockReturnValue({ currentUser: null });
  });

  afterAll(() => {
    jest.restoreAllMocks(); // Cleans up after tests finish
  });

  test('displays loading message initially', () => {
    firestore.onSnapshot.mockImplementation(() => () => {}); // No immediate callback
    render(<ShipmentDetails />);
    expect(screen.getByText(/Loading shipment details.../i)).toBeInTheDocument();
  });

  test('displays error message on fetch failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorMessage = 'Failed to load shipment details.';
    firestore.onSnapshot.mockImplementation((ref, success, error) => {
      error(new Error(errorMessage));
      return () => {};
    });
    render(<ShipmentDetails />);
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('displays "shipment not found" message', async () => {
    firestore.onSnapshot.mockImplementation((ref, callback) => {
      callback({
        /** @returns {boolean} Always returns false, indicating the document does not exist. */
        exists: () => false,
      });
      return () => {};
    });
    render(<ShipmentDetails />);
    await waitFor(() => {
      expect(screen.getByText(/Shipment not found/i)).toBeInTheDocument();
    });
  });

  test('renders shipment details for a regular user', async () => {
    useAuth.mockReturnValue({ currentUser: { role: 'user' } });
    firestore.onSnapshot.mockImplementation((ref, callback) => {
      callback({
        /** @returns {boolean} Always returns true, indicating the document exists. */
        exists: () => true,
        id: 'ship123',
        /** @returns {object} The mock shipment data. */
        data: () => mockShipment,
      });
      return () => {};
    });

    render(<ShipmentDetails />);

    await waitFor(() => {
      expect(screen.getByText(/Shipment Details/i)).toBeInTheDocument();
    });
    expect(screen.getByText('ID:')).toBeInTheDocument();
    expect(screen.getByText('ship123')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('in-transit')).toBeInTheDocument();
    expect(screen.getByText('Paid:')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();

    // Regular users should not see update forms or assignment buttons
    expect(screen.queryByText(/Update Shipment/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Assign to Self/i })).not.toBeInTheDocument();
  });

  test('allows a driver to see update form and assign themselves', async () => {
    useAuth.mockReturnValue({ currentUser: { role: 'driver', uid: 'driver1', global_name: 'Test Driver' } });
    firestore.onSnapshot.mockImplementation((ref, callback) => {
      callback({
        /** @returns {boolean} Always returns true, indicating the document exists. */
        exists: () => true,
        id: 'ship123',
        /** @returns {object} The mock shipment data. */
        data: () => mockShipment,
      });
      return () => {};
    });

    render(<ShipmentDetails />);

    await waitFor(() => {
      expect(screen.getByText(/Update Shipment/i)).toBeInTheDocument();
    });

    // Driver can assign themselves if unassigned
    const assignButton = screen.getByRole('button', { name: /Assign to Self/i });
    expect(assignButton).toBeInTheDocument();

    fireEvent.click(assignButton);
    await waitFor(() => {
      expect(mockUpdateShipment).toHaveBeenCalledWith('ship123', {
        driverId: 'driver1',
        driverName: 'Test Driver',
      });
    });

    // Driver should not see "Mark as Paid" or "Unassign" button
    expect(screen.queryByLabelText(/Mark as Paid/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Unassign Driver/i })).not.toBeInTheDocument();
  });

  test('allows staff to update all fields and manage assignments', async () => {
    useAuth.mockReturnValue({ currentUser: { role: 'staff' } });
    const assignedShipment = { ...mockShipment, driverId: 'driver1', driverName: 'Test Driver' };
    firestore.onSnapshot.mockImplementation((ref, callback) => {
      callback({
        /** @returns {boolean} Always returns true, indicating the document exists. */
        exists: () => true,
        id: 'ship123',
        /** @returns {object} The assigned shipment data. */
        data: () => assignedShipment,
      });
      return () => {};
    });

    render(<ShipmentDetails />);

    await waitFor(() => {
      expect(screen.getByText(/Update Shipment/i)).toBeInTheDocument();
    });

    // Staff should see the "Unassign Driver" button for an assigned shipment
    const unassignButton = screen.getByRole('button', { name: /Unassign Driver/i });
    expect(unassignButton).toBeInTheDocument();
    fireEvent.click(unassignButton);
    await waitFor(() => {
      expect(mockUpdateShipment).toHaveBeenCalledWith('ship123', { driverId: null, driverName: null });
    });

    // Staff can see and use the "Mark as Paid" check box
    const paidCheckBox = screen.getByLabelText(/Mark as Paid/i);
    expect(paidCheckBox).toBeInTheDocument();
    fireEvent.click(paidCheckBox); // It starts as false, so this checks it

    // Staff can change status
    const statusSelect = screen.getByLabelText(/Status/i);
    fireEvent.change(statusSelect, { target: { value: 'delivered' } });

    // Staff can submit changes
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateShipment).toHaveBeenCalledWith('ship123', {
        status: 'delivered',
        paid: true,
      });
    });
  });

  test('handles form submission failure', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const updateError = new Error('Update failed');
    mockUpdateShipment.mockRejectedValue(updateError);
    useAuth.mockReturnValue({ currentUser: { role: 'staff' } });
    firestore.onSnapshot.mockImplementation((ref, callback) => {
      callback({
        /** @returns {boolean} Always returns true, indicating the document exists. */
        exists: () => true,
        id: 'ship123',
        /** @returns {object} The mock shipment data. */
        data: () => mockShipment,
      });
      return () => {};
    });

    render(<ShipmentDetails />);

    await waitFor(() => {
      expect(screen.getByText(/Update Shipment/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(`Error: ${updateError.message}`);
    });

    alertSpy.mockRestore();
  });

  test('navigates back when "Back to Dashboard" is clicked', async () => {
    useAuth.mockReturnValue({ currentUser: { role: 'user' } });
    firestore.onSnapshot.mockImplementation((ref, callback) => {
      callback({
        /** @returns {boolean} Always returns true, indicating the document exists. */
        exists: () => true,
        id: 'ship123',
        /** @returns {object} The mock shipment data. */
        data: () => mockShipment,
      });
      return () => {};
    });

    render(<ShipmentDetails />);

    await waitFor(() => {
      expect(screen.getByText(/Shipment Details/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Back to Dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('staff can see "cancelled" option in status drop down', async () => {
    useAuth.mockReturnValue({ currentUser: { role: 'staff' } });
    firestore.onSnapshot.mockImplementation((ref, callback) => {
      callback({
        /** @returns {boolean} Always returns true, indicating the document exists. */
        exists: () => true,
        id: 'ship123',
        /** @returns {object} The mock shipment data. */
        data: () => mockShipment,
      });
      return () => {};
    });

    render(<ShipmentDetails />);

    await waitFor(() => {
      expect(screen.getByText(/Update Shipment/i)).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText(/Status/i);
    expect(statusSelect).toBeInTheDocument();

    // Check for the 'Cancelled' option within the select element
    const cancelledOption = screen.getByRole('option', { name: 'Cancelled' });
    expect(cancelledOption).toBeInTheDocument();
  });

  test('driver cannot see "cancelled" option in status drop down', async () => {
    useAuth.mockReturnValue({ currentUser: { role: 'driver' } });
    firestore.onSnapshot.mockImplementation((ref, callback) => {
      callback({
        /** @returns {boolean} Always returns true, indicating the document exists. */
        exists: () => true,
        id: 'ship123',
        /** @returns {object} The mock shipment data. */
        data: () => mockShipment,
      });
      return () => {};
    });

    render(<ShipmentDetails />);

    await waitFor(() => {
      expect(screen.getByText(/Update Shipment/i)).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText(/Status/i);
    expect(statusSelect).toBeInTheDocument();

    // The 'Cancelled' option should not be present for drivers
    const cancelledOption = screen.queryByRole('option', { name: 'Cancelled' });
    expect(cancelledOption).not.toBeInTheDocument();
  });
});
