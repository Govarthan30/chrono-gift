import { useState } from "react";
import axios from "axios";
import type { User } from "./types";
import styled, { keyframes, ThemeProvider, createGlobalStyle,DefaultTheme } from "styled-components";
import { DateTime } from "luxon"; // ✅ Import Luxon

const BACKEND_URL = "https://chrono-gift.onrender.com";

// Themes...
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

const darkTheme: DefaultTheme = {
  mode: "dark",
  background: "#0f1624",
  backgroundGradient: "linear-gradient(135deg, #1a2a6c 0%, #0f1624 100%)",
  headingColor: "#9ecfff",
  cardBackground: "#0f1624",
  cardBg: "#0f1624",
  cardTextColor: "#b3d1ff",
  textPrimary: "#9ecfff",
  textSecondary: "#b3d1ffcc",
  primaryText: "#9ecfff",
  secondaryText: "#b3d1ffcc",
  buttonBg: "#1e3c72",
  buttonGradient: "linear-gradient(45deg, #3771c8, #1e3c72)",
  buttonHoverBg: "#3771c8",
  buttonHoverGradient: "linear-gradient(45deg, #1e3c72, #3771c8)",
  inputBorder: "#3771c8",
  inputBackground: "#14243e",
  inputColor: "#b3d1ff",
  inputFocusBorder: "#5596ff",
  errorColor: "#ff6b6b",
  subHeadingColor: "#a0bfff",
  footerColor: "#b3d1ff",
  footerBg: "#07102d",
  logoutBg: "#ff6b6b",
  logoutHoverBg: "#ff4a4a",
  boxShadow: "0 4px 15px rgba(58, 123, 255, 0.7), 0 8px 30px rgba(0, 0, 0, 0.8)",
};
// Animations and styles
const fadeIn = keyframes` from { opacity: 0; } to { opacity: 1; } `;
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: ${({ theme }) => theme.backgroundGradient};
    color: ${({ theme }) => theme.headingColor};
    transition: background 0.3s ease, color 0.3s ease;
  }
`;
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
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4), 0 8px 30px rgba(0, 0, 0, 0.1);
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
  transition: background 0.3s ease, transform 0.1s ease;
  &:hover {
    background: ${({ theme }) => theme.buttonHoverGradient};
  }
  &:active {
    transform: scale(0.97);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  }
  a {
    word-break: break-word;
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
  box-shadow: 0 3px 10px rgba(255, 126, 95, 0.6);
  &:hover {
    background: ${({ theme }) => theme.buttonHoverGradient};
  }
`;

// 🧠 Main Component
function CreateGiftPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [giftLink, setGiftLink] = useState<string | null>(null);
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = () => {
    setTheme((prev) => (prev.mode === "light" ? darkTheme : lightTheme));
  };

  const handleCreateGift = async () => {
    if (!receiverEmail || !unlockDate || !unlockTime || !passcode) {
      setError("Please fill all required fields marked with *");
      return;
    }

    const indiaTime = DateTime.fromISO(`${unlockDate}T${unlockTime}`, {
      zone: "Asia/Kolkata",
    });

    if (indiaTime <= DateTime.now().setZone("Asia/Kolkata")) {
      setError("Unlock date and time must be in the future.");
      return;
    }

    const unlockTimestamp = indiaTime.toUTC().toISO();

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/gift`, {
        senderId: user.id,
        receiverEmail,
        textMessage,
        unlockTimestamp,
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
              <a href={giftLink} target="_blank" rel="noopener noreferrer">{giftLink}</a>
              <Button onClick={() => setGiftLink(null)} style={{ marginTop: "20px" }}>
                Create another gift
              </Button>
            </GiftLinkContainer>
          ) : (
            <>
              <Label>Receiver's Email *</Label>
              <Input type="email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} />

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
