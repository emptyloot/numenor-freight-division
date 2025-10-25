import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import axios from 'axios';

/**
@description Communicates with backend api using axios package. 
@returns {object} rendering of text while api calls resolve.
 */
const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticating = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');

    if (code && !isAuthenticating.current) {
      isAuthenticating.current = true;

      const functionsUrl =
        window.location.hostname === 'localhost'
          ? 'http://localhost:5001/numenor-freight-division/us-central1'
          : 'https://us-central1-numenor-freight-division.cloudfunctions.net';

      axios
        .post(`${functionsUrl}/api/auth/discord`, { code })
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
  }, [location, navigate]);

  return <div>Loading, please wait...</div>;
};

export default AuthCallback;
