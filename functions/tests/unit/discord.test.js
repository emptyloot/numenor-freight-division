const axios = require('axios');
const { sendDiscordMessage, updateDiscordMessage } = require('../../src/triggers/discord');
const { wait: delay } = require('../../src/utils/wait');

// Mock the axios library
jest.mock('axios');

// Mock the wait utility
jest.mock('../../src/utils/wait');

// Mock console methods to prevent logging during tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Discord Service', () => {
  const DISCORD_BOT_TOKEN = 'test-token';
  const DISCORD_CHANNEL_ID = 'test-channel-id';
  const MESSAGE_ID = 'message-123';
  const payload = { content: 'Hello, Discord!' };

  beforeAll(() => {
    process.env.DISCORD_BOT_TOKEN = DISCORD_BOT_TOKEN;
    process.env.DISCORD_CHANNEL_ID = DISCORD_CHANNEL_ID;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    delete process.env.DISCORD_BOT_TOKEN;
    delete process.env.DISCORD_CHANNEL_ID;
  });

  describe('sendDiscordMessage', () => {
    const url = `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`;
    const headers = {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    };

    it('should send a message and return the message ID on success', async () => {
      axios.mockResolvedValue({ data: { id: MESSAGE_ID } });

      const result = await sendDiscordMessage(payload);

      expect(result).toBe(MESSAGE_ID);
      expect(axios).toHaveBeenCalledWith({ method: 'POST', url, data: payload, headers });
      expect(console.log).toHaveBeenCalledWith(`Sending message to channel ${DISCORD_CHANNEL_ID}...`);
    });

    it('should return null if DISCORD_BOT_TOKEN is not set', async () => {
      delete process.env.DISCORD_BOT_TOKEN;
      const result = await sendDiscordMessage(payload);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('DISCORD_BOT_TOKEN environment variable not set.');
      process.env.DISCORD_BOT_TOKEN = DISCORD_BOT_TOKEN; // Restore for other tests
    });

    it('should handle rate limiting (429) by waiting and retrying', async () => {
      const mockRateLimitError = { response: { status: 429, data: { retry_after: 1 } } };
      axios.mockRejectedValueOnce(mockRateLimitError).mockResolvedValueOnce({ data: { id: MESSAGE_ID } });

      await sendDiscordMessage(payload);

      expect(delay).toHaveBeenCalledWith(1200); // 1s + 200ms buffer
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Rate limit hit (429)'));
      expect(axios).toHaveBeenCalledTimes(2);
    });

    it('should retry on server error (5xx) and then succeed', async () => {
      const mockServerError = { response: { status: 500 } };
      axios.mockRejectedValueOnce(mockServerError).mockResolvedValueOnce({ data: { id: MESSAGE_ID } });

      await sendDiscordMessage(payload);

      expect(delay).toHaveBeenCalledWith(2000);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Discord Server Error (500)'));
      expect(axios).toHaveBeenCalledTimes(2);
    });

    it('should return null after max retries for server errors are exhausted', async () => {
      const mockServerError = { response: { status: 502 } };
      axios.mockRejectedValue(mockServerError);

      const result = await sendDiscordMessage(payload, DISCORD_CHANNEL_ID, 2); // 2 retries

      expect(result).toBeNull();
      expect(axios).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
      expect(console.error).toHaveBeenCalledWith('Max retries reached. Failing.');
    });

    it('should return null for a fatal 4xx error without retrying', async () => {
      const mockFatalError = { response: { status: 400, data: 'Invalid payload' } };
      axios.mockRejectedValue(mockFatalError);

      const result = await sendDiscordMessage(payload);

      expect(result).toBeNull();
      expect(axios).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Fatal Error sending message:', 'Invalid payload');
    });
  });

  describe('updateDiscordMessage', () => {
    const url = `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages/${MESSAGE_ID}`;
    const headers = {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    };

    it('should update a message and return the message ID on success', async () => {
      axios.mockResolvedValue({ data: { id: MESSAGE_ID } });

      const result = await updateDiscordMessage(MESSAGE_ID, payload);

      expect(result).toBe(MESSAGE_ID);
      expect(axios).toHaveBeenCalledWith({ method: 'PATCH', url, data: payload, headers });
      expect(console.log).toHaveBeenCalledWith(`Updating message ${MESSAGE_ID} in channel ${DISCORD_CHANNEL_ID}...`);
    });

    it('should return null if DISCORD_CHANNEL_ID is not provided via arg or env', async () => {
      delete process.env.DISCORD_CHANNEL_ID;
      const result = await updateDiscordMessage(MESSAGE_ID, payload);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('DISCORD_CHANNEL_ID environment variable not set.');
      process.env.DISCORD_CHANNEL_ID = DISCORD_CHANNEL_ID; // Restore
    });

    // You can add more tests for update, e.g., for error handling, retries, etc.
    // They would be very similar to the `sendDiscordMessage` tests.
  });
});
