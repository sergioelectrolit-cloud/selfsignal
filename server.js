import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

app.post("/notify", async (req, res) => {
  try {
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: ADMIN_ID,
        text: req.body.text
      }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

app.listen(3000);
app.post('/adsgram/reward', (req, res) => {
  try {
    // Тут можно проверить подпись Adsgram (если дают)
    console.log('Adsgram reward:', req.body);

    // Можно логировать, считать, сохранять
    // Можно отправить себе уведомление в TG

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});
