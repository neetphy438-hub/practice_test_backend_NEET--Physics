const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Load allowed emails from students.json
let allowedEmails = JSON.parse(fs.readFileSync("students.json")).map(email => email.toLowerCase());

// Store active sessions
let activeSessions = {};

// === POST /login ===
app.post("/login", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const normalizedEmail = email.toLowerCase();

  if (!allowedEmails.includes(normalizedEmail)) {
    return res.status(401).json({ error: "Email not allowed" });
  }

  const token = Math.random().toString(36).substring(2);
  activeSessions[normalizedEmail] = token;

  console.log(`✅ Login: ${normalizedEmail}, token=${token}`);
  res.json({ token });
});

// === POST /validate ===
app.post("/validate", (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) return res.json({ valid: false });

  const normalizedEmail = email.toLowerCase();
  const valid = activeSessions[normalizedEmail] === token;

  res.json({ valid });
});

// ✅ Serve static frontend from Public folder
app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
