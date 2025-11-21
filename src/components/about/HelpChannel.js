/**
 *
 * @param root0
 * @param root0.className
 * @param root0.children
 */
const HelpChannel = ({ className, children }) => {
  const defaultClassName = 'bg-primary-light/80 p-4 rounded-2xl backdrop-blur-sm border border-white/10 text-off-white';
  return (
    <div className={`${defaultClassName} ${className || ''}`}>
      <p>
        {children || (
          <>
            If you make a mistake when submitting a job, don’t worry!
            <br />
            Simply navigate to our "nfd-help" channel on our discord:{' '}
            <a
              href="https://discord.com/channels/236307081534242817/1441457854098837578"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              nfd-help
            </a>
            <br />
            <br />
            Open a ticket and include the Job ID of the incorrect submission.
            <br />
            Once that’s done, you can go ahead and create a new, corrected job.
            <br />
            <br />
            We’re here to help make the process smooth and easy!
          </>
        )}
      </p>
    </div>
  );
};

export default HelpChannel;
