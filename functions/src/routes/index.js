const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const authController = require('./authController');
// Initialize Firebase Admin SDK
if (process.env.FUNCTIONS_EMULATOR) {
  admin.initializeApp({
    projectId: 'numenor-freight-division',
  });
} else {
  admin.initializeApp();
}

const app = express();

const webOrigin = process.env.ALLOWED_ORIGIN_WEB;
const fbOrigin = process.env.ALLOWED_ORIGIN_FB; // eslint-disable-line

// Base allowed origins (production)
const allowedOrigins = [webOrigin, fbOrigin]; // eslint-disable-line

// Add localhost only when running in the emulator
if (process.env.FUNCTIONS_EMULATOR) {
  allowedOrigins.push('http://localhost:5000');
}
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
app.get('/api', (req, res) => {
  res.send('Hello from the Numenor API!');
});

// Authentication routes
app.get('/api/auth/config', authController.getAuthConfig);
app.post('/api/auth/discord', authController.handleDiscordAuth);

// Export the Express app as a cloud function
exports.api = functions.https.onRequest(app);
