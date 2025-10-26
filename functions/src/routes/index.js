const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Initialize Firebase Admin SDK
if (process.env.FUNCTIONS_EMULATOR) {
  admin.initializeApp({
    projectId: 'numenor-freight-division',
  });
} else {
  admin.initializeApp();
}

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://numenor-freight-division.web.app',
  'https://numenor-freight-division.firebaseapp.com',
];

app.use(
  cors({
    /**
     * @description   A function to determine if the requesting origin is allowed.
     * @param {string} origin The origin of the request.
     * @param {object} callback The callback function to be called with the allowed status.
     */
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

/**
 * @description Simple endpoint for testing the API's availability.
 * @param {object} req The Express request object. //enlist-ignore-line
 * @param {object} res The Express response object.
 */
app.get('/', (req, res) => {
  res.send('Hello from the Numenor API!');
});

/**
 * @description Endpoint to provide the public Discord client ID to the front end.
 *              This is used by the front end to construct the Discord OAuth2 URL.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 */
app.get('/auth/config', (req, res) => {
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
});

/**
 * @description The main endpoint for Discord authentication. It receives an authorization code from the client,
 *              exchanges it for a Discord access token, fetches the user's Discord profile, creates a custom
 *              Firebase token, saves/updates the user's data in Firestore, and returns the Firebase token
 *              to the client for sign-in.
 * @param {object} req The Express request object.
 * @param {string} req.body.code The Discord authorization code.
 * @param {object} res The Express response object.
 */
app.post('/auth/discord', async (req, res) => {
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

    // 4. (Optional but recommended) Save user data to Firestore
    const userRef = admin.firestore().collection('users').doc(uId);
    await userRef.set(
      {
        discordId: discordUser.id,
        username: discordUser.username,
        avatar: discordUser.avatar,
      },
      { merge: true }
    );
    console.log('Successfully saved user data to Firestore.');

    // 5. Send the custom Firebase token back to the client
    res.json({ firebaseToken });
  } catch (error) {
    console.error('Error during Discord authentication:', error.response ? error.response.data : error.message);
    res.status(500).send('Authentication failed.');
  }
});

// Export the Express app as a cloud function
exports.api = functions.https.onRequest(app);
