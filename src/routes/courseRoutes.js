const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");

const authenticate = require("../middlewares/authenticate");

// Сначала конкретный курс (чтобы Express не подумал, что "list" — это ID)
router.get("/:id", courseController.getCourseById);

// Потом список всех курсов (наш новый эндпоинт)
router.get("/", courseController.getCoursesList);

// Защищенные роуты
router.get("/user", courseController.getUserCourses);
router.post("/add-course", authenticate, courseController.addCourse);
router.post("/update-progress", authenticate, courseController.updateProgress);
router.delete("/remove-course", authenticate, courseController.removeCourse);
module.exports = router;
