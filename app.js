// 1. Проверка запуска
alert("Код 3.0 запущен!");

const tg = window.Telegram.WebApp;
tg.ready();

const BACKEND_URL = "https://selfsignal.onrender.com";

// 2. Функция загрузки рекламы
async function loadAdsgram() {
    return new Promise((resolve, reject) => {
        if (window.Adsgram) return resolve(window.Adsgram);
        
        console.log("Пытаюсь скачать Adsgram SDK...");
        const script = document.createElement('script');
        script.src = "https://adsgram.ai/js/adsgram.min.js";
        
        script.onload = () => {
            alert("Adsgram SDK успешно скачан!");
            resolve(window.Adsgram);
        };
        
        script.onerror = () => {
            alert("ОШИБКА: Не удалось скачать файл Adsgram с сервера adsgram.ai");
            reject();
        };
        
        document.head.appendChild(script);
    });
}

// Запускаем загрузку сразу
loadAdsgram();

// 3. Загрузка вопросов
fetch("questions.json")
    .then(r => r.json())
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
