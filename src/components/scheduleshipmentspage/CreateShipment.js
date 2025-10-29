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
  return (
    <main className="container mx-auto p-4 text-center text-[#EDF2F4]">
      <div className="max-w-2xl mx-auto">
        <h1>Commission a Voyage</h1>
        <div className="bg-[#4A6572]/80 p-8 rounded-2x1 mt-12 backdrop-blur-sm border border-white/10">
          <h2>Shipment Manifest</h2>
          <form className="space-y-6">
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
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateShipment;
