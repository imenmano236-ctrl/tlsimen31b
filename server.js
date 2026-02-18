const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// ===============================
// CONFIG STOCKAGE EN MÉMOIRE
// ===============================

let monitoringInterval = null;
let monitoringConfig = null;

// ===============================
// TELEGRAM FUNCTION
// ===============================

async function sendTelegramAlert(message) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log("Telegram not configured.");
      return;
    }

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
    });

    console.log("Telegram alert sent ✅");
  } catch (error) {
    console.log("Telegram error:", error.message);
  }
}

// ===============================
// MONITORING LOGIC
// ===============================

async function checkSlots() {
  try {
    console.log("Checking slots...");

    // 👉 ICI TU METS TA LOGIQUE DE CHECK TLS
    // Exemple fake (remplace par ta vraie logique)
    const slotFound = Math.random() < 0.05; // 5% test

    if (slotFound) {
      console.log("🚨 SLOT FOUND !");
      await sendTelegramAlert("🚨 TLS SLOT DISPONIBLE TROUVÉ !");
    }

  } catch (error) {
    console.log("Monitoring error:", error.message);
  }
}

// ===============================
// API ROUTES
// ===============================

// Get config
app.get("/api/monitoring/config", (req, res) => {
  res.json({
    success: true,
    data: monitoringConfig,
    isMonitoring: !!monitoringInterval
  });
});

// Save config
app.post("/api/monitoring/config", (req, res) => {
  monitoringConfig = req.body;
  res.json({ success: true });
});

// Start monitoring
app.post("/api/monitoring/start", (req, res) => {
  if (!monitoringConfig) {
    return res.status(400).json({
      success: false,
      message: "No config set"
    });
  }

  if (monitoringInterval) {
    return res.json({
      success: true,
      message: "Already running"
    });
  }

  monitoringInterval = setInterval(checkSlots, 30000); // toutes les 30 sec

  console.log("Monitoring started ✅");

  res.json({ success: true });
});

// Stop monitoring
app.post("/api/monitoring/stop", (req, res) => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log("Monitoring stopped ❌");
  }

  res.json({ success: true });
});

// Health check
app.get("/", (req, res) => {
  res.send("TLS Monitoring Server Running 🚀");
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
