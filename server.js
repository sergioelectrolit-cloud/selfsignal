import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
// Этот секрет должен совпадать с тем, что ты пропишешь в Reward URL в панели Adsgram
const ADSGRAM_SECRET = "my_super_secret_123"; 

// Уведомления из самого приложения
app.post("/notify", async (req, res) => {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: ADMIN_ID,
      text: req.body.text
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

// Reward URL для Adsgram (S2S Callback)
// Настройка в панели Adsgram: https://selfsignal.onrender.com/adsgram-reward?user_id=[userId]&secret=my_super_secret_123
app.get("/adsgram-reward", async (req, res) => {
  try {
    const { user_id, secret } = req.query;

    // Проверка безопасности
    if (secret !== ADSGRAM_SECRET) {
      return res.status(403).send("Forbidden: Invalid secret");
    }

    console.log(`Сервер подтвердил просмотр для: ${user_id}`);

    // Отправляем уведомление админу о честном просмотре
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: ADMIN_ID,
      text: `💰 Награда! Сервер Adsgram подтвердил просмотр.\nUser ID: ${user_id}`
    });

    res.status(200).send("OK");
  } catch (e) {
    console.error("Reward error:", e);
    res.status(500).send("Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
