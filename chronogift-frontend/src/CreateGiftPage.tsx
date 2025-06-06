import { useState } from "react";
import axios from "axios";
import type { User } from "./types";
import styled, { keyframes, ThemeProvider, createGlobalStyle } from "styled-components";

const BACKEND_URL = "http://localhost:5000";

// Define light and dark themes with a mode property for easy checks
const lightTheme = {
  mode: "light",
  backgroundGradient: "linear-gradient(135deg, #fceabb 0%, #f8b500 100%)",
  cardBackground: "white",
  headingColor: "#d48806",
  subHeadingColor: "#ff7e5f",
  inputBorder: "#d48806",
  inputFocusBorder: "#feb47b",
  buttonGradient: "linear-gradient(45deg, #ff7e5f, #feb47b)",
  buttonHoverGradient: "linear-gradient(45deg, #feb47b, #ff7e5f)",
  errorColor: "#cc0000",
  logoutBg: "#6c757d",
  logoutHoverBg: "#5a6268",
  footerBg: "#f9f9f9",
  footerColor: "#999",
  inputBackground: "white",
  inputColor: "#333",
  cardTextColor: "#444",
};

const darkTheme = {
  mode: "dark",
  backgroundGradient: "linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)",
  cardBackground: "#2e2e2e",
  headingColor: "#f6c90e",
  subHeadingColor: "#ffa77a",
  inputBorder: "#ffa77a",
  inputFocusBorder: "#ffb07c",
  buttonGradient: "linear-gradient(45deg, #ffa77a, #ffb07c)",
  buttonHoverGradient: "linear-gradient(45deg, #ffb07c, #ffa77a)",
  errorColor: "#ff6b6b",
  logoutBg: "#444",
  logoutHoverBg: "#555",
  footerBg: "#222",
  footerColor: "#ccc",
  inputBackground: "#444",
  inputColor: "#eee",
  cardTextColor: "#eee",
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Global styles to reset background & font colors per theme
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: ${({ theme }) => theme.backgroundGradient};
    color: ${({ theme }) => theme.headingColor};
    transition: background 0.3s ease, color 0.3s ease;
  }
`;

// Styled Components using theme props
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${fadeIn} 1s ease forwards;
  padding: 20px;
  position: relative;
  flex-direction: column;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 20px;
  padding: 40px 30px;
  max-width: 500px;
  width: 100%;
  box-shadow:
    0 4px 15px rgba(255, 215, 0, 0.4),
    0 8px 30px rgba(0, 0, 0, 0.1);
  user-select: none;
  color: ${({ theme }) => theme.cardTextColor};
`;

const Label = styled.label`
  display: block;
  margin-top: 15px;
  margin-bottom: 6px;
  font-weight: 600;
  color: ${({ theme }) => theme.headingColor};
`;

const Input = styled.input`
  width: 90%;
  padding: 10px 14px;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.inputBorder};
  outline: none;
  transition: border-color 0.3s ease;
  font-family: inherit;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.inputColor};

  &:focus {
    border-color: ${({ theme }) => theme.inputFocusBorder};
  }
`;

const TextArea = styled.textarea`
  width: 90%;
  padding: 10px 14px;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.inputBorder};
  outline: none;
  transition: border-color 0.3s ease;
  resize: vertical;
  font-family: inherit;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.inputColor};

  &:focus {
    border-color: ${({ theme }) => theme.inputFocusBorder};
  }
`;

const Button = styled.button<{ disabled?: boolean }>`
  background: ${({ theme }) => theme.buttonGradient};
  border: none;
  padding: 14px 28px;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 30px;
  width: 100%;
  box-shadow: 0 5px 15px rgba(255, 126, 95, 0.6);
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.1s ease;
  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.buttonHoverGradient};
    box-shadow: 0 8px 20px rgba(255, 180, 130, 0.9);
  }

  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.errorColor};
  margin-top: 12px;
  font-weight: 600;
  text-align: center;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    color: ${({ theme }) => theme.headingColor};
    font-weight: 700;
    user-select: none;
  }
`;

const LogoutButton = styled(Button)`
  background-color: ${({ theme }) => theme.logoutBg};
  box-shadow: none;

  &:hover {
    background-color: ${({ theme }) => theme.logoutHoverBg};
  }
`;

const GiftLinkContainer = styled.div`
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.subHeadingColor};
    font-weight: 700;
    user-select: none;
  }

  a {
    word-break: break-all;
    color: ${({ theme }) => theme.subHeadingColor};
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer = styled.footer`
  width: 100%;
  text-align: center;
  padding: 12px 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.footerColor};
  user-select: none;
  background: ${({ theme }) => theme.footerBg};
  position: fixed;
  bottom: 0;
  left: 0;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.05);

  a {
    color: ${({ theme }) => theme.headingColor};
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// Theme Toggle Button
const ThemeToggleButton = styled.button`
  position: fixed;
  top: 15px;
  right: 15px;
  background: ${({ theme }) => theme.buttonGradient};
  border: none;
  color: white;
  padding: 10px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  user-select: none;
  box-shadow: 0 3px 10px rgba(255, 126, 95, 0.6);
  transition: background 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.buttonHoverGradient};
  }
`;

function CreateGiftPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [giftLink, setGiftLink] = useState<string | null>(null);

  // Theme state: default to light mode
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = () => {
    setTheme((prev) => (prev.mode === "light" ? darkTheme : lightTheme));
  };

  const handleCreateGift = async () => {
    if (!receiverEmail || !unlockDate || !unlockTime || !passcode) {
      setError("Please fill all required fields marked with *");
      return;
    }

    const unlockTimestamp = new Date(`${unlockDate}T${unlockTime}`);
    if (unlockTimestamp <= new Date()) {
      setError("Unlock date and time must be in the future.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/gift`, {
        senderId: user.id,
        receiverEmail,
        textMessage,
        unlockTimestamp: unlockTimestamp.toISOString(),
        passcode,
      });
      setGiftLink(`${window.location.origin}/gift/${res.data.gift._id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create gift. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ThemeToggleButton onClick={toggleTheme}>
        {theme.mode === "light" ? "Dark Mode" : "Light Mode"}
      </ThemeToggleButton>
      <PageContainer>
        <Card>
          <HeaderRow>
            <h2>Create Time-Locked Gift</h2>
            <LogoutButton onClick={onLogout}>Logout</LogoutButton>
          </HeaderRow>

          {giftLink ? (
            <GiftLinkContainer>
              <h3>Gift Created!</h3>
              <p>Share this link with the recipient:</p>
              <a href={giftLink} target="_blank" rel="noopener noreferrer">
                {giftLink}
              </a>
              <Button onClick={() => setGiftLink(null)} style={{ marginTop: "20px" }}>
                Create another gift
              </Button>
            </GiftLinkContainer>
          ) : (
            <>
              <Label>Receiver's Email *</Label>
              <Input
                type="email"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                placeholder="example@domain.com"
              />

              <Label>Message</Label>
              <TextArea value={textMessage} onChange={(e) => setTextMessage(e.target.value)} rows={4} />

              <Label>Unlock Date *</Label>
              <Input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} />

              <Label>Unlock Time *</Label>
              <Input type="time" value={unlockTime} onChange={(e) => setUnlockTime(e.target.value)} />

              <Label>Passcode *</Label>
              <Input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Set a secret passcode"
              />

              {error && <ErrorText>{error}</ErrorText>}

              <Button onClick={handleCreateGift} disabled={loading}>
                {loading ? "Creating..." : "Create Gift"}
              </Button>
            </>
          )}
        </Card>
      </PageContainer>
      <Footer>
        Developed by{" "}
        <a href="https://www.linkedin.com/in/govarthan-v/" target="_blank" rel="noopener noreferrer">
          Govarthan V
        </a>
      </Footer>
    </ThemeProvider>
  );
}

export default CreateGiftPage;
