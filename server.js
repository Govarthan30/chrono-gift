import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch"; // npm install node-fetch@2

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: String,
    picture: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Gift Schema
const giftSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverEmail: { type: String, required: true },
    textMessage: String,
    imageUrl: String,
    videoUrl: String,
    unlockTimestamp: { type: Date, required: true },
    passcode: { type: String, required: true },
    isOpened: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Gift = mongoose.model("Gift", giftSchema);

// Google Auth Route
app.post("/api/auth/google", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: "Access token is required" });
  }

  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return res.status(401).json({ error: "Invalid access token" });
    }

    const payload = await response.json();

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, name, picture });
      await user.save();
    }

    res.status(200).json({
      message: "Authentication successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
});

// Create Gift
app.post("/api/gift", async (req, res) => {
  const {
    senderId,
    receiverEmail,
    textMessage,
    imageUrl,
    videoUrl,
    unlockTimestamp,
    passcode,
  } = req.body;

  if (!senderId || !receiverEmail || !unlockTimestamp || !passcode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const gift = new Gift({
      senderId,
      receiverEmail,
      textMessage,
      imageUrl,
      videoUrl,
      unlockTimestamp: new Date(unlockTimestamp),
      passcode,
    });

    await gift.save();

    // Return gift ID along with the gift
    res.status(201).json({ message: "Gift created successfully", gift: { _id: gift._id, ...gift.toObject() } });
  } catch (error) {
    console.error("Gift creation error:", error);
    res.status(500).json({ error: "Failed to create gift" });
  }
});

// Open Gift
app.post("/api/gift/open", async (req, res) => {
  const { giftId, enteredPasscode, userEmail } = req.body;

  if (!giftId || !enteredPasscode || !userEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const gift = await Gift.findById(giftId);
    if (!gift) return res.status(404).json({ error: "Gift not found" });

    if (gift.receiverEmail.toLowerCase() !== userEmail.toLowerCase())
      return res.status(403).json({ error: "You are not the intended recipient" });

    if (gift.passcode !== enteredPasscode)
      return res.status(401).json({ error: "Incorrect passcode" });

    if (Date.now() < gift.unlockTimestamp.getTime())
      return res.status(403).json({ error: "Gift is not yet unlocked" });

    if (gift.isOpened)
      return res.status(403).json({ error: "Gift has already been opened" });

    gift.isOpened = true;
    await gift.save();

    res.status(200).json({ message: "Gift opened successfully", gift });
  } catch (error) {
    console.error("Error opening gift:", error);
    res.status(500).json({ error: "Failed to open gift" });
  }
});

// Get gifts by sender
app.get("/api/gifts/by-user/:userId", async (req, res) => {
  try {
    const gifts = await Gift.find({ senderId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(gifts);
  } catch (error) {
    console.error("Error fetching gift history:", error);
    res.status(500).json({ error: "Failed to fetch gift history" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
