// Updated ChronoGift LoginPage with
// - Theme toggle (Dark/Light)
// - Mobile responsiveness
// - Blue-based consistent themes
// - Prepared for storing frontend messages

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import type { User } from "./types";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { useState, useEffect } from "react";

const BACKEND_URL = "http://localhost:5000";

// ---- Themes ----
const lightTheme = {
  background: "#f0f8ff",
  cardBackground: "#ffffff",
  primaryText: "#1d3b73",
  secondaryText: "#555",
  buttonGradient: "linear-gradient(45deg, #3a7bd5, #00d2ff)",
  footerBg: "#f0f8ff",
};

const darkTheme = {
  background: "#0f172a",
  cardBackground: "#1e293b",
  primaryText: "#38bdf8",
  secondaryText: "#cbd5e1",
  buttonGradient: "linear-gradient(45deg, #2563eb, #38bdf8)",
  footerBg: "#1e293b",
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: ${({ theme }) => theme.background};
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: all 0.3s ease;
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  animation: fadeIn 1s ease forwards;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.secondaryText};
  border-radius: 20px;
  padding: 40px 30px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: all 0.3s ease;

  h1 {
    color: ${({ theme }) => theme.primaryText};
    margin-bottom: 10px;
    margin-top: 0;
  }

  p {
    font-size: 1rem;
    margin-bottom: 30px;
  }

  @media (max-width: 480px) {
    padding: 32px 20px;
    h1 { font-size: 1.5rem; }
    p { font-size: 0.9rem; margin-bottom: 24px; }
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.buttonGradient};
  border: none;
  padding: 14px 28px;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const Footer = styled.footer`
  width: 100%;
  text-align: center;
  padding: 12px 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondaryText};
  background: ${({ theme }) => theme.footerBg};
  position: fixed;
  bottom: 0;
  left: 0;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.05);

  a {
    color: ${({ theme }) => theme.primaryText};
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: 2px solid ${({ theme }) => theme.primaryText};
  color: ${({ theme }) => theme.primaryText};
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
`;

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("themeMode");
    if (saved) setThemeMode(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);
    localStorage.setItem("themeMode", newTheme);
  };

  const handleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const access_token = credentialResponse.access_token;
        if (!access_token) throw new Error("Missing access token");

        const res = await axios.post(`${BACKEND_URL}/api/auth/google`, {
          accessToken: access_token,
        });

        onLogin(res.data.user);
        navigate("/");
      } catch (err) {
        console.error("Login failed:", err);
        alert("Google login failed. Please try again.");
      }
    },
    onError: () => alert("Google login failed."),
  });

  return (
    <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
      <GlobalStyle />
      <PageContainer>
        <ThemeToggle onClick={toggleTheme}>
          {themeMode === "light" ? "🌙 Dark" : "☀️ Light"}
        </ThemeToggle>
        <Card>
          <h1>Welcome to ChronoGift 🎁</h1>
          <p>Send digital gifts that unlock in the future.</p>
          <Button onClick={() => handleLogin()}>Sign in with Google</Button>
        </Card>
      </PageContainer>
      <Footer>
        Developed by {" "}
        <a href="https://www.linkedin.com/in/govarthan-v/" target="_blank" rel="noopener noreferrer">
          Govarthan V
        </a>
      </Footer>
    </ThemeProvider>
  );
}

export default LoginPage;
