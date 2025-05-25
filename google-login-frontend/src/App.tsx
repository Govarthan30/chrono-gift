import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Routes from './routes';

const GOOGLE_CLIENT_ID = "980139118410-2mnqsu060hj0t1bgcrr6qbck2alnr42k.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Header />
          <Routes />
        </Router>
      </AuthProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;