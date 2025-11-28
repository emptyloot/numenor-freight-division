const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Express Controller to cancel a shipment.
 * Requires 'Authorization: Bearer <token>' header.
 * @param {import('express').Request} req - Express request object. Body must contain `{ documentId: string }`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a 200 JSON success message or specific error codes (400, 401, 403, 404, 500).
 */
const cancelShipment = async (req, res) => {
  try {
    // 1. MANUAL AUTH CHECK (Required for Express)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let requesterUid;

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      requesterUid = decodedToken.uid;
    } catch (authError) {
      console.error('Token verification failed:', authError);
      return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }

    // 2. Validate Input
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ error: 'Missing documentId' });
    }

    // 3. Firestore Logic
    const docRef = admin.firestore().collection('shipments').doc(documentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const shipmentData = docSnap.data();

    // 4. Verify Ownership
    if (shipmentData.userId !== requesterUid) {
      return res.status(403).json({ error: 'Permission denied: You do not own this shipment.' });
    }

    // 5. Check Status
    if (['delivered', 'cancelled'].includes(shipmentData.status)) {
      return res.status(400).json({ error: `Cannot cancel shipment that is ${shipmentData.status}` });
    }

    // Prevent cancellation if a driver is already assigned
    if (shipmentData.driverId) {
      return res.status(400).json({ error: 'Cannot cancel: A driver has already been assigned.' });
    }

    // 6. Update
    await docRef.update({
      status: 'cancelled',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.json({ message: 'Shipment cancelled successfully' });
  } catch (error) {
    console.error('Cancel Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { cancelShipment };
