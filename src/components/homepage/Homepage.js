import InstantQuoteCalculator from '../InstantQuoteCalculator/InstantQuoteCalculator.js';

/**
@description Hero page for Numenor Freight Division. Inspiring message, instant quote calculator, and steps to follow.
@returns {object} (JSX.element) renders hero page with instant quote calculator with working input output
 */
function Homepage() {
  /**
@description Click event handler for the "Schedule This Delivery" button on the homepage.
Programmatically navigates the user to the '/schedule' route to fill out the shipment form.
@returns {void}
   */
  return (
    <main className="container mx-auto p-4 text-center text-[#EDF2F4]">
      <div>
        {/*Inspiring message */}
        <h1 className="text 4x1 md:text-5x1 font-bold mt-8">"By land or sea, the world turns on our trade"</h1>
        {/*Calculator */}
        <InstantQuoteCalculator />
        {/*Steps to follow */}
        <div className="mt-24 text-lg space-y-2">
          <p>Getting your coordinates:</p>
          <p>
            Step 1: Visit{' '}
            <a
              href="https://bitjita.com/claims"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Bitjita.com/claims
            </a>{' '}
            and look up your pickup and destination settlements.
          </p>
          <p>Step 2: Copy the N (North) and E (East) values for each.</p>
          <p>Step 3: Paste them below to calculate your route.</p>
        </div>
      </div>
    </main>
  );
}

export default Homepage;
