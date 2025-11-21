import { useState, useEffect } from 'react';
import { useManifest } from '../../context/ShipmentManifestContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Calculator from '../../utils/Calculator';
import LoginButton from '../auth/LoginButton';
import LocationInput from '../inputLocation/InputLocation';

/**
 * @description A component that provides an instant quote calculator for shipment costs.
 * It allows users to input origin and destination coordinates, calculates a quote based on these inputs,
 * and provides options to schedule a delivery (if authenticated) or log in.
 * @returns {object} A React component that renders the instant quote calculator.
 */
const InstantQuoteCalculator = () => {
  const [quote, setQuote] = useState(0);
  const { currentUser } = useAuth();
  const { manifest } = useManifest();
  const navigate = useNavigate();
  /**
   * @description Handles the click event for the "Schedule This Delivery" button.
   * It programmatically navigates the user to the '/schedule' route.
   */
  const handleScheduleClick = () => {
    navigate('/schedule');
  };
  /**
   * @description Effect hook to recalculate the quote whenever the manifest changes.
   */
  useEffect(() => {
    // Calculate the quote whenever the manifest (start/end locations) changes
    const hexCost = Calculator(manifest);
    setQuote(hexCost);
  }, [manifest]);
  return (
    <div className="bg-primary-light/80 p-8 rounded-2x1 mt-12 backdrop-blur-sm border border-white/10 max-w-xl mx-auto">
      <h2 className="text-2x1 font-semibold mb-6">"Instant Quote Calculator"</h2>
      <form className="space-y-4">
        <LocationInput baseId="start" label="Port of Origin" portIndex={0} />
        <LocationInput baseId="end" label="Final Destination" portIndex={1} />
        <div className="pt-4">
          <div className="w-full p-3 rounded-lg bg-gray-700/60 text-x1 font-bold text-accent">
            {quote > 0 ? `${quote.toLocaleString()} Hex +#*` : '--- Hex +#*'}
          </div>
        </div>
        <p>*additional cost is calculated based on outbound teleport cost from Armenelos</p>
        <div className="pt-6">
          {currentUser ? (
            <button
              type="button"
              onClick={handleScheduleClick}
              className="w-full bg-accent text-primary-dark font-bold text-lg p-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Schedule This Delivery
            </button>
          ) : (
            <LoginButton>Login to Schedule</LoginButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default InstantQuoteCalculator;
