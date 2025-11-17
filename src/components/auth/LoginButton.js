import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useManifest } from '../../context/ShipmentManifestContext';

/**
 * @param {object} props The component props.
 * @param {React.ReactNode} [props.children] Custom content for the button. Defaults to 'Login with Discord'.
 * @description Renders a button that redirects the user to the Discord authorization page.
 *              It fetches the Discord Client ID from the backend on component mount.
 * @returns {object} Render of the login button.
 */
const LoginButton = ({ children }) => {
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { manifest } = useManifest();

  useEffect(() => {
    /**
     * @description Fetches the Discord client ID from the backend API.
     */
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`/api/auth/config`);
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
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'identify'; // Request access to user's ID, username, and avatar

    if (!clientId) {
      console.error('Discord Client ID is not available.');
      return;
    }

    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

    //Save the manifest data
    sessionStorage.setItem('pendingManifest', JSON.stringify(manifest));

    window.location.href = authUrl;
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading || !clientId}
      className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2 px-4 rounded-md flex items-center justify-center w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {loading ? 'Loading...' : children || 'Login with Discord'}
    </button>
  );
};

export default LoginButton;
