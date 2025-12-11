const admin = require('firebase-admin');
const axios = require('axios');

/**
 * @description Endpoint to provide the public Discord client ID to the front end.
 *              This is used by the front end to construct the Discord OAuth2 URL.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @returns {void} The Express response object containing the Discord client ID.
 */
const getAuthConfig = (req, res) => {
  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      console.error('Discord Client ID is not configured in environment variables.');
      return res.status(500).send('Server configuration error.');
    }
    res.json({ clientId });
  } catch (error) {
    console.error('Error retrieving Discord Client ID:', error);
    res.status(500).send('Server configuration error.');
  }
};

/**
 * @description The main endpoint for Discord authentication. It receives an authorization code from the client,
 *              exchanges it for a Discord access token, fetches the user's Discord profile, creates a custom
 *              Firebase token, saves/updates the user's data in Firestore, and returns the Firebase token
 *              to the client for sign-in.
 * @param {object} req The Express request object.
 * @param {string} req.body.code The Discord authorization code.
 * @param {object} res The Express response object.
 * @returns {object} {object} The Express response object containing the Firebase custom token.
 */
const handleDiscordAuth = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).send('Missing Discord authorization code.');
  }

  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = req.headers.origin + '/auth/callback';

    // 1. Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    console.log('Successfully exchanged code for access token.');

    // 2. Use the access token to get the user's Discord profile
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const discordUser = userResponse.data;
    const uId = `discord:${discordUser.id}`;
    console.log(`Successfully fetched user profile for ${discordUser.username}.`);

    // 3. Create a custom Firebase token for the user
    const firebaseToken = await admin.auth().createCustomToken(uId);
    console.log('Successfully created custom Firebase token.');

    // 4. On initial user creation, assign a default role of 'client'.
    //    This prevents overwriting the role if it's later elevated to 'staff'.
    const userRef = admin.firestore().collection('users').doc(uId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Document does not exist, create it with a default role
      await userRef.set({
        global_name: discordUser.global_name,
        discordId: discordUser.id,
        username: discordUser.username,
        avatar: discordUser.avatar,
        role: 'client', // Assign default role
      });
    } else {
      // Document exists, update it without touching the role
      await userRef.update({
        global_name: discordUser.global_name,
        username: discordUser.username,
        avatar: discordUser.avatar,
      });
    }
    console.log('Successfully saved user data to Firestore.');

    // 5. Send the custom Firebase token back to the client
    res.json({ firebaseToken });
  } catch (error) {
    console.error('Error during Discord authentication:', error.response ? error.response.data : error.message);
    res.status(500).send('Authentication failed.');
  }
};

module.exports = {
  getAuthConfig,
  handleDiscordAuth,
};
