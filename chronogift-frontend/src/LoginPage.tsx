import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import type { User } from "./types"; // Assuming types are exported from App.tsx
import { PageContainer, Card, Button } from "./styles";

const BACKEND_URL = "http://localhost:5000";

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const navigate = useNavigate();

  const handleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const { access_token } = credentialResponse;
        const res = await axios.post(`${BACKEND_URL}/api/auth/google`, { accessToken: access_token });
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
    <PageContainer>
      <Card style={{ textAlign: "center" }}>
        <h1 style={{ marginTop: 0 }}>Welcome to ChronoGift 🎁</h1>
        <p>Send digital gifts that unlock in the future.</p>
        <Button onClick={() => handleLogin()}>
          Sign in with Google
        </Button>
      </Card>
    </PageContainer>
  );
}

export default LoginPage;