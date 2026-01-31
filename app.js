/*********************************
 * TELEGRAM WEB APP INIT
 *********************************/
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

/*********************************
 * CONFIG & STATE
 *********************************/
const BACKEND_URL = "https://selfsignal.onrender.com";
const AVERAGE = 50;

let data;
let current = 0;
let selected = null;

let state = {
  expressiveness: 50,
  control: 50,
  clarity: 50,
  warmth: 50,
  influence: 50
};

const visuals = {
  expressiveness: "linear-gradient(135deg,#4c1d95,#2e1065)",
  control: "linear-gradient(135deg,#1e293b,#0f172a)",
  clarity: "linear-gradient(135deg,#064e3b,#022c22)",
  warmth: "linear-gradient(135deg,#3f1d2b,#1f0f14)",
  influence: "linear-gradient(135deg,#312e81,#1e1b4b)"
};

/*********************************
 * BACKEND HELPER
 *********************************/
async function notifyBackend(text) {
  try {
    await fetch(`${BACKEND_URL}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
  } catch (e) {
    console.error("Render error:", e);
  }
}

/*********************************
 * LOAD QUESTIONS
 *********************************/
fetch("questions.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    render();
  });

/*********************************
 * RENDER QUESTION
 *********************************/
function render() {
  const q = data.questions[current];
  document.getElementById("illustration").style.background = visuals[q.visual] || "#333";
  document.getElementById("question").innerText = q.text;

  const options = document.getElementById("options");
  options.innerHTML = "";
  selected = null;
  document.getElementById("nextBtn").disabled = true;

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt.text;
    btn.onclick = () => {
      document.querySelectorAll("#options button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selected = opt.effects;
      document.getElementById("nextBtn").disabled = false;
    };
    options.appendChild(btn);
  });
}

/*********************************
 * NEXT QUESTION
 *********************************/
document.getElementById("nextBtn").onclick = () => {
  for (let k in selected) {
    state[k] = Math.max(0, Math.min(100, state[k] + selected[k]));
  }
  current++;
  current < data.questions.length ? render() : showResult();
};

function diffText(value, high, low) {
  const d = value - AVERAGE;
  if (d > 0) return `на ${d}% ${high} среднего`;
  if (d < 0) return `на ${Math.abs(d)}% ${low} среднего`;
  return "примерно как у большинства";
}

/*********************************
 * SHOW RESULT
 *********************************/
function showResult() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");

  const text = `
— Выраженность: ${diffText(state.expressiveness,"ярче","менее заметен, чем")}
— Контроль: ${diffText(state.control,"спокойнее","менее собран, чем")}
— Читаемость: ${diffText(state.clarity,"понятнее","сложнее понять, чем")}
— Теплота: ${diffText(state.warmth,"теплее","холоднее, чем")}
— Влияние: ${diffText(state.influence,"влияешь сильнее","влияешь слабее, чем")}

Ты не крайность — ты комбинация.
Именно такие люди запоминаются.
  `.trim();

  document.getElementById("resultText").innerText = text;

  notifyBackend(`🧠 Пользователь прошёл тест\n\n${text}`);

  document.getElementById("shareBtn").onclick = () => {
    tg.shareText(`Мой профиль восприятия 👀\n\n${text}`);
  };

  document.getElementById("unlockBtn").onclick = showAd;
}

/*********************************
 * ADSGRAM LOGIC
 *********************************/
function showAd() {
  // Получаем ID пользователя из TG
  const userId = tg.initDataUnsafe?.user?.id || "unknown";

  // Инициализируем Adsgram
  const ad = window.Adsgram.init({
    blockId: "29169d6338f2416594c7ecc0ca3d8298", // ЗАМЕНИ НА СВОЙ ID БЛОКА
    userId: userId.toString(),       // Передаем ID для Reward URL
    debug: false 
  });

  ad.show()
    .then(() => {
      // Пользователь досмотрел рекламу
      unlockExtended();
      notifyBackend(`✅ Реклама досмотрена (User: ${userId})`);
    })
    .catch((error) => {
      console.error("Ad error or skip:", error);
      alert("Чтобы увидеть разбор, нужно досмотреть рекламу до конца.");
    });
}

function unlockExtended() {
  document.querySelector(".locked").classList.add("hidden");
  document.getElementById("extendedResult").classList.remove("hidden");

  document.getElementById("extendedText").innerText = `
Люди чувствуют в тебе глубину.
Ты не из тех, кого сразу считывают — и в этом твой плюс.

• Ты производишь эффект спокойной уверенности
• Тебя уважают больше, чем ты думаешь
• Иногда тебе стоит быть чуть яснее — и твой эффект усилится

Совет: не ускоряйся. Твоя сила — в точности.
  `.trim();
}
