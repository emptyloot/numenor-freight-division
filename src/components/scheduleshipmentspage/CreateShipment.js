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
              <div>
                <label htmlFor="tiles" className="block text-left mb-1">
                  Number of Tiles:
                </label>
                <input
                  id="tiles"
                  type="number"
                  min="0"
                  className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />
              </div>
              <div>
                <label htmlFor="start" className="block text-left mb-1">
                  Port of Origin:
                </label>
                <input
                  id="start"
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />
              </div>
              <div>
                <label htmlFor="end" className="block text-left mb-1">
                  Final Destination:
                </label>
                <input
                  id="end"
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />
              </div>
            </fieldset>
            <fieldset className="space-y-4">
              <legend>Cargo Manifest</legend>
              <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                <label htmlFor="cargo1name" className="block text-left mb-1 whitespace-nowrap">
                  Cargo Hold 1:
                </label>
                <input
                  id="cargo1name"
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />
                <label htmlFor="cargo1quant" className="block text-left mb-1">
                  Quantity:
                </label>
                <input
                  id="cargo1quant"
                  type="number"
                  min="0"
                  max="100"
                  className="w-half p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                <label htmlFor="cargo2name" className="block text-left mb-1 whitespace-nowrap">
                  Cargo Hold 2:
                </label>
                <input
                  id="cargo2name"
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />
                <label htmlFor="cargo2quant" className="block text-left mb-1">
                  Quantity:
                </label>
                <input
                  id="cargo2quant"
                  type="number"
                  min="0"
                  max="100"
                  className="w-half p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                <label htmlFor="cargo3name" className="block text-left mb-1 whitespace-nowrap">
                  Cargo Hold 3:
                </label>
                <input
                  id="cargo3name"
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />

                <label htmlFor="cargo3quant" className="block text-left mb-1">
                  Quantity:
                </label>
                <input
                  id="cargo3quant"
                  type="number"
                  min="0"
                  max="100"
                  className="w-half p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                <label htmlFor="cargo4name" className="block text-left mb-1 whitespace-nowrap">
                  Cargo Hold 4:
                </label>
                <input
                  id="cargo4name"
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />

                <label htmlFor="cargo4quant" className="block text-left mb-1">
                  Quantity:
                </label>
                <input
                  id="cargo4quant"
                  type="number"
                  min="0"
                  max="100"
                  className="w-half p-3 rounded-lg bg-white/90 text-black placeholder-gray-500"
                />
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateShipment;
