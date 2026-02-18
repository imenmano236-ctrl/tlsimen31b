const express = require("express");
const app = express();

app.use(express.json());

// ================= TELEGRAM =================
async function sendTelegramAlert(message) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log("Telegram not configured.");
      return;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message })
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

// ================= MONITORING =================
let monitoringConfig = null;
let isMonitoring = false;

app.get("/api/monitoring/config", (req, res) => {
  res.json({
    success: true,
    data: { ...monitoringConfig, isMonitoring }
  });
});

app.post("/api/monitoring/config", (req, res) => {
  monitoringConfig = req.body;
  res.json({ success: true, message: "Config saved" });
});

app.put("/api/monitoring/config", (req, res) => {
  monitoringConfig = req.body;
  res.json({ success: true, message: "Config updated" });
});

app.post("/api/monitoring/start", async (req, res) => {
  if (!monitoringConfig) {
    return res.status(400).json({ success: false, error: "No config set" });
  }

  isMonitoring = true;

  // Simuler la logique TLS ici
  setTimeout(async () => {
    console.log("TLS check simulated...");
    await sendTelegramAlert("🚨 TLS slot available!");
  }, 5000); // simulate après 5s

  res.json({ success: true, message: "Monitoring started" });
});

app.post("/api/monitoring/stop", (req, res) => {
  isMonitoring = false;
  res.json({ success: true, message: "Monitoring stopped" });
});

// ================= TEST ALERT =================
app.post("/alert", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  await sendTelegramAlert(message);
  res.json({ status: "Alert sent" });
});

// ================= HOME =================
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
