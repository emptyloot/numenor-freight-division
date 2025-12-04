const admin = require('firebase-admin');

/**
 * @description Middleware to verify Firebase session cookie.
 * If the cookie is valid, it attaches the decoded user claims to the request object.
 * If the cookie is invalid or expired, it returns a 401 Unauthorized error.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @param {object} next The Express next middleware function.
 * @returns {Promise<void>} A promise that resolves when the middleware is complete.
 */
const verifySessionCookie = async (req, res, next) => {
  const sessionCookie = req.cookies.session || '';

  try {
    // Verify the session cookie. In this case, we are verifying if the user is revoked.
    const decodedClaims = await admin.auth().verifySessionCookie(
      sessionCookie,
      true // checkRevoked
    );
    req.user = decodedClaims;
    return next();
  } catch (error) {
    // Session cookie is invalid.
    return res.status(401).send('Unauthorized');
  }
};

module.exports = {
  verifySessionCookie,
};
