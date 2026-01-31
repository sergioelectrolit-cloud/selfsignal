/*********************************
 * ADSGRAM AUTO-LOADER & FIX
 *********************************/
function loadAdsgram() {
    return new Promise((resolve, reject) => {
        if (window.Adsgram) {
            resolve(window.Adsgram);
            return;
        }
        console.log("Adsgram не найден, загружаем принудительно...");
        const script = document.createElement('script');
        script.src = "https://adsgram.ai/js/adsgram.min.js";
        script.onload = () => {
            console.log("Adsgram загружен успешно!");
            resolve(window.Adsgram);
        };
        script.onerror = () => reject(new Error("Не удалось загрузить скрипт Adsgram. Проверьте интернет или настройки провайдера."));
        document.head.appendChild(script);
    });
}

// Запускаем загрузку сразу
loadAdsgram().catch(err => console.error(err));
/*********************************
 * TELEGRAM WEB APP INIT
 *********************************/
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Добавляем консоль отладки для Telegram (потом удалишь)
const script = document.createElement('script');
script.src = "//cdn.jsdelivr.net/npm/eruda";
document.head.appendChild(script);
script.onload = () => eruda.init();

const BACKEND_URL = "https://selfsignal.onrender.com";
const AVERAGE = 50;

let data, current = 0, selected = null;
let state = { expressiveness: 50, control: 50, clarity: 50, warmth: 50, influence: 50 };

const visuals = {
    expressiveness: "linear-gradient(135deg,#4c1d95,#2e1065)",
    control: "linear-gradient(135deg,#1e293b,#0f172a)",
    clarity: "linear-gradient(135deg,#064e3b,#022c22)",
    warmth: "linear-gradient(135deg,#3f1d2b,#1f0f14)",
    influence: "linear-gradient(135deg,#312e81,#1e1b4b)"
};

async function notifyBackend(text) {
    try {
        await fetch(`${BACKEND_URL}/notify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
    } catch (e) { console.error("Render error:", e); }
}

fetch("questions.json").then(r => r.json()).then(json => {
    data = json;
    render();
});

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

document.getElementById("nextBtn").onclick = () => {
    for (let k in selected) state[k] = Math.max(0, Math.min(100, state[k] + selected[k]));
    current++;
    current < data.questions.length ? render() : showResult();
};

function diffText(value, high, low) {
    const d = value - AVERAGE;
    if (d > 0) return `на ${d}% ${high} среднего`;
    if (d < 0) return `на ${Math.abs(d)}% ${low} среднего`;
    return "примерно как у большинства";
}

function showResult() {
    document.getElementById("app").classList.add("hidden");
    document.getElementById("result").classList.remove("hidden");
    const text = `— Выраженность: ${diffText(state.expressiveness,"ярче","менее заметен, чем")}\n— Контроль: ${diffText(state.control,"спокойнее","менее собран, чем")}\n— Читаемость: ${diffText(state.clarity,"понятнее","сложнее понять, чем")}\n— Теплота: ${diffText(state.warmth,"теплее","холоднее, чем")}\n— Влияние: ${diffText(state.influence,"влияешь сильнее","влияешь слабее, чем")}`;
    document.getElementById("resultText").innerText = text;
    notifyBackend(`🧠 Пользователь прошёл тест\n\n${text}`);
    document.getElementById("shareBtn").onclick = () => tg.shareText(text);
    
    // ПРИВЯЗКА КНОПКИ РЕКЛАМЫ
    const unlockBtn = document.getElementById("unlockBtn");
    unlockBtn.onclick = () => {
        console.log("Клик по кнопке разблокировки");
        showAd();
    };
}

/*********************************
 * ADSGRAM + DEBUG
 *********************************/
async function showAd() {
    console.log("Нажата кнопка рекламы");
    
    try {
        // Ждем загрузки SDK, если он еще не готов
        const AdsgramSDK = await loadAdsgram();
        
        const userId = tg.initDataUnsafe?.user?.id?.toString() || "unknown";
        const ad = AdsgramSDK.init({
            blockId: "29169d6338f2416594c7ecc0ca3d8298",
            userId: userId,
            debug: true 
        });

        ad.show()
            .then(() => {
                unlockExtended();
                notifyBackend(`✅ Реклама досмотрена (User: ${userId})`);
            })
            .catch((err) => {
                console.error("Ошибка показа:", err);
                if (err.error === "no_ads") {
                    alert("Рекламы пока нет, открываю результат бесплатно.");
                    unlockExtended();
                } else {
                    alert("Для получения бонуса нужно досмотреть видео.");
                }
            });
            
    } catch (e) {
        console.error(e);
        alert("Ошибка: " + e.message);
    }
}

function unlockExtended() {
    document.querySelector(".locked").classList.add("hidden");
    document.getElementById("extendedResult").classList.remove("hidden");
    document.getElementById("extendedText").innerText = "Ты производишь эффект спокойной уверенности...";
}
