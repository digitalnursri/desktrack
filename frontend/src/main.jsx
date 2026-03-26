import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'

// Try build-time variable first, then fall back to runtime fetch
const INITIAL_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function RootApp() {
  const [googleClientId, setGoogleClientId] = useState(INITIAL_CLIENT_ID);
  const [ready, setReady] = useState(!!INITIAL_CLIENT_ID);

  useEffect(() => {
    // If we already have a client ID from build-time, skip the fetch
    if (INITIAL_CLIENT_ID) {
      setReady(true);
      return;
    }

    // Fetch client ID from the backend at runtime
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.googleClientId) {
          setGoogleClientId(data.googleClientId);
        }
      })
      .catch(err => console.error('Failed to fetch config:', err))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return null; // Don't render until we have the config
  }

  return (
    <React.StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App googleClientId={googleClientId} />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<RootApp />);
