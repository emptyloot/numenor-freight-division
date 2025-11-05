const axios = require('axios');

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

  try {
    // 1. Make the first request to get the total count and the first page of claims.
    const firstPageUrl = `${baseUrl}?page=1&limit=${limit}&${sortParams}`;
    const firstPageResponse = await axios.get(firstPageUrl);
    const { count } = firstPageResponse.data;
    const totalPages = Math.ceil(count / limit);
    let allClaims = firstPageResponse.data.claims;

    console.log(`Total claims: ${count}, Total pages: ${totalPages}`);

    // 2. Create an array of promises for the remaining pages.
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      const pageUrl = `${baseUrl}?page=${page}&limit=${limit}&${sortParams}`;
      pagePromises.push(axios.get(pageUrl));
    }

    // 3. Execute all promises in parallel.
    const responses = await Promise.all(pagePromises);

    // 4. Concatenate the claims from all responses.
    responses.forEach((response) => {
      allClaims = allClaims.concat(response.data.claims);
    });

    console.log(`Successfully fetched all ${allClaims.length} claims.`);

    // 5. Send the combined data back to the client.
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
