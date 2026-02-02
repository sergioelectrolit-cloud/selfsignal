const tg = window.Telegram.WebApp;
tg.ready();

const BACKEND_URL = "https://selfsignal.onrender.com";

// Функция загрузки SDK
async function loadAdsgram() {
    return new Promise((resolve, reject) => {
        if (window.Adsgram) return resolve(window.Adsgram);
        
        const script = document.createElement('script');
        script.src = "https://static.adsgram.ai/js/adsgram-sdk.js"; // Обновленный URL
        script.onload = () => resolve(window.Adsgram);
        script.onerror = () => reject(new Error("Не удалось загрузить SDK"));
        document.head.appendChild(script);
    });
}

// Глобальная переменная для рекламного контроллера
let adController = null;

async function initAds() {
    try {
        await loadAdsgram();
        const userId = tg.initDataUnsafe?.user?.id?.toString() || "12345";
        
        adController = window.Adsgram.init({
            blockId: "22095", 
            userId: userId,
            debug: true 
        });
        console.log("Adsgram готов");
    } catch (e) {
        console.error("Ошибка инициализации рекламы:", e);
    }
}

initAds();

document.getElementById("unlockBtn").onclick = async function() {
    if (!adController) {
        alert("Реклама еще загружается или произошла ошибка. Попробуйте позже.");
        return;
    }

    adController.show()
        .then((result) => {
            // ВАЖНО: Проверяем свойство done
            if (result.done) {
                alert("Реклама полностью просмотрена!");
                document.getElementById("extendedResult").classList.remove("hidden");
                document.getElementById("extendedText").innerText = "Твой результат готов!";
            } else {
                alert("Вы закрыли рекламу слишком рано.");
            }
        })
        .catch((err) => {
            // Обработка отсутствия рекламы (No Fill) или ошибок сети
            console.error(err);
            alert("Реклама сейчас недоступна: " + (err.description || "Ошибка сети"));
        });
};    .then(r => r.json())
    .then(json => {
        alert("Вопросы загружены!");
        window.quizData = json;
        initQuiz();
    })
    .catch(e => alert("Ошибка загрузки JSON: " + e.message));

function initQuiz() {
    // Упрощенная логика для теста кнопки
    document.getElementById("question").innerText = "Нажми 'Дальше', чтобы дойти до рекламы";
    document.getElementById("nextBtn").disabled = false;
    document.getElementById("nextBtn").onclick = () => {
        document.getElementById("app").classList.add("hidden");
        document.getElementById("result").classList.remove("hidden");
        document.getElementById("resultText").innerText = "Тест завершен. Нажми кнопку ниже.";
    };
}

// 4. ГЛАВНАЯ ФУНКЦИЯ КНОПКИ
document.getElementById("unlockBtn").onclick = async function() {
    alert("Кнопка нажата! Начинаю инициализацию рекламы...");

    if (!window.Adsgram) {
        alert("Ошибка: Объект window.Adsgram всё еще пуст. Реклама не загрузится.");
        return;
    }

    try {
        const userId = tg.initDataUnsafe?.user?.id?.toString() || "12345";
        
        const ad = window.Adsgram.init({
            blockId: "22095", // Твой ID
            userId: userId,
            debug: true 
        });

        alert("Adsgram инициализирован. Вызываю ad.show()...");

        ad.show()
            .then(() => {
                alert("УРА! Реклама досмотрена!");
                document.getElementById("extendedResult").classList.remove("hidden");
                document.getElementById("extendedText").innerText = "Твой расширенный результат готов!";
            })
            .catch((err) => {
                alert("Adsgram вернул отказ: " + JSON.stringify(err));
            });

    } catch (e) {
        alert("Фатальная ошибка в коде: " + e.message);
    }
};
