import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import './firebase/firebase.js';

import { AuthProvider } from './context/AuthContext';
import { ManifestProvider } from './context/ShipmentManifestContext.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ManifestProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ManifestProvider>
    </BrowserRouter>
  </React.StrictMode>
);
reportWebVitals();
