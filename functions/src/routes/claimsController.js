const axios = require('axios');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * @description Fetches claim data from the external bitjita.com API and forwards it.
 * This acts as a proxy to avoid CORS issues and hide the direct API endpoint from the client.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
const getClaims = async (req, res) => {
  console.log('Getting all claims with pagination...');
  const limit = 100;
  const baseUrl = 'https://bitjita.com/api/claims';
  const sortParams = 'sort=name&order=asc';
  const cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

  const db = admin.firestore();
  const cacheCollectionRef = db.collection('claimsCache');
  const metadataRef = cacheCollectionRef.doc('metadata');

  try {
    // 1. Check for cached claims
    const metadataDoc = await metadataRef.get();

    if (metadataDoc.exists) {
      const metadata = metadataDoc.data();
      const lastUpdated = metadata.timestamp.toDate();
      const age = Date.now() - lastUpdated.getTime();

      if (age < cacheDuration) {
        console.log('Returning claims from cache.');
        const pagesSnapshot = await cacheCollectionRef.get();
        let allClaims = [];
        pagesSnapshot.forEach((doc) => {
          if (doc.id !== 'metadata') {
            allClaims = allClaims.concat(doc.data().claims);
          }
        });
        // Sort claims by name as they might be out of order from reading from different documents
        allClaims.sort((a, b) => a.name.localeCompare(b.name));
        return res.status(200).json({ claims: allClaims, count: allClaims.length });
      } else {
        console.log('Cached claims are stale, fetching new data.');
      }
    } else {
      console.log('No claims found in cache, fetching new data.');
    }

    // 2. Make the first request to get the total count and the first page of claims.
    const firstPageUrl = `${baseUrl}?page=1&limit=${limit}&${sortParams}`;
    const firstPageResponse = await axios.get(firstPageUrl);
    const { count } = firstPageResponse.data;
    const totalPages = Math.ceil(count / limit);
    let allClaims = firstPageResponse.data.claims;

    // 3. Start a Firestore batch write to update the cache.
    const batch = db.batch();

    // 4. Save the first page to the cache.
    batch.set(cacheCollectionRef.doc('page_1'), { claims: firstPageResponse.data.claims });

    console.log(`Total claims: ${count}, Total pages: ${totalPages}`);

    // 5. Create an array of promises for the remaining pages.
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      const pageUrl = `${baseUrl}?page=${page}&limit=${limit}&${sortParams}`;
      pagePromises.push(axios.get(pageUrl));
    }

    // 6. Execute all promises in parallel.
    const responses = await Promise.all(pagePromises);

    // 7. Concatenate the claims from all responses and add page data to the batch write.
    responses.forEach((response, index) => {
      allClaims = allClaims.concat(response.data.claims);
      batch.set(cacheCollectionRef.doc(`page_${index + 2}`), { claims: response.data.claims });
    });

    console.log(`Successfully fetched all ${allClaims.length} claims.`);

    // 8. Update metadata and commit the batch.
    batch.set(metadataRef, { count, totalPages, timestamp: FieldValue.serverTimestamp() });
    await batch.commit();
    console.log('Claims data updated in cache.');

    // 9. Send the combined data back to the client.
    res.status(200).json({ claims: allClaims, count: allClaims.length });
  } catch (error) {
    console.error('Error fetching claims from bitjita.com:', error.message); //eslint-disable-line
    res.status(500).json({
      message: 'Failed to fetch claims data.',
      error: error.message,
    });
  }
};

module.exports = {
  getClaims,
};
