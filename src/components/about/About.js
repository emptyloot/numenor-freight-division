/**
@description Provide basic information about Numenor Freight Division mission and people
@returns {object} (JSX.element) rendered header and detailed information.
 */
function About() {
  return (
    <main className="container mx-auto p-4 text-center text-off-white">
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-4xl font-bold">About Númenor Freight Division</h1>
        <p className="mt-8 text-lg">
          Need Help or Have a Special Request? <br /> If you run into any issues with your delivery, or would like to
          arrange a custom shipment, feel free to reach out directly on Discord.
          <br />
          Contact: Rami (Discord: @Rami)
          <br /> Join our community:{' '}
          <a
            href="https://discord.gg/vxfnPqrPp9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Join the Numenor Freight Discord
          </a>
        </p>
      </div>
    </main>
  );
}

export default About;
