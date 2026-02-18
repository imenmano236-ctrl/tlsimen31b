const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// ===============================
// VARIABLES
// ===============================

let monitoringInterval = null;
let monitoringConfig = null;
let lastAlertTime = 0; // anti-spam

// ===============================
// TELEGRAM ALERT FUNCTION
// ===============================

async function sendTelegramAlert(message) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log("Telegram not configured.");
      return;
    }

    // Anti-spam: 1 message max toutes les 5 minutes
    const now = Date.now();
    if (now - lastAlertTime < 5 * 60 * 1000) {
      console.log("Telegram skipped (anti-spam)");
      return;
    }

    lastAlertTime = now;

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    const data = await response.json();

    if (data.ok) {
      console.log("Telegram alert sent ✅");
    } else {
      console.log("Telegram error:", data);
    }

  } catch (error) {
    console.log("Telegram error:", error.message);
  }
}

// ===============================
// SLOT CHECK FUNCTION
// ===============================

async function checkSlots() {
  try {
    console.log("Checking TLS slots...");

    // ⚠️ REMPLACE CETTE PARTIE PAR TA VRAIE LOGIQUE TLS
    // Ceci est juste un test aléatoire
    const slotFound = Math.random() < 0.05;

    if (slotFound) {
      console.log("🚨 SLOT FOUND !");
      await sendTelegramAlert("🚨 TLS SLOT DISPONIBLE TROUVÉ !");
    }

  } catch (error) {
    console.log("Monitoring error:", error.message);
  }
}

// ===============================
// ROUTES API
// ===============================

// Health check
app.get("/", (req, res) => {
  res.send("TLS Monitoring Server Running 🚀");
});

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

  monitoringInterval = setInterval(checkSlots, 30000); // 30 sec

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

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
