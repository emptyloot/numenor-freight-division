const { wait } = require('../../src/utils/wait');

describe('wait utility', () => {
  // Tell Jest to use fake timers
  beforeAll(() => {
    jest.useFakeTimers();
  });

  // Restore real timers after all tests in this file
  afterAll(() => {
    jest.useRealTimers();
  });

  it('should resolve after the specified number of milliseconds', async () => {
    const waitTime = 1000;
    const waitPromise = wait(waitTime);

    // At this point, the promise is still pending because the timer hasn't fired.

    // Fast-forward time by the wait time
    jest.advanceTimersByTime(waitTime);

    // Now, the promise should resolve
    await expect(waitPromise).resolves.toBeUndefined();
  });

  it('should handle a wait time of 0 milliseconds', async () => {
    const waitTime = 0;
    const waitPromise = wait(waitTime);

    // Fast-forward time just to be sure
    jest.advanceTimersByTime(waitTime);

    // The promise should resolve almost immediately
    await expect(waitPromise).resolves.toBeUndefined();
  });
});
