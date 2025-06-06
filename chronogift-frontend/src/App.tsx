import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Import Pages & Components
import LoginPage from "./LoginPage";
import CreateGiftPage from "./CreateGiftPage";
import OpenGiftPage from "./OpenGiftPage";

// Import Styles
import { GlobalStyle } from "./styles";

// -------------------- Config --------------------
// Use environment variables for configuration
const GOOGLE_CLIENT_ID = "980139118410-2mnqsu060hj0t1bgcrr6qbck2alnr42k.apps.googleusercontent.com"; // Add your Google Client ID to a .env file

// -------------------- Interfaces --------------------

// -------------------- App Component --------------------
function App() {
  const [user, setUser] = useState< User | null>(null);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h1>Configuration Error</h1>
        <p>Google Client ID is missing. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file.</p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GlobalStyle />
      <Routes>
        <Route
          path="/"
          element={user ? (
            <CreateGiftPage user={user} onLogout={() => setUser(null)} />
          ) : (
            <LoginPage onLogin={setUser} />
          )}
        />
        <Route path="/gift/:giftId" element={<OpenGiftPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

// NOTE: All other components (LoginPage, CreateGiftPage, OpenGiftPage) should be in their own files.
// For brevity here, I'm assuming they are separate and importing them.
// The code for them is provided below.
export default App;