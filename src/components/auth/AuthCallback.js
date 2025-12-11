import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import axios from 'axios';
import { useManifest } from '../../context/ShipmentManifestContext';

/**
@description Communicates with backend api using axios package. 
@returns {object} rendering of text while api calls resolve.
 */
const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setManifest } = useManifest();
  const isAuthenticating = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const savedData = sessionStorage.getItem('pendingManifest');
    if (savedData) {
      sessionStorage.removeItem('pendingManifest');
      const parsedData = JSON.parse(savedData);
      setManifest(parsedData);
    }
    if (code && !isAuthenticating.current) {
      isAuthenticating.current = true;
      axios
        .post(`/api/auth/discord`, { code })
        .then((response) => {
          const { firebaseToken } = response.data;
          return signInWithCustomToken(auth, firebaseToken);
        })
        .then((userCredential) => {
          navigate('/'); // Redirect to homepage after successful login
        })
        .catch((error) => {
          console.error('Authentication failed:', error);
          navigate('/login-error'); // Redirect to an error page
        });
    }
  }, [location, navigate, setManifest]);

  return <div>Loading, please wait...</div>;
};

export default AuthCallback;
