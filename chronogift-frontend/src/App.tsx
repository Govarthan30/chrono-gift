import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

const BACKEND_URL = "http://localhost:5000";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface Gift {
  _id: string;
  senderId: string;
  receiverEmail: string;
  textMessage?: string;
  imageUrl?: string;
  videoUrl?: string;
  unlockTimestamp: string | number;
  passcode: string;
  isOpened: boolean;
  createdAt: string | number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <CreateGiftPage user={user} onLogout={() => setUser(null)} /> : <LoginPage onLogin={setUser} />}
      />
      <Route path="/gift/:giftId" element={<OpenGiftPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// ---------- LOGIN PAGE ----------
function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (credentialResponse) => {
      try {
        const accessToken = credentialResponse.access_token;
        if (!accessToken) return alert("Google login failed: No access token");

        // Send accessToken to backend
        const res = await axios.post(`${BACKEND_URL}/api/auth/google`, { accessToken });
        onLogin(res.data.user);
        navigate("/");
      } catch (err) {
        alert("Google login failed");
      }
    },
    onError: () => alert("Google login failed"),
  });

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1>Welcome to ChronoGift 🎁</h1>
      <button onClick={() => login()} style={{ padding: "10px 20px", fontSize: 16 }}>
        Sign in with Google
      </button>
    </div>
  );
}

// ---------- CREATE GIFT PAGE ----------
function CreateGiftPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [giftLink, setGiftLink] = useState<string | null>(null);

  const handleCreateGift = async () => {
    if (!receiverEmail || !unlockDate || !unlockTime || !passcode) {
      alert("Please fill all required fields");
      return;
    }
    try {
      setLoading(true);
      const unlockTimestamp = new Date(`${unlockDate}T${unlockTime}`).toISOString();
      const res = await axios.post(`${BACKEND_URL}/api/gift`, {
        senderId: user.id,
        receiverEmail,
        textMessage,
        unlockTimestamp,
        passcode,
      });
      setGiftLink(`${window.location.origin}/gift/${res.data.gift._id}`);
    } catch (err) {
      alert("Failed to create gift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "20px auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Hello, {user.name}</h2>
        <button onClick={onLogout}>Logout</button>
      </header>

      <h3>Create a Time-locked Gift</h3>

      <label>
        Receiver Email*:
        <input
          type="email"
          value={receiverEmail}
          onChange={(e) => setReceiverEmail(e.target.value)}
          required
          style={{ width: "100%" }}
        />
      </label>

      <label>
        Text Message:
        <textarea value={textMessage} onChange={(e) => setTextMessage(e.target.value)} />
      </label>

      <label>
        Unlock Date*:
        <input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} required />
      </label>

      <label>
        Unlock Time*:
        <input type="time" value={unlockTime} onChange={(e) => setUnlockTime(e.target.value)} required />
      </label>

      <label>
        Passcode*:
        <input
          type="text"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          required
          placeholder="Enter a passcode to unlock"
        />
      </label>

      <button onClick={handleCreateGift} disabled={loading} style={{ marginTop: 10 }}>
        {loading ? "Creating..." : "Create Gift"}
      </button>

      {giftLink && (
        <div style={{ marginTop: 20 }}>
          <p>Share this link with the receiver:</p>
          <a href={giftLink} target="_blank" rel="noreferrer">
            {giftLink}
          </a>
        </div>
      )}
    </div>
  );
}

// ---------- OPEN GIFT PAGE ----------
function OpenGiftPage() {
  const { giftId } = useParams();
  const [userEmail, setUserEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [gift, setGift] = useState<Gift | null>(null);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenGift = async () => {
    if (!giftId) return;

    if (!userEmail || !passcode) {
      alert("Please enter your email and passcode");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/gift/open`, {
        giftId,
        enteredPasscode: passcode,
        userEmail,
      });

      setGift(res.data.gift);
      setOpened(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to open gift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, border: "1px solid #ddd", borderRadius: 6 }}>
      <h2>Open Your Time-locked Gift</h2>
      {!opened ? (
        <>
          <label>
            Your Email:
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Passcode:
            <input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>

          <button onClick={handleOpenGift} disabled={loading} style={{ marginTop: 10 }}>
            {loading ? "Opening..." : "Open Gift"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      ) : gift ? (
        <div style={{ marginTop: 20 }}>
          <h3>Gift Content:</h3>
          {gift.textMessage && <p>{gift.textMessage}</p>}
          {gift.imageUrl && <img src={gift.imageUrl} alt="Gift" style={{ maxWidth: "100%" }} />}
          {gift.videoUrl && (
            <video controls style={{ maxWidth: "100%" }}>
              <source src={gift.videoUrl} />
              Your browser does not support the video tag.
            </video>
          )}
          <p>
            <strong>Unlocked At:</strong> {new Date(gift.unlockTimestamp).toLocaleString()}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default App;
