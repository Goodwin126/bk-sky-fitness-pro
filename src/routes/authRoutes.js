const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

if (!authController.register) {
  console.error(
    "❌ КРИТИЧЕСКАЯ ОШИБКА: Функция register не найдена! Проверь имя файла и путь.",
  );
  process.exit(1);
}

const authenticate = require("../middlewares/authenticate");

// Публичные роуты
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-token", authController.verifyToken);

// Защищенные роуты - требуют авторизацию

router.get("/me", authenticate, authController.getCurrentUser);

module.exports = router;
