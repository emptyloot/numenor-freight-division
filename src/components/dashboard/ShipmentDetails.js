import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';

/**
 * @description Displays the detailed information of a specific shipment, identified by its ID from the URL parameters.
 *              It fetches real-time shipment data from Firestore and allows authorized users (staff, drivers)
 *              to update the shipment's status and payment status.
 * @returns {object} {JSX.Element} The rendered shipment details page with an update form if applicable.
 */
const ShipmentDetails = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { updateShipment } = useDashboard();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the form inputs
  const [status, setStatus] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    setLoading(true);
    const shipmentRef = doc(firestore, 'shipments', shipmentId);

    const unsubscribe = onSnapshot(
      shipmentRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setShipment({ id: docSnap.id, ...data });
          // Initialize form state when data is fetched
          setStatus(data.status);
          setIsPaid(data.paid);
        } else {
          setError('Shipment not found.');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching shipment details:', err);
        setError('Failed to load shipment details.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [shipmentId]);

  /**
   * @param {object} e - The event object from the form submission.
   * @description Handles the submission of the update form. It prevents the default form submission,
   *              calls the `updateShipment` function from `DashboardContext` with the `shipmentId`
   *              and the new `status` and `paid` values. It provides user feedback via alerts.
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
   * @description Allows a driver to assign themselves to the current shipment.
   *              This function is only callable by users with the 'driver' or 'staff' role.
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
   * @description Allows a staff member to remove an assignment of a driver from the current shipment.
   *              This function is only callable by users with the 'staff' role.
   */
  const handleUnassignDriver = async () => { //eslint-disable-line
    if (currentUser.role !== 'staff') {
      alert('Only staff can unassign drivers.'); //eslint-disable-line
      return;
    }
    try {
      await updateShipment(shipmentId, { driverId: null, driverName: null });
      alert('The driver has been unassigned from this shipment.');
    } catch (err) {
      console.error('Failed to unassign driver:', err); //eslint-disable-line
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="text-center p-4">Loading shipment details...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (!shipment) return null;

  const canUpdate = currentUser && ['staff', 'driver'].includes(currentUser.role);

  return (
    <main className="container mx-auto p-4 text-[#EDF2F4]">
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
        {/* Cargo Manifest Display */}
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
        {/* Assign to Self Button */}
        {canUpdate && !shipment.driverId && (
          <button
            onClick={handleAssignToSelf}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Assign to Self
          </button>
        )}

        {/* Remove an assignment of Driver Button for Staff */}
        {currentUser.role === 'staff' && shipment.driverId && (
          <button
            onClick={handleUnassignDriver} //eslint-disable-line
            className="mt-4 ml-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Unassign Driver
          </button>
        )}

        {/* Update Form for Staff and Drivers */}
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
                {
                currentUser.role === 'staff' && <option value="cancelled">Cancelled</option> //eslint-disable-line
                }
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
