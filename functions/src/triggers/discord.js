const axios = require('axios');
const { wait } = require('../utils/wait');
/**
 * Sends a message to a specified Discord channel using a bot.
 * @param {object} payload json formmat string for rich embeds
 * @param {string} channelId The ID of the channel to send the message to. Defaults to the one in the environment variables.
 * @param {number} maxRetries The number of retries before giving up.
 * @returns {Promise<void>} A promise that resolves when the message has been sent or after retries have been exhausted.
 */
const sendDiscordMessage = async (payload, channelId, maxRetries = 3) => {
  const token = process.env.DISCORD_BOT_TOKEN;
  const targetChannelId = channelId || process.env.DISCORD_CHANNEL_ID;

  if (!token) {
    console.error('DISCORD_BOT_TOKEN environment variable not set.');
    return;
  }

  if (!targetChannelId) {
    console.error('DISCORD_CHANNEL_ID environment variable not set.');
    return;
  }

  const url = `https://discord.com/api/v10/channels/${targetChannelId}/messages`;

  try {
    await axios.post(url, payload, {
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`Successfully sent message to Discord channel ${targetChannelId}`);
  } catch (error) {
    return handleDiscordError(error, payload, targetChannelId, maxRetries);
  }
};

/**
 * @param {object} error The error object received from the axios request.
 * @param {object} payload The original message payload that was attempted to be sent.
 * @param {string} targetChannelId The ID of the Discord channel the message was being sent to.
 * @param {number} maxRetries `The number of retries remaining.`
 * @returns {Promise<void>} A promise that resolves when the message has been sent or after retries have been exhausted.
 */
const handleDiscordError = async (error, payload, targetChannelId, maxRetries) => {
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
    const retryAfterSeconds = error.response.data.retry_after;

    // Convert to ms and add a small "safety buffer" (e.g., 200ms)
    const waitTimeMs = retryAfterSeconds * 1000 + 200;

    console.warn(`Rate limit hit (429). Waiting ${waitTimeMs}ms before retrying...`);

    await wait(waitTimeMs);

    // RECURSIVE CALL: Try again with the same payload
    return sendDiscordMessage(payload, targetChannelId, maxRetries); // Don't decrement maxRetries for 429s (optional)
  }

  // --- SCENARIO B: DISCORD SERVER ERROR (500, 502, 503, 504) ---
  if (status >= 500 && status < 600) {
    console.warn(`Discord Server Error (${status}). Retrying in 2 seconds...`);

    await wait(2000); // Wait 2 seconds for the server to hiccup

    // RECURSIVE CALL: Reduce retries
    return sendDiscordMessage(payload, targetChannelId, maxRetries - 1);
  }

  // --- SCENARIO C: FATAL ERROR (400, 401, 404) ---
  // Do not retry. Log it and throw it so the queue marks it as a bad message.
  console.error('Fatal Error sending message:', error.response ? error.response.data : error.message);
  throw error;
};
module.exports = { sendDiscordMessage };
