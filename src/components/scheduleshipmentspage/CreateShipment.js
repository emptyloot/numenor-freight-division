import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManifest } from '../../context/ShipmentManifestContext';
import Calculator from '../../utils/Calculator';
import InputLocation from '../inputLocation/InputLocation';
import InputCargo from './InputCargo';

/**
@description Renders the protected page for scheduling a new shipment.
 This component displays the main "Shipment Manifest" form where
 logged-in users can enter route, port, and cargo details to commission
 a new delivery.
 @returns {object} (JSX.element) React component for the shipment creation page.
 */
function CreateShipment() {
  const { manifest } = useManifest();
  const [quote, setQuote] = useState(0);
  const { handleScheduleShipment } = useManifest();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * @description Handles the form submission for creating a new shipment. It prevents the default
   * form action, sets the loading state, and calls the `handleScheduleShipment` function from the
   * manifest context. On success, it navigates to the dashboard. On failure, it captures and
   * displays an error message.
   * @param {object} e The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await handleScheduleShipment();
      // Optional: Redirect to a success page or the user's dashboard
      navigate('/dashboard');
    } catch (err) {
      // Here we catch the errors thrown from handleScheduleShipment
      console.error('Failed to schedule shipment:', err.message);
      setError(err.message); // Set the error message to display to the user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Calculate the quote whenever the manifest (start/end locations) changes
    const hexCost = Calculator(manifest);
    setQuote(hexCost);
  }, [manifest]);

  return (
    <main className="container mx-auto p-4 text-center text-[#EDF2F4]">
      <div className="max-w-2xl mx-auto">
        <h1>Commission a Voyage</h1>
        <div className="bg-[#4A6572]/80 p-8 rounded-2x1 mt-12 backdrop-blur-sm border border-white/10">
          <h2>Shipment Manifest</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <fieldset className="space-y-4">
              <InputLocation baseId="origin" label="Port of Origin" portIndex={0} />
              <InputLocation baseId="destination" label="Final Destination" portIndex={1} />
            </fieldset>
            <fieldset className="space-y-4">
              <legend>Cargo Manifest</legend>
              <InputCargo baseId="cargo1" cargoIndex={0} />
              <InputCargo baseId="cargo2" cargoIndex={1} />
              <InputCargo baseId="cargo3" cargoIndex={2} />
              <InputCargo baseId="cargo4" cargoIndex={3} />
            </fieldset>

            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}

            <fieldset>
              <div className="pt-4">
                <div className="w-full p-3 rounded-lg bg-gray-700/60 text-x1 font-bold text-[#ffc107]">
                  {quote > 0 ? `${quote.toLocaleString()} Hex` : '--- Hex'}
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FFC107] text-[#0b2545] font-bold text-lg p-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Scheduling...' : 'Schedule Shipment'}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateShipment;
