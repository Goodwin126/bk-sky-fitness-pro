require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const admin = require("firebase-admin");
const { cert } = require("firebase-admin/app");
const getFirebaseServices = require("./src/firebase"); // Импортируем нашу фабрику

const serviceAccount = require("./serviceAccountKey.json"); // Ключ лежит в корне проекта

let firebaseApp;

try {
  // Сохраняем результат в переменную firebaseApp
  firebaseApp = admin.initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
  console.log("✅ Firebase Admin SDK успешно инициализирован");
} catch (err) {
  if (err.message.includes("already initialized")) {
    console.warn(
      "⚠️ Firebase уже инициализирован, используем существующий экземпляр.",
    );
    firebaseApp = admin.app();
  } else {
    console.error("❌ Критическая ошибка:", err);
    process.exit(1);
  }
}

// 2. СОЗДАЕМ СЕРВИСЫ И КЛАДЕМ ИХ В ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ СЕРВЕРА
// Теперь у нас есть готовые объекты: fb.auth, fb.db, fb.FieldValue
const fb = getFirebaseServices(firebaseApp);
app.locals.fb = fb;

console.log(
  "🛠 Firebase сервисы готовы к использованию (auth, db, FieldValue)",
);

app.use(express.json());

app.use(cors());

const authRoutes = require("./src/routes/authRoutes");
app.use("/api", authRoutes);

const coursesRoutes = require("./src/routes/courseRoutes");
app.use("/api/courses", coursesRoutes);

const woroutRoutes = require("./src/routes/workoutRoutes");
app.use("/api/workout-video", woroutRoutes);

app.listen(3001, () => {
  console.log("🚀 Сервер запущен на порту 3001");
});
