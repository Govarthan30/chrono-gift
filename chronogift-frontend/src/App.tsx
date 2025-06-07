import { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AnimatePresence, motion } from "framer-motion";
import styled, { ThemeProvider, createGlobalStyle, DefaultTheme } from "styled-components";

import LoginPage from "./LoginPage";
import CreateGiftPage from "./CreateGiftPage";
import OpenGiftPage from "./OpenGiftPage";
import FooterCredits from "./FooterCredits";
import type { User } from "./types";

const GOOGLE_CLIENT_ID = "980139118410-2mnqsu060hj0t1bgcrr6qbck2alnr42k.apps.googleusercontent.com";

const lightTheme: DefaultTheme = {
  mode: "light", 
  background: "#f0f4f8",
  backgroundGradient: "linear-gradient(135deg, #cce7ff 0%, #5a9bd5 100%)",
  headingColor: "#004080",
  cardBackground: "#ffffff",
  cardBg: "#ffffff",          // duplicate key, keep both for compatibility
  cardTextColor: "#004080",
  textPrimary: "#004080",
  textSecondary: "#004080cc",
  primaryText: "#004080",
  secondaryText: "#004080cc",
  buttonBg: "#357ABD",
  buttonGradient: "linear-gradient(45deg, #4a90e2, #357ABD)",
  buttonHoverBg: "#4a90e2",
  buttonHoverGradient: "linear-gradient(45deg, #357ABD, #4a90e2)",
  inputBorder: "#357ABD",
  inputBackground: "#ffffff",
  inputColor: "#004080",
  inputFocusBorder: "#74a9ff",
  errorColor: "#cc0000",
  subHeadingColor: "#0059b3",
  footerColor: "#004080",
  footerBg: "#e0e7ff",
  logoutBg: "#cc3300",
  logoutHoverBg: "#ff0000",
  boxShadow: "0 4px 15px rgba(58, 123, 255, 0.4), 0 8px 30px rgba(0, 0, 0, 0.1)",
};



const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: ${({ theme }) => theme.background};
    color: red;
    transition: background 0.3s ease, color 0.3s ease;
    min-height: 100vh;
  }

  a {
    color: ${({ theme }) => theme.buttonBg};
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  color: red;
  padding: 20px;
  text-align: center;
`;

const LandingButton = styled.button`
  background: ${({ theme }) => theme.buttonBg};
  color: white;
  border: none;
  padding: 16px 36px;
  font-size: 1.3rem;
  font-weight: 700;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(33, 150, 243, 0.6);
  transition: background 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.buttonHoverBg};
  }
`;

const AboutSection = styled.div`
  margin-top: 40px;
  max-width: 600px;
  font-size: 1.1rem;
  line-height: 1.6;
  user-select: none;
`;

function LandingPage() {
  const navigate = useNavigate();

  return (
    <LandingContainer>
      <h1>🎁 Welcome to TimeBox</h1>
      <p>
        Share heartfelt digital gifts — text, images, or videos — with a unique twist: set a passcode and timer for unlocking.
        Recipients can access their gifts only after signing in and entering the secret.
      </p>
      <LandingButton onClick={() => navigate("/login")}>Let's Create</LandingButton>
      <AboutSection>
        TimeBox is personal. Secure. Memorable.
      </AboutSection>
    </LandingContainer>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h1>Configuration Error</h1>
        <p>Google Client ID is missing. Please set it in your environment.</p>
      </div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyle />
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                user ? (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    style={{ height: "100%" }}
                  >
                    <CreateGiftPage user={user} onLogout={() => setUser(null)} />
                  </motion.div>
                ) : (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    style={{ height: "100%" }}
                  >
                    <LandingPage />
                  </motion.div>
                )
              }
            />

            <Route
              path="/login"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={{ height: "100%" }}
                >
                  <LoginPage onLogin={setUser} />
                </motion.div>
              }
            />

            <Route
              path="/gift/:giftId"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={{ height: "100%" }}
                >
                  <OpenGiftPage />
                </motion.div>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          <FooterCredits />
        </AnimatePresence>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
