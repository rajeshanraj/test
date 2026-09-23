const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Serve Frontend static assets
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../")));

// Firebase Initialization
let ticketsRef = null;
let feedbackRef = null;

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  const db = admin.database();
  ticketsRef = db.ref("uucms_tickets");
  feedbackRef = db.ref("uucms_feedback");
} catch (err) {
  console.warn("Firebase Admin Initialization Note:", err.message);
}

// Register API Routes
app.use("/api/tickets", require("./routes/tickets")(ticketsRef));
app.use("/api/feedback", require("./routes/feedback")(feedbackRef));
app.use("/api/admin", require("./routes/admin")(ticketsRef));

// Serve Root index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Freshtime Portal Server running on port ${PORT}`));