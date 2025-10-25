import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * @description Renders a button that redirects the user to the Discord authorization page.
 *              It fetches the Discord Client ID from the backend on component mount.
 * @returns {object} Render of the login button.
 */
const LoginButton = () => {
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * @description Fetches the Discord client ID from the backend API.
     */
    const fetchConfig = async () => {
      try {
        // TODO: Replace with your production function URL when deployed
        const functionUrl = 'http://localhost:5001/numenor-freight-division/us-central1/api/auth/config';
        const response = await axios.get(functionUrl);
        setClientId(response.data.clientId);
      } catch (error) {
        console.error('Error fetching Discord client ID:', error);
        // Handle the error appropriately in your UI
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  /**
   * @description Handles the login button click, redirecting to Discord's OAuth page.
   */
  const handleLogin = () => {
    console.log('Logging in...');
    const redirectUri = 'http://localhost:3000/auth/callback';
    const scope = 'identify'; // Request access to user's ID, username, and avatar

    if (!clientId) {
      console.error('Discord Client ID is not available.');
      return;
    }

    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading || !clientId}
      className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2 px-4 rounded-md flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {loading ? 'Loading...' : 'Login with Discord'}
    </button>
  );
};

export default LoginButton;
