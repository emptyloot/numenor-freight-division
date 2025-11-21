const axios = require('axios');

/**
 * Sends a message to a specified Discord channel using a bot.
 * @param {string} message The message content to send.
 * @param payload
 * @param {string} [channelId] The ID of the channel to send the message to. Defaults to the one in the environment variables.
 * @returns {Promise<void>}
 */
const sendDiscordMessage = async (payload, channelId) => {
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
    console.error('Error sending message to Discord:', error.response ? error.response.data : error.message);
  }
};

module.exports = { sendDiscordMessage };
