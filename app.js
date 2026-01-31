/*********************************
 * 1. ОТЛАДКА (Eruda)
 *********************************/
// Позволяет видеть консоль прямо в Telegram
(function () {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    document.head.appendChild(script);
    script.onload = () => eruda.init();
})();

/*********************************
 * 2. ЗАГРУЗЧИК ADSGRAM
 *********************************/
function loadAdsgram() {
    return new Promise((resolve, reject) => {
        if (window.Adsgram) return resolve(window.Adsgram);
        
        const script = document.createElement('script');
        script.src = "https://adsgram.ai/js/adsgram.min.js?v=" + Date.now(); // Добавляем метку времени от кэша
        script.async = true;
        
        script.onload = () => {
            console.log("✅ Adsgram SDK загружен");
            resolve(window.Adsgram);
        };
        
        script.onerror = () => {
            console.error("❌ Ошибка загрузки Adsgram SDK");
            reject(new Error("Не удалось загрузить рекламный модуль. Проверьте интернет или VPN."));
        };
        
        document.head.appendChild(script);
    });
}

// Запускаем загрузку заранее
loadAdsgram().catch(() => {});

/*********************************
 * 3. ОСНОВНАЯ ЛОГИКА ТЕСТА
 *********************************/
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const BACKEND_URL = "https://selfsignal.onrender.com";
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
    } catch (e) { console.error("Notify error:", e); }
}

fetch("questions.json").then(r => r.json()).then(json => {
    data = json;
    render();
}).catch(e => alert("Ошибка загрузки вопросов: " + e.message));

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

function showResult() {
    document.getElementById("app").classList.add("hidden");
    document.getElementById("result").classList.remove("hidden");
    const resText = `Профиль: Экспрессия ${state.expressiveness}%, Контроль ${state.control}%...`;
    document.getElementById("resultText").innerText = resText;
    
    notifyBackend(`🧠 Тест пройден\n${resText}`);
    
    document.getElementById("unlockBtn").onclick = showAd;
    document.getElementById("shareBtn").onclick = () => tg.shareText(resText);
}

/*********************************
 * 4. РАБОТА С РЕКЛАМОЙ (ADSGRAM)
 *********************************/
async function showAd() {
    const btn = document.getElementById("unlockBtn");
    btn.innerText = "Загрузка...";
    btn.disabled = true;

    try {
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
                notifyBackend(`✅ Реклама досмотрена: ${userId}`);
            })
            .catch((err) => {
                console.warn("Реклама не показана:", err);
                if (err.error === "no_ads") {
                    alert("Реклама закончилась. Открываем результат бесплатно.");
                    unlockExtended();
                } else {
                    alert("Нужно досмотреть видео до конца.");
                    btn.innerText = "Открыть разбор (Реклама) ▶";
                    btn.disabled = false;
                }
            });
            
    } catch (e) {
        console.error("SDK Error:", e);
        alert("Не удалось загрузить рекламу. Возможно, она заблокирована в вашей сети.");
        // В случае ошибки SDK — даем пользователю шанс пройти дальше, чтобы не портить опыт
        btn.innerText = "Ошибка загрузки (Нажми еще раз)";
        btn.disabled = false;
        // Можно раскомментировать строку ниже, чтобы пускать бесплатно при ошибке:
        // unlockExtended();
    }
}

function unlockExtended() {
    document.querySelector(".locked").classList.add("hidden");
    document.getElementById("extendedResult").classList.remove("hidden");
    document.getElementById("extendedText").innerText = "Ты обладаешь редким сочетанием качеств...";
}
