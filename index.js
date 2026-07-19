require("dotenv").config(); // <--- ВАЖНО: загружаем .env в самом начале!

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
const cookieParser = require("cookie-parser");

const app = express();
// Берем порт из .env, если нет — ставим 3001 по умолчанию
const PORT = process.env.PORT || 3001;

// --- СЕКРЕТЫ ТЕПЕРЬ БЕРЕМ ИЗ .ENV ---
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// Проверка: если секреты не заданы, сервер не запустится (защита от ошибок)
if (!JWT_SECRET || !REFRESH_SECRET) {
  console.error(
    "❌ ОШИБКА: Не найдены JWT_SECRET или REFRESH_SECRET в файле .env!",
  );
  process.exit(1);
}

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// --- РЕГИСТРАЦИЯ ---
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (
    !username ||
    !password ||
    username.trim() === "" ||
    password.trim() === ""
  ) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const existingUser = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username.trim());
    if (existingUser)
      return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare(
      "INSERT INTO users (username, password) VALUES (?, ?)",
    );
    const result = stmt.run(username.trim(), hashedPassword);

    res.status(201).json({
      message: "User registered successfully",
      userId: result.lastInsertRowid,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- ВХОД (Login) ---
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username.trim());
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // 1. Генерируем короткий Access Token (15 мин)
    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "15m" },
    );

    // 2. Генерируем длинный Refresh Token (7 дней)
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // 3. Отправляем Refresh Token как HttpOnly Cookie (JS не сможет его прочитать!)
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true, // JS не видит этот токен
      secure: false, // Для localhost можно false. На HTTPS обязательно true!
      sameSite: "strict", // Защита от CSRF
      maxAge: 604800000, // 7 дней в мс
    });

    // 4. Отдаём фронтенду ТОЛЬКО Access Token
    res.json({
      message: "Login successful",
      accessToken,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- ЗАЩИЩЕННЫЙ ПРОФИЛЬ ---
app.get("/profile", authenticateToken, (req, res) => {
  res.json({ message: "Это защищенный профиль", user: req.user });
});

// --- ОБНОВЛЕНИЕ ТОКЕНА (Refresh) ---
// Фронтенд вызывает этот эндпоинт, если получил 401 на обычном запросе
app.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refresh_token; // Берем из Cookie, а не из тела запроса!

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  jwt.verify(refreshToken, REFRESH_SECRET, (err, payload) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Refresh token expired or invalid" });
    }

    // Если Refresh валиден, выдаем НОВЫЙ Access Token
    const newAccessToken = jwt.sign(
      { id: payload.id }, // Можно добавить username, если нужно
      JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken: newAccessToken });
  });
});

// Middleware проверки Access Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log("💡 CORS enabled with credentials");
  console.log("🍪 Refresh tokens stored in HttpOnly cookies");
});
