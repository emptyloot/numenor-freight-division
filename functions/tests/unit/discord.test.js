const axios = require('axios');
const { sendDiscordMessage } = require('../../src/triggers/discord');

// Mock the axios library
jest.mock('axios');
// Mock the wait utility
jest.mock('../../src/utils/wait');

const { wait } = require('../../src/utils/wait');

// Mock console methods to prevent logging during tests and to assert on them
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('sendDiscordMessage', () => {
  const DISCORD_BOT_TOKEN = 'test-token';
  const DISCORD_CHANNEL_ID = 'test-channel-id';
  const payload = { content: 'Hello, Discord!' };

  beforeAll(() => {
    // Set up environment variables required by the function
    process.env.DISCORD_BOT_TOKEN = DISCORD_BOT_TOKEN;
    process.env.DISCORD_CHANNEL_ID = DISCORD_CHANNEL_ID;
  });

  afterEach(() => {
    // Clear mock history and reset implementations after each test
    jest.resetAllMocks();
  });

  afterAll(() => {
    // Restore original environment variables if needed
    delete process.env.DISCORD_BOT_TOKEN;
    delete process.env.DISCORD_CHANNEL_ID;
  });

  it('should send a message to Discord successfully', async () => {
    // Arrange: Configure axios.post to simulate a successful response
    axios.post.mockResolvedValue({ status: 200, data: {} });

    // Act: Call the function
    await sendDiscordMessage(payload);

    // Assert: Verify that axios.post was called correctly
    const expectedUrl = `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`;
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expectedUrl,
      payload,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    expect(console.log).toHaveBeenCalledWith(`Successfully sent message to Discord channel ${DISCORD_CHANNEL_ID}`);
  });

  it('should log an error if DISCORD_BOT_TOKEN is not set', async () => {
    // Arrange: Temporarily unset the environment variable
    delete process.env.DISCORD_BOT_TOKEN;

    // Act: Call the function
    await sendDiscordMessage(payload);

    // Assert: Check that an error was logged and axios was not called
    expect(console.error).toHaveBeenCalledWith('DISCORD_BOT_TOKEN environment variable not set.');
    expect(axios.post).not.toHaveBeenCalled();

    // Cleanup: Restore the environment variable for other tests
    process.env.DISCORD_BOT_TOKEN = DISCORD_BOT_TOKEN;
  });

  it('should log an error if DISCORD_CHANNEL_ID is not set', async () => {
    // Arrange: Temporarily unset the environment variable
    delete process.env.DISCORD_CHANNEL_ID;
    
    // Act: Call the function using a null channelId override
    await sendDiscordMessage(payload, null);

    // Assert: Check that an error was logged and axios was not called
    expect(console.error).toHaveBeenCalledWith('DISCORD_CHANNEL_ID environment variable not set.');
    expect(axios.post).not.toHaveBeenCalled();

    // Cleanup: Restore the environment variable
    process.env.DISCORD_CHANNEL_ID = DISCORD_CHANNEL_ID;
  });

  it('should handle rate limiting (429) by waiting and retrying', async () => {
    // Arrange
    const retryAfterSeconds = 1;
    const mockRateLimitError = {
      response: {
        status: 429,
        data: { retry_after: retryAfterSeconds },
      },
    };
    axios.post
      .mockRejectedValueOnce(mockRateLimitError)
      .mockResolvedValueOnce({ status: 200, data: {} });

    // Act
    await sendDiscordMessage(payload);

    // Assert
    expect(wait).toHaveBeenCalledTimes(1);
    expect(wait).toHaveBeenCalledWith(retryAfterSeconds * 1000 + 200);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Rate limit hit (429)'));
    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it('should retry on Discord server error (5xx) and then succeed', async () => {
    // Arrange
    const mockServerError = {
      response: {
        status: 500,
        data: {},
      },
    };
    axios.post
      .mockRejectedValueOnce(mockServerError)
      .mockResolvedValueOnce({ status: 200, data: {} });

    // Act
    await sendDiscordMessage(payload);

    // Assert
    expect(wait).toHaveBeenCalledTimes(1);
    expect(wait).toHaveBeenCalledWith(2000);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Discord Server Error (500)'));
    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it('should throw an error after max retries for server errors are exhausted', async () => {
    // Arrange
    const mockServerError = {
      response: {
        status: 502,
        data: {},
      },
    };
    const maxRetries = 2;
    axios.post.mockRejectedValue(mockServerError);

    // Act & Assert
    await expect(sendDiscordMessage(payload, DISCORD_CHANNEL_ID, maxRetries)).rejects.toBe(mockServerError);
    
    // Check that wait was called for the retries, but not for the final failure
    expect(wait).toHaveBeenCalledTimes(maxRetries);
    expect(axios.post).toHaveBeenCalledTimes(maxRetries + 1);
    expect(console.error).toHaveBeenCalledWith('Max retries reached. Failing.');
  });

  it('should throw a fatal error immediately for a 400-level error without retrying', async () => {
    // Arrange
    const mockFatalError = {
      response: {
        status: 400,
        data: { message: 'Invalid payload' },
      },
    };
    axios.post.mockRejectedValue(mockFatalError);

    // Act & Assert: Expect the function to reject with the same error
    await expect(sendDiscordMessage(payload)).rejects.toBe(mockFatalError);
    
    // Verify that axios was only called once and no retries were attempted
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Fatal Error sending message:', mockFatalError.response.data);
  });
});
