const axios = require('axios');
const { wait } = require('../utils/wait');

/**
 * Executes a raw Axios request to the Discord API with error delegation.
 * @param {string} method The HTTP method to use (e.g., 'POST', 'PATCH').
 * @param {string} url The full API endpoint URL.
 * @param {object} payload The JSON body to send.
 * @param {object} headers The prepared request headers (Auth, Content-Type).
 * @param {number} maxRetries The number of retries remaining for this request.
 * @returns {Promise<string>} Resolves with the Discord Message ID on success.
 */
const executeDiscordRequest = async (method, url, payload, headers, maxRetries) => {
  try {
    const response = await axios({
      method,
      url,
      data: payload,
      headers,
    });
    return response.data.id;
  } catch (error) {
    return handleDiscordError(error, method, url, payload, headers, maxRetries);
  }
};

/**
 * Validates environment variables and prepares the request context.
 * @param {string} [channelId] Optional channel ID. If omitted, falls back to process.env.DISCORD_CHANNEL_ID.
 * @returns {{targetChannelId: string, headers: object}} An object containing the resolved channel ID and the Auth headers.
 * @throws {Error} If the Bot Token or Channel ID are missing.
 */
const getDiscordContext = (channelId) => {
  const token = process.env.DISCORD_BOT_TOKEN;
  const targetChannelId = channelId || process.env.DISCORD_CHANNEL_ID;

  if (!token) throw new Error('DISCORD_BOT_TOKEN environment variable not set.');
  if (!targetChannelId) throw new Error('DISCORD_CHANNEL_ID environment variable not set.');

  return {
    targetChannelId,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

/**
 * Sends a message to a specified Discord channel using a bot.
 * @param {object} payload json format string for rich embeds
 * @param {string} channelId The ID of the channel. Defaults to env var.
 * @param {number} maxRetries The number of retries before giving up.
 * @returns {Promise<string|null>} Resolves with Message ID on success, or null on failure.
 */
const sendDiscordMessage = async (payload, channelId, maxRetries = 3) => {
  try {
    const { targetChannelId, headers } = getDiscordContext(channelId);
    const url = `https://discord.com/api/v10/channels/${targetChannelId}/messages`;
    console.log(`Sending message to channel ${targetChannelId}...`);
    return await executeDiscordRequest('POST', url, payload, headers, maxRetries);
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

/**
 * Updates an existing Discord message.
 * @param {string} messageId The ID of the message to edit.
 * @param {object} payload The new json payload.
 * @param {string} channelId Optional channel ID (required if not in env).
 * @param {number} maxRetries The number of retries before giving up.
 * @returns {Promise<string|null>} Resolves with Message ID on success, or null on failure.
 */
const updateDiscordMessage = async (messageId, payload, channelId, maxRetries = 3) => {
  try {
    const { targetChannelId, headers } = getDiscordContext(channelId);
    const url = `https://discord.com/api/v10/channels/${targetChannelId}/messages/${messageId}`;
    console.log(`Updating message ${messageId} in channel ${targetChannelId}...`);
    return await executeDiscordRequest('PATCH', url, payload, headers, maxRetries);
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

/**
 * @param {object} error The error object from axios.
 * @param {string} method The HTTP method (POST/PATCH).
 * @param {string} url The URL being accessed.
 * @param {object} payload The message payload.
 * @param {object} headers The auth headers.
 * @param {number} maxRetries Retries remaining.
 * @returns {Promise<string>} A promise that resolves when the message has been sent or after retries have been exhausted.
 */
const handleDiscordError = async (error, method, url, payload, headers, maxRetries) => {
  // 1. If we have run out of retries, throw the error so the Queue knows it failed.
  if (maxRetries <= 0) {
    console.error('Max retries reached. Failing.');
    throw error;
  }

  // 2. Extract the status code (if it exists)
  const status = error.response ? error.response.status : null;

  // --- SCENARIO A: RATE LIMIT (429) ---
  if (status === 429) {
    // Discord sends the wait time (in seconds) in the body
    const retryAfterSeconds = error.response?.data?.retry_after || 1;

    // Convert to ms and add a small "safety buffer" (e.g., 200ms)
    const waitTimeMs = retryAfterSeconds * 1000 + 200;

    console.warn(`Rate limit hit (429). Waiting ${waitTimeMs}ms before retrying...`);

    await wait(waitTimeMs);

    // RECURSIVE CALL: Try again with the same payload
    return executeDiscordRequest(method, url, payload, headers, maxRetries); // Don't decrement maxRetries for 429s (optional)
  }

  // --- SCENARIO B: DISCORD SERVER ERROR (500, 502, 503, 504) ---
  if (status >= 500 && status < 600) {
    console.warn(`Discord Server Error (${status}). Retrying in 2 seconds...`);

    await wait(2000); // Wait 2 seconds for the server to hiccup

    // RECURSIVE CALL: Reduce retries
    return executeDiscordRequest(method, url, payload, headers, maxRetries - 1);
  }

  // --- SCENARIO C: FATAL ERROR (400, 401, 404) ---
  // Do not retry. Log it and throw it so the queue marks it as a bad message.
  console.error('Fatal Error sending message:', error.response ? error.response.data : error.message);
  throw error;
};
module.exports = { sendDiscordMessage, updateDiscordMessage };
