import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import moment from "moment-timezone";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------- MongoDB Connection ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ---------- Schemas ----------
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

const giftSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverEmail: { type: String, required: true },
  textMessage: String,
  imageUrl: String,
  videoUrl: String,
  unlockTimestamp: { type: Date, required: true },
  passcode: { type: String, required: true, select: true },
  isOpened: { type: Boolean, default: false },
}, { timestamps: true });

giftSchema.pre("save", async function (next) {
  if (!this.isModified("passcode")) return next();
  const salt = await bcrypt.genSalt(10);
  this.passcode = await bcrypt.hash(this.passcode, salt);
  next();
});

giftSchema.methods.comparePasscode = async function (enteredPasscode) {
  return await bcrypt.compare(enteredPasscode, this.passcode);
};

const Gift = mongoose.model("Gift", giftSchema);

const transactionSchema = new mongoose.Schema({
  giftId: { type: mongoose.Schema.Types.ObjectId, ref: "Gift", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["CREATED", "OPENED"], required: true },
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

const messageSchema = new mongoose.Schema({
  giftId: { type: mongoose.Schema.Types.ObjectId, ref: "Gift", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverEmail: { type: String, required: true },
  messageText: { type: String, required: true },
}, { timestamps: true });

const GiftMessage = mongoose.model("GiftMessage", messageSchema);

// ---------- Google Auth ----------
const verifyGoogleTokenAndGetUser = async (accessToken) => {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error("Invalid Google access token");

  const payload = await response.json();
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ googleId });
  if (!user) {
    user = await User.create({ googleId, email, name, picture });
  }
  return user;
};

// ---------- API Routes ----------

// Auth
app.post("/api/auth/google", async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: "Access token required" });

  try {
    const user = await verifyGoogleTokenAndGetUser(accessToken);
    res.status(200).json({
      message: "Authentication successful",
      user: { id: user._id, email: user.email, name: user.name, picture: user.picture },
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
    const istMoment = moment.tz(unlockTimestamp, "Asia/Kolkata");
    if (!istMoment.isValid()) {
      return res.status(400).json({ error: "Invalid unlockTimestamp format" });
    }

    const gift = new Gift({
      senderId,
      receiverEmail,
      textMessage,
      imageUrl,
      videoUrl,
      unlockTimestamp: istMoment.toDate(),
      passcode,
    });

    await gift.save();

    await Transaction.create({
      giftId: gift._id,
      sender: senderId,
      status: "CREATED",
    });

    res.status(201).json({ message: "Gift created successfully", gift });
  } catch (error) {
    console.error("Gift creation error:", error);
    res.status(500).json({ error: "Failed to create gift" });
  }
});

// Open Gift
app.post("/api/gift/open", async (req, res) => {
  const { giftId, enteredPasscode, accessToken } = req.body;
  if (!giftId || !enteredPasscode || !accessToken) {
    return res.status(400).json({ error: "Gift ID, passcode, and access token are required." });
  }

  try {
    const receiverUser = await verifyGoogleTokenAndGetUser(accessToken);
    const gift = await Gift.findById(giftId).select("+passcode");

    if (!gift) return res.status(404).json({ error: "Gift not found" });

    if (gift.receiverEmail !== receiverUser.email.toLowerCase()) {
      return res.status(403).json({ error: "This gift is intended for another recipient." });
    }

    const nowIST = moment().tz("Asia/Kolkata").toDate();
    if (nowIST < gift.unlockTimestamp) {
      return res.status(403).json({
        error: `Gift unlocks at ${moment(gift.unlockTimestamp).tz("Asia/Kolkata").format("LLLL")}`,
      });
    }

    const isPasscodeCorrect = await gift.comparePasscode(enteredPasscode);
    if (!isPasscodeCorrect) {
      return res.status(401).json({ error: "Incorrect passcode." });
    }

    gift.isOpened = true;
    gift.receiverId = receiverUser._id;
    await gift.save();

    await Transaction.create({
      giftId: gift._id,
      sender: gift.senderId,
      receiver: receiverUser._id,
      status: "OPENED",
    });

    const giftObj = gift.toObject();
    delete giftObj.passcode;

    res.status(200).json({ message: "Gift opened successfully!", gift: giftObj });
  } catch (error) {
    console.error("Error opening gift:", error);
    res.status(500).json({ error: "Failed to open gift." });
  }
});

// Get Gift
app.get("/api/gift/:id", async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.id).select("-passcode -receiverEmail");
    if (!gift) return res.status(404).json({ error: "Gift not found" });
    res.status(200).json(gift);
  } catch (err) {
    console.error("Error fetching gift:", err);
    res.status(500).json({ error: "Failed to fetch gift" });
  }
});

// Gift Messages
app.post("/api/gift/messages", async (req, res) => {
  const { giftId, senderId, receiverEmail, messageText } = req.body;
  if (!giftId || !senderId || !receiverEmail || !messageText) {
    return res.status(400).json({ error: "Missing required fields for message." });
  }

  try {
    const message = await GiftMessage.create({ giftId, senderId, receiverEmail, messageText });
    res.status(201).json({ message: "Message saved", data: message });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message." });
  }
});

app.get("/api/gift/messages/:giftId", async (req, res) => {
  try {
    const messages = await GiftMessage.find({ giftId: req.params.giftId }).populate("senderId", "name email");
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// Transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("giftId", "createdAt")
      .populate("sender", "name email")
      .populate("receiver", "name email");
    res.status(200).json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ---------- Serve Frontend ----------

app.use(express.static(path.join(__dirname, "chronogift-frontend", "dist")));

app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "chronogift-frontend", "dist", "index.html"));
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
