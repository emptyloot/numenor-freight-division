import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import { auth } from '../../firebase/firebase';

/**
 * @description Renders the details view for a specific shipment.
 * It retrieves the shipment ID from the URL parameters, finds the corresponding
 * shipment in the global dashboard context, and initializes local state for
 * editing status and payment fields.
 * @returns {object} The rendered shipment details component.
 */
const ShipmentDetails = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { shipments, loading, error, updateShipment } = useDashboard();

  // Find the specific shipment from the context
  const shipment = shipments.find((s) => s.id === shipmentId);

  // State for the form inputs
  const [status, setStatus] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  // Effect to initialize/update form state when shipment data is available/changes
  useEffect(() => {
    if (shipment) {
      setStatus(shipment.status || 'scheduled');
      setIsPaid(shipment.paid || false);
    }
  }, [shipment]);

  /**
   * @description Handles the form submission to update the shipment's status and payment state.
   * Prevents the default form behavior and triggers an alert upon success or failure.
   * @param {Event} e - The form submission event.
   */
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateShipment(shipmentId, { status, paid: isPaid });
      alert('Shipment updated successfully!');
    } catch (err) {
      console.error('Failed to update shipment:', err);
      alert(`Error: ${err.message}`);
    }
  };

  /**
   * @description Assigns the currently logged-in user as the driver for the shipment.
   * Validates that the user has the 'driver' or 'staff' role before proceeding.
   */
  const handleAssignToSelf = async () => {
    if (!['driver', 'staff'].includes(currentUser.role)) {
      alert('Only drivers or staff can assign shipments.');
      return;
    }
    try {
      await updateShipment(shipmentId, {
        driverId: currentUser.uid,
        driverName: currentUser.global_name,
      });
      alert('You have been assigned as the driver for this shipment!');
    } catch (err) {
      console.error('Failed to assign shipment:', err);
      alert(`Error: ${err.message}`);
    }
  };

  /**
   * @description Removes the currently assigned driver from the shipment.
   * This action is restricted to users with the 'staff' role.
   */
  const handleUnassignDriver = async () => {
    if (currentUser.role !== 'staff') {
      alert('Only staff can unassign drivers.');
      return;
    }
    try {
      await updateShipment(shipmentId, { driverId: null, driverName: null });
      alert('The driver has been unassigned from this shipment.');
    } catch (err) {
      console.error('Failed to unassign driver:', err);
      alert(`Error: ${err.message}`);
    }
  };

  /**
   * @description Initiates a request to cancel the shipment via the backend API.
   * It retrieves the current user's auth token for verification and sends a POST request
   * to '/api/shipment/cancel' rather than updating Firestore directly.
   */
  const handleCancel = async () => {
    if (!shipmentId) return;

    try {
      if (!auth.currentUser) {
        alert('You must be logged in.');
        return;
      }
      const token = await auth.currentUser.getIdToken();

      const response = await fetch('/api/shipment/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documentId: shipmentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel');
      }

      alert('Shipment cancelled!');
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    }
  };

  if (loading) return <div className="text-center p-4">Loading shipment details...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error.message}</div>;
  if (!shipment) {
    return <div className="text-center p-4 text-red-500">Shipment not found.</div>;
  }

  const canUpdate = currentUser && ['staff', 'driver'].includes(currentUser.role);
  const canCancel =
    !shipment.driverId &&
    currentUser.uid === shipment.userId &&
    shipment.status !== 'cancelled' &&
    shipment.status !== 'delivered';

  return (
    <main className="container mx-auto p-4 text-off-white">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-400 hover:underline">
        &larr; Back to Dashboard
      </button>
      <div className="bg-white rounded-lg shadow-md p-6 text-gray-800">
        <h1 className="text-2xl font-bold mb-4">Shipment Details</h1>
        <p>
          <span className="font-semibold">ID:</span> {shipment.id}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {shipment.status}
        </p>
        <p>
          <span className="font-semibold">Quote:</span> {shipment.quote} Hex
        </p>
        <p>
          <span className="font-semibold">Paid:</span> {shipment.paid ? 'Yes' : 'No'}
        </p>
        <p>
          <span className="font-semibold">Origin:</span> Name:{shipment.port[0].name} North:{shipment.port[0].north}{' '}
          East:
          {shipment.port[0].east}
        </p>
        <p>
          <span className="font-semibold">Destination:</span> Name:{shipment.port[1].name} North:
          {shipment.port[1].north} East:
          {shipment.port[1].east}
        </p>
        <p>
          <span className="font-semibold">Created:</span> {shipment.createdAt?.toDate().toLocaleString()}
        </p>
        <p>
          <span className="font-semibold">Driver:</span> {shipment.driverName || 'Unassigned'}
        </p>
        {(currentUser.role === 'staff' || currentUser.role === 'driver') && (
          <p>
            <span className="font-semibold">Client:</span> {shipment.client || 'Unassigned'}
          </p>
        )}
        <div className="mt-4 border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Cargo Manifest</h2>
          {shipment.cargo && shipment.cargo.filter((item) => item.name && item.quantity > 0).length > 0 ? (
            <ul className="list-disc list-inside">
              {shipment.cargo
                .filter((item) => item.name && item.quantity > 0)
                .map((item, index) => (
                  <li key={index}>{`${item.name}: ${item.quantity} units`}</li>
                ))}
            </ul>
          ) : (
            <p>No cargo listed for this shipment.</p>
          )}
        </div>
        {canUpdate && !shipment.driverId && (
          <button
            onClick={handleAssignToSelf}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Assign to Self
          </button>
        )}
        {currentUser.role === 'staff' && shipment.driverId && (
          <button
            onClick={handleUnassignDriver}
            className="mt-4 ml-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Unassign Driver
          </button>
        )}
        {canCancel && (
          <button onClick={handleCancel} className="mt-4 ml-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Cancel Shipment
          </button>
        )}
        {canUpdate && (
          <form onSubmit={handleUpdate} className="mt-6 border-t pt-4">
            <h2 className="text-xl font-bold mb-2">Update Shipment</h2>
            <div className="mb-4">
              <label htmlFor="status" className="block font-semibold mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border rounded text-gray-800"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                {currentUser.role === 'staff' && <option value="cancelled">Cancelled</option>}
              </select>
            </div>
            {currentUser.role === 'staff' && (
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox" //eslint-disable-line
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="mr-2"
                  />
                  Mark as Paid
                </label>
              </div>
            )}
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Save Changes
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ShipmentDetails;
