const { db, admin } = require("../firebase");

const { createProfile, getProfile } = require("../models/userModel");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

exports.register = async (req, res) => {
  const { auth } = req.app.locals.fb;
  const { username, email, password } = req.body;

  // 1. Ранняя валидация — стоит ДО try, сразу после деструктуризации req.body
  if (
    !username ||
    !email ||
    !password ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    return res.status(400).json({
      error: "Username, email and valid password (min 6 chars) are required",
    });
  }

  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: username,
    });

    await createProfile(userRecord.uid, username);

    res.status(201).json({
      message: "User registered successfully",
      uid: userRecord.uid,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName,
      },
    });
  } catch (error) {
    console.error(error);

    // 2. Дополнительные проверки кодов — внутри существующего catch
    if (
      error.code === "auth/email-already-exists" ||
      error.code === "auth/email-already-in-use"
    ) {
      return res.status(409).json({ error: "User already exists" });
    }
    if (error.code === "auth/invalid-email") {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (
      error.code === "auth/invalid-password" ||
      error.code === "auth/weak-password"
    ) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      },
    );

    // ВАЖНО: fetch не выбрасывает ошибку при 400/401, нужно проверять вручную!
    if (!response.ok) {
      const errorData = await response.json();

      // Пробрасываем ошибку дальше в catch, чтобы обработать её единообразно
      throw {
        status: response.status,
        data: errorData,
      };
    }

    const data = await response.json(); // Парсим успешный ответ
    const { idToken, localId } = data;
    const uid = localId;

    // 2. Ищем профиль в своей базе данных
    const profile = await getProfile(uid);

    if (!profile) {
      return res
        .status(404)
        .json({ error: "Profile not found. Register first." });
    }

    // 3. Генерируем СВОЙ accessToken (7 дней)
    const accessToken = jwt.sign(
      { id: uid, username: profile.username },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 4. Отдаем токен клиенту
    res.json({
      message: "Login successful",
      accessToken: accessToken,
      user: {
        id: uid,
        username: profile.username,
        email: email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Обработка ошибок от Firebase API (через наш ручной throw выше)
    if (error.data && error.data.error) {
      const firebaseError = error.data.error.message;

      if (
        firebaseError === "EMAIL_NOT_FOUND" ||
        firebaseError === "INVALID_PASSWORD"
      ) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Единый код, который Firebase отдаёт на неверный email ИЛИ пароль
      if (firebaseError === "INVALID_LOGIN_CREDENTIALS") {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Ошибки валидации данных — это вина клиента, а не сервера
      if (
        firebaseError.startsWith("INVALID_EMAIL") ||
        firebaseError.startsWith("WEAK_PASSWORD")
      ) {
        return res.status(400).json({ error: firebaseError });
      }

      // Любой 4xx от Firebase — проблема запроса, а не сервера
      if (error.status >= 400 && error.status < 500) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
    }

    res.status(500).json({ error: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email: email,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw {
        status: response.status,
        data: errorData,
      };
    }

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error.data && error.data.error) {
      const firebaseError = error.data.error.message;

      if (firebaseError === "EMAIL_NOT_FOUND") {
        return res.status(404).json({ error: "User not found" });
      }
      if (firebaseError.startsWith("INVALID_EMAIL")) {
        return res.status(400).json({ error: "Invalid email format" });
      }
    }

    res.status(500).json({ error: "Server error" });
  }
};

exports.verifyToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Access token required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: "Invalid token" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const profile = await getProfile(req.user.id);
    if (!profile) return res.status(404).json({ error: "User not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
