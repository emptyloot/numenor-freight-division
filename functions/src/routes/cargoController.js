const axios = require('axios');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * @description Fetches cargo data from an external API, caches it in Firestore, and serves it.
 * This acts as a proxy to avoid CORS issues and to cache the data.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
const getCargo = async (req, res) => {
  console.log('Getting all cargo...');
  const baseUrl = 'https://bitjita.com/api/cargo'; // Placeholder for the actual cargo API
  const cacheDuration = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

  const db = admin.firestore();
  const cacheRef = db.collection('cargoCache').doc('allCargo');

  /**
   * @description Fetches new cargo data from the external API and updates the Firestore cache.
   * @returns {Promise<Array<object>>} A promise that resolves with the fetched cargo array.
   */
  const fetchAndCacheCargo = async () => {
    try {
      console.log('Fetching new cargo data from API.');
      const response = await axios.get(baseUrl);
      // eslint-disable-next-line spellcheck/spell-checker
      const cargo = response.data.cargos; // Assuming the API returns { cargo: [...] }

      if (!Array.isArray(cargo)) {
        throw new Error('Cargo API did not return a valid array.');
      }

      await cacheRef.set({
        cargo,
        timestamp: FieldValue.serverTimestamp(),
      });
      console.log('Cargo data updated in cache.');
      return cargo;
    } catch (error) {
      console.error('Error fetching cargo from external API:', error.message);
      // Don't throw here, as we might have served stale data.
      // The error is logged for monitoring.
    }
  };

  try {
    const cacheDoc = await cacheRef.get();

    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data();
      const lastUpdated = cacheData.timestamp.toDate();
      const age = Date.now() - lastUpdated.getTime();

      // Immediately return cached data, even if stale.
      console.log('Returning cargo from cache.');
      res.status(200).json({ cargo: cacheData.cargo, count: cacheData.cargo.length });

      if (age >= cacheDuration) {
        console.log('Cached cargo is stale, fetching new data in background.');
        fetchAndCacheCargo(); // Fetch in background, don't await
      }
    } else {
      console.log('No cargo found in cache, fetching new data.');
      const cargo = await fetchAndCacheCargo();
      if (cargo) {
        res.status(200).json({ cargo, count: cargo.length });
      } else {
        res.status(500).json({ message: 'Failed to fetch initial cargo data.' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cargo data.', error: error.message });
  }
};

module.exports = {
  getCargo,
};
