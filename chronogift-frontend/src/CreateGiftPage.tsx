import { useState } from "react";
import axios from "axios";
import type { User } from "./types";
import { PageContainer, Card, Input, TextArea, Button, Label, ErrorText } from "./styles";

const BACKEND_URL = "http://localhost:5000";

function CreateGiftPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [giftLink, setGiftLink] = useState<string | null>(null);

  const handleCreateGift = async () => {
    if (!receiverEmail || !unlockDate || !unlockTime || !passcode) {
      setError("Please fill all required fields marked with *");
      return;
    }
    setError("");
    setLoading(true);
    
    try {
      const unlockTimestamp = new Date(`${unlockDate}T${unlockTime}`).toISOString();
      const res = await axios.post(`${BACKEND_URL}/api/gift`, {
        senderId: user.id,
        receiverEmail,
        textMessage,
        unlockTimestamp,
        passcode,
      });
      setGiftLink(`${window.location.origin}/gift/${res.data.gift._id}`);
    } catch(err) {
      console.error(err);
      setError("Failed to create gift. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: 20 }}>
          <h2>Create Time-Locked Gift</h2>
          <Button onClick={onLogout} style={{backgroundColor: '#6c757d'}}>Logout</Button>
        </div>

        {giftLink ? (
          <div>
            <h3>Gift Created!</h3>
            <p>Share this link with the recipient:</p>
            <a href={giftLink} target="_blank" rel="noopener noreferrer">{giftLink}</a>
            <Button onClick={() => setGiftLink(null)} style={{marginTop: '20px', width: '100%'}}>Create another gift</Button>
          </div>
        ) : (
          <>
            <Label>Receiver's Email *</Label>
            <Input type="email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} placeholder="example@domain.com" />

            <Label>Message</Label>
            <TextArea value={textMessage} onChange={(e) => setTextMessage(e.target.value)} rows={4} />

            <Label>Unlock Date *</Label>
            <Input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} />

            <Label>Unlock Time *</Label>
            <Input type="time" value={unlockTime} onChange={(e) => setUnlockTime(e.target.value)} />

            <Label>Passcode *</Label>
            <Input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Set a secret passcode" />
            
            {error && <ErrorText>{error}</ErrorText>}
            
            <Button onClick={handleCreateGift} disabled={loading}>
              {loading ? "Creating..." : "Create Gift"}
            </Button>
          </>
        )}
      </Card>
    </PageContainer>
  );
}

export default CreateGiftPage;