import { useState } from "react";
import { useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import type { Gift } from "./types";
import { PageContainer, Card, Input, Button, Label, ErrorText } from "./styles";

const BACKEND_URL = "http://localhost:5000";

type PageState = "auth" | "passcode" | "opened" | "error";

function OpenGiftPage() {
  const { giftId } = useParams<{ giftId: string }>();
  const [pageState, setPageState] = useState<PageState>("auth");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setAccessToken(credentialResponse.access_token);
    setPageState("passcode");
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google Sign-In failed. Please try again."),
  });

  const handleOpenGift = async () => {
    if (!passcode || !accessToken) {
      setError("Passcode is required.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/api/gift/open`, {
        giftId,
        enteredPasscode: passcode,
        accessToken,
      });
      setGift(res.data.gift);
      setPageState("opened");
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      const serverError = axiosError.response?.data?.error || "An unknown error occurred.";
      setError(serverError);
      setPageState("error");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (pageState) {
      case "auth":
        return (
          <div style={{ textAlign: "center" }}>
            <h2>You've Received a Gift!</h2>
            <p>Sign in with Google to verify you're the recipient.</p>
            <Button onClick={() => login()}>Sign in with Google</Button>
            {error && <ErrorText style={{marginTop: '15px'}}>{error}</ErrorText>}
          </div>
        );
      case "passcode":
        return (
          <>
            <h2>Enter Passcode</h2>
            <p>The sender has provided you with a passcode to open this gift.</p>
            <Label>Passcode</Label>
            <Input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
            />
            <Button onClick={handleOpenGift} disabled={loading}>
              {loading ? "Opening..." : "Open Gift"}
            </Button>
          </>
        );
      case "opened":
        return gift ? (
          <div>
            <h3>Your Gift is Unlocked!</h3>
            {gift.textMessage && <p style={{ fontSize: '1.1em', whiteSpace: 'pre-wrap' }}>{gift.textMessage}</p>}
            {gift.imageUrl && <img src={gift.imageUrl} alt="Gift" style={{ maxWidth: "100%", marginTop: 10, borderRadius: '8px' }} />}
            {gift.videoUrl && <video src={gift.videoUrl} controls style={{ maxWidth: "100%", marginTop: 10, borderRadius: '8px' }} />}
            {!gift.textMessage && !gift.imageUrl && !gift.videoUrl && (
              <p>This gift is a beautiful thought, with no attached content.</p>
            )}
          </div>
        ) : null;
      case "error":
        return (
          <div style={{ textAlign: "center" }}>
            <h2>Something went wrong</h2>
            <ErrorText>{error}</ErrorText>
            <Button onClick={() => setPageState("auth")}>Try Again</Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (!giftId) return <PageContainer><Card><p>Invalid gift link.</p></Card></PageContainer>;

  return (
    <PageContainer>
      <Card>{renderContent()}</Card>
    </PageContainer>
  );
}

export default OpenGiftPage;