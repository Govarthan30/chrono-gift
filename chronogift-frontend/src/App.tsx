import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

const BACKEND_URL = "http://localhost:5000";

// -------------------- Interfaces --------------------
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

// -------------------- App Component --------------------
function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
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
  );
}

// -------------------- Login Page --------------------
function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (credentialResponse) => {
      try {
        const accessToken = credentialResponse.access_token;
        if (!accessToken) return alert("Google login failed: No access token");

        const res = await axios.post(`${BACKEND_URL}/api/auth/google`, { accessToken });
        onLogin(res.data.user);
        navigate("/");
      } catch {
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

// -------------------- Create Gift Page --------------------
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
      setLoading(false);
    } catch {
      setLoading(false);
      alert("Failed to create gift");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20, border: "1px solid #ddd", borderRadius: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2>Create Time-Locked Gift</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <label>Receiver's Email *</label>
      <input
        type="email"
        value={receiverEmail}
        onChange={(e) => setReceiverEmail(e.target.value)}
        placeholder="example@domain.com"
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <label>Message</label>
      <textarea
        value={textMessage}
        onChange={(e) => setTextMessage(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <label>Unlock Date *</label>
      <input
        type="date"
        value={unlockDate}
        onChange={(e) => setUnlockDate(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <label>Unlock Time *</label>
      <input
        type="time"
        value={unlockTime}
        onChange={(e) => setUnlockTime(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <label>Passcode *</label>
      <input
        type="password"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        placeholder="Set a passcode"
        style={{ width: "100%", padding: 8, marginBottom: 20 }}
      />

      <button onClick={handleCreateGift} disabled={loading} style={{ padding: "10px 20px", fontSize: 16 }}>
        {loading ? "Creating Gift..." : "Create Gift"}
      </button>

      {giftLink && (
        <div style={{ marginTop: 20 }}>
          <strong>Gift Link:</strong>
          <p>
            <a href={giftLink} target="_blank" rel="noopener noreferrer">
              {giftLink}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

// -------------------- Open Gift Page --------------------
function OpenGiftPage() {
  const { giftId } = useParams<{ giftId: string }>();
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);
  const [googleSignedIn, setGoogleSignedIn] = useState(false);

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (credentialResponse) => {
      try {
        const accessToken = credentialResponse.access_token;
        if (!accessToken) return alert("Google login failed");

        const res = await axios.post(`${BACKEND_URL}/api/auth/google`, { accessToken });
        setEmail(res.data.user.email);
        setGoogleSignedIn(true);
      } catch (err) {
        alert("Google sign-in failed");
      }
    },
    onError: () => alert("Google sign-in failed"),
  });

  const openGift = async () => {
    if (!email || !passcode) {
      setError("Please sign in and enter passcode");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await axios.post(`${BACKEND_URL}/api/gift/open`, {
        giftId,
        enteredPasscode: passcode,
        userEmail: email,
      });
      setGift(res.data.gift);
      setOpened(true);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || "Failed to open gift");
    }
  };

  if (!giftId) {
    return <p>Invalid gift link</p>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20, border: "1px solid #ddd", borderRadius: 6 }}>
      {!opened ? (
        <>
          <h2>Open Gift</h2>

          {!googleSignedIn ? (
            <button onClick={() => login()} style={{ padding: "10px 20px", fontSize: 16, marginBottom: 12 }}>
              Sign in with Google to Continue
            </button>
          ) : (
            <>
              <p><strong>Signed in as:</strong> {email}</p>

              <div style={{ marginBottom: 12 }}>
                <label>Passcode</label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                />
              </div>

              {error && (
                <p style={{ color: "red", marginBottom: 12 }}>
                  {error}
                </p>
              )}

              <button
                onClick={openGift}
                disabled={loading}
                style={{ padding: "10px 20px", fontSize: 16, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Opening Gift..." : "Open Gift"}
              </button>
            </>
          )}
        </>
      ) : gift ? (
        <div style={{ marginTop: 20 }}>
          <h3>Gift Content:</h3>
          {gift.textMessage && <p>{gift.textMessage}</p>}
          {gift.imageUrl && (
            <img
              src={gift.imageUrl}
              alt="Gift"
              style={{ maxWidth: "100%", height: "auto", marginTop: 10 }}
            />
          )}
          {gift.videoUrl && (
            <video
              src={gift.videoUrl}
              controls
              style={{ maxWidth: "100%", marginTop: 10 }}
            />
          )}
          {!gift.textMessage && !gift.imageUrl && !gift.videoUrl && (
            <p>This gift contains no content.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}


export default App;
