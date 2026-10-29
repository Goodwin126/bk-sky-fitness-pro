const express = require("express");
const router = express.Router();
const workoutVideoController = require("../controllers/workoutVideoController");

const authenticate = require("../middlewares/authenticate");

// Сначала конкретный курс (чтобы Express не подумал, что "list" — это ID)
router.get("/:id", workoutVideoController.getWorkoutVideo);

router.get(
  "/listWorkoutVideoBy/:courseId",
  workoutVideoController.getListWorkoutVideoByCourseId,
);

module.exports = router;
