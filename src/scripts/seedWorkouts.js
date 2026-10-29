const path = require("path");
const firebaseApp = require("../firebase");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// 1. НАХОДИМ КЛЮЧ
const scriptDir = __dirname;
const rootDir = path.join(scriptDir, "../../");
const keyPath = path.join(rootDir, "serviceAccountKey.json");

console.log(`🔍 Проверяю путь к ключу: ${keyPath}`);

try {
  const serviceAccount = require(keyPath);
  if (!serviceAccount.project_id) {
    throw new Error("Файл ключа найден, но в нем нет project_id");
  }
  console.log("✅ Файл ключа найден и валиден!");
} catch (e) {
  console.error("❌ ФАТАЛЬНАЯ ОШИБКА: Файл ключа не найден!");
  console.error(e.message);
  console.error(
    "\n💡 Подсказка: Убедись, что serviceAccountKey.json лежит в корне проекта рядом с package.json",
  );
  process.exit(1);
}

const db = getFirestore(firebaseApp);
console.log("✅ Firebase Admin SDK успешно получен из src/firebase.js");

// 3. ДАННЫЕ ЗАНЯТИЙ (ИСПРАВЛЕННЫЙ СИНТАКСИС)
const workoutsData = {
  "17oz5f": {
    _id: "17oz5f",
    exercises: [
      { name: "Ножницы горизонтальные (10 повторений)", quantity: 10 },
      { name: "Ножницы вертикальные (10 повторений)", quantity: 10 },
      { name: "Шлюпка (15 повторений)", quantity: 15 },
    ],
    name: "Тренировка мышц бедер",
    video: "https://www.youtube.com/embed/zxaoes0JQ5g",
  },
  "3yvozj": {
    _id: "3yvozj",
    exercises: [{ name: "Приветствие солнца (10 повторений)", quantity: 10 }],
    name: "Утренняя практика / Йога на каждый день / 1 день / Алексей Казубский",
    video: "https://www.youtube.com/embed/oqe98Dxivns",
  },
  "9mefwq": {
    _id: "9mefwq",
    exercises: [
      { name: "Правильное дыхание (20 повторений)", quantity: 20 },
      {
        name: "Наклон вниз, правая рука тянется вверх (10 повторений)",
        quantity: 10,
      },
      {
        name: "Наклон вниз, левая рука тянется вверх (10 повторений)",
        quantity: 10,
      },
      {
        name: "Перенос веса с ноги на ногу в положении сидя (20 повторений)",
        quantity: 20,
      },
    ],
    name: "Основы стретчинга",
    video: "https://www.youtube.com/embed/Ewm-Bfg5ncg",
  },
  "9yolz2": {
    _id: "9yolz2",
    exercises: [
      { name: "Перекрестные взмахи руками (15 повторений)", quantity: 15 },
      { name: "Собака мордой вверх (10 повторений)", quantity: 10 },
      { name: "Скручивание лежа (5 повторений)", quantity: 5 },
    ],
    name: "Разогрев мышц",
    video: "https://www.youtube.com/embed/IISxKE3LGSE",
  },
  // !!! ВАЖНО: Ключи теперь в кавычках !!!
  a1rqtt: {
    _id: "a1rqtt",
    name: "Урок 2. Основные движения",
    video: "https://www.youtube.com/embed/gJPs7b8SpVw",
  },
  dq9rzo: {
    _id: "dq9rzo",
    name: "Урок 4. Продвинутые движения",
    video: "https://www.youtube.com/embed/3RPauxe4SeE",
  },
  e9ghsb: {
    _id: "e9ghsb",
    name: "Урок 1. Основы",
    video: "https://www.youtube.com/embed/oK2mdodtPY4",
  },
  gh7bd5: {
    _id: "gh7bd5",
    name: "Урок 1. Основы",
    video: "https://www.youtube.com/embed/x6_8ZEYXPak",
  },
  hfgxlo: {
    _id: "hfgxlo",
    exercises: [
      { name: "Наклон вперед (10 повторений)", quantity: 10 },
      { name: "Наклон назад (10 повторений)", quantity: 10 },
      { name: "Поднятие ног, согнутых в коленях (5 повторений)", quantity: 5 },
    ],
    name: "Красота и здоровье / Йога на каждый день / 2 день / Алексей Казубский",
    video: "https://www.youtube.com/embed/v-xTLFDhoD0",
  },
  hwsut5: {
    _id: "hwsut5",
    name: "Урок 2. Основные движения",
    video: "https://youtu.be/embed/UjVtcMD4On4",
  },
  kcx5ai: {
    _id: "kcx5ai",
    exercises: [
      { name: "Наклон к правой ноге (10 повторений)", quantity: 10 },
      { name: "Наклон к левой ноге (10 повторений)", quantity: 10 },
      { name: "Наклон к согнутой правой ноге (10 повторений)", quantity: 10 },
      { name: "Наклон к согнутой левой ноге (10 повторений)", quantity: 10 },
      { name: "Асана стоя (5 повторений)", quantity: 5 },
    ],
    name: "Асаны стоя / Йога на каждый день / 3 день / Алексей Казубский",
    video: "https://www.youtube.com/embed/WxFz-4YsiEE",
  },
  kt6ah4: {
    _id: "kt6ah4",
    exercises: [
      { name: "Сесть на пятки с носками от себя (5 повторений)", quantity: 5 },
      { name: "Сесть на пятки с носками на себя (5 повторений)", quantity: 5 },
      {
        name: "Отпустить колено на пол из позы лотоса (10 повторений)",
        quantity: 10,
      },
      // !!! ИСПРАВЛЕНО: было quanity, стало quantity !!!
      {
        name: "Отпустить колено на пол из позы лотоса с соединенными стопами (10 повторений)",
        quantity: 10,
      },
    ],
    name: "Растягиваем мышцы бедра / Йога на каждый день / 4 день / Алексей Казубский",
    video: "https://www.youtube.com/embed/09uGkAEQuZI",
  },
  mrhuag: {
    _id: "mrhuag",
    exercises: [
      {
        name: "Округляем грудную клетку при выдохе (10 повторений)",
        quantity: 10,
      },
      {
        name: "Тянем левую руку в правую сторону (20 повторений)",
        quantity: 20,
      },
      {
        name: "Тянем правую руку в левую сторону (20 повторений)",
        quantity: 20,
      },
    ],
    name: "Гибкость спины / Йога на каждый день / 5 день / Алексей Казубский",
    video: "https://www.youtube.com/embed/MIvcMapie_A",
  },
  mstcbg: {
    _id: "mstcbg",
    name: "Урок 3. Новые движения",
    video: "https://www.youtube.com/embed/PGAQfXIAY7k",
  },
  n18r8v: {
    _id: "n18r8v",
    name: "Урок 3. Новые движения",
    video: "https://www.youtube.com/embed/gvL27uHhKz4",
  },
  pi5vtr: {
    _id: "pi5vtr",
    exercises: [
      { name: "Поперечная складка вперед (15 повторений)", quantity: 15 },
      { name: "Поза ребенка (5 повторений)", quantity: 5 },
      { name: "Растяжка трицепсов и плеч (20 повторений)", quantity: 20 },
    ],
    name: "Разогрев мышц 2.0",
    video: "https://www.youtube.com/embed/HKB89EIJ2J0",
  },
  pyvaec: {
    _id: "pyvaec",
    exercises: [
      { name: "Крендель (15 повторений)", quantity: 15 },
      { name: "Собачка (20 повторений)", quantity: 20 },
      { name: "Кошка (15 повторений)", quantity: 15 },
    ],
    name: "Тренировка мышц ягодиц",
    video: "https://www.youtube.com/embed/JTCaG3Y9xlM",
  },
  rr70ie: {
    _id: "rr70ie",
    name: "Урок 5. Мастер-класс",
    video: "https://www.youtube.com/embed/_78_OGLyy9Y",
  },
  t3cpno: {
    _id: "t3cpno",
    name: "Урок 4. Продвинутые движения",
    video: "https://www.youtube.com/embed/zuBLSarZuyk",
  },
  xlpkqy: {
    _id: "xlpkqy",
    exercises: [
      { name: "Отведение рук назад (20 повторений)", quantity: 20 },
      { name: "Боковая растяжка (10 повторений)", quantity: 10 },
      { name: "Простой пресс (20 повторений)", quantity: 20 },
    ],
    name: "Техника дыхания",
    video: "https://www.youtube.com/embed/HruMFn74NII",
  },
};

async function seedWorkouts() {
  const batch = db.batch();
  const collectionRef = db.collection("workouts");

  console.log(
    `🚀 Начинаю загрузку ${Object.keys(workoutsData).length} занятий...`,
  );

  Object.entries(workoutsData).forEach(([docId, data]) => {
    const docRef = collectionRef.doc(docId);
    batch.set(docRef, {
      ...data,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  try {
    await batch.commit();
    console.log("✅ Все занятия успешно загружены в Firestore!");
    console.log(
      "👉 Проверь консоль Firebase Console -> Firestore Database -> коллекция workouts!",
    );
  } catch (error) {
    console.error("❌ Ошибка при записи в базу:", error.message);
    if (error.code === 7 || error.message.includes("PERMISSION_DENIED")) {
      console.error(
        "⚠️ Ошибка прав доступа! Зайди в Firebase Console -> Rules и поставь allow read/write true для тестов.",
      );
      console.error("Пример правил для теста:");
      console.error(
        "match /workouts/{document} { allow read, write: if true; }",
      );
    }
    process.exit(1);
  }
}

seedWorkouts().catch(console.error);
