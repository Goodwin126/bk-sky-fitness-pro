const workoutVideoModel = require("../models/workoutVideoModel");
const courseModel = require("../models/courseModel");

const authenticateToken = require("../middlewares/authenticate");

exports.getWorkoutVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const { db } = req.app.locals.fb;
    const course = await workoutVideoModel.getWorkoutVideoById(id);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.getListWorkoutVideoByCourseId = async (req, res) => {
  try {
    const { db } = req.app.locals.fb;
    const { courseId } = req.params;

    // 1. Получаем курс
    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Отсутствует ID курса" });
    }

    const doc = await db.collection("courses").doc(courseId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Курс не найден",
      });
    }

    const data = doc.data();

    if (
      !data.workouts ||
      !Array.isArray(data.workouts) ||
      data.workouts.length === 0
    ) {
      return res.json({
        success: true,
        data: {
          courseId: doc.id,
          workouts: {},
        },
      });
    }

    const workoutsMap = {};

    for (const workout of data.workouts) {
      // --- ЗАЩИТА ОТ ОШИБКИ ---
      // Пытаемся получить ID. Работает в двух случаях:
      // 1. Если workout - это объект: { id: "abc", ... } -> берем workout.id
      // 2. Если workout - это просто строка: "abc" -> берем сам workout

      const workoutId =
        typeof workout === "string"
          ? workout
          : workout?.id || workout?.workoutId;

      if (!workoutId) {
        console.warn(
          `Пропущен элемент в workouts: ${JSON.stringify(workout)} (нет ID)`,
        );
        continue; // Пропускаем этот элемент, не ломаем весь запрос
      }

      try {
        const videoData =
          await workoutVideoModel.getWorkoutVideoById(workoutId);

        if (videoData) {
          // Берем название. Проверяем разные возможные названия полей
          const name =
            videoData.name ||
            videoData.title ||
            videoData.description ||
            `Тренировка ${workoutId}`;
          workoutsMap[workoutId] = name;
        } else {
          console.warn(
            `Тренировка с ID ${workoutId} не найдена в коллекции workoutVideos`,
          );
          // workoutsMap[workoutId] = "Не найдено"; // Раскомментируй, если нужно видеть заглушки
        }
      } catch (subError) {
        console.error(
          `Ошибка при получении тренировки ${workoutId}:`,
          subError,
        );
        // Не прерываем весь процесс, просто пропускаем эту тренировку
      }
    }

    return res.json({
      success: true,
      data: {
        courseId: doc.id,
        workouts: workoutsMap,
      },
    });
  } catch (error) {
    console.error("❌ Критическая ошибка:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
