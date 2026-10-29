const courseModel = require("../models/courseModel");
const authenticateToken = require("../middlewares/authenticate");

exports.getCourseById = async (req, res) => {
  try {
    const { db } = req.app.locals.fb;
    const { id } = req.params;

    // Получаем один документ по ID
    const doc = await db.collection("courses").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Курс не найден",
      });
    }

    const data = doc.data();

    const responseData = {
      id: doc.id, // ID берем из обертки документа
      nameRU: data.nameRU,
      description: data.description,
      directions: data.directions,
      fitting: data.fitting,
      color: data.color,
      styles: data.styles,
      stylesForMobileVersion: data.stylesForMobileVersion,
      workouts: data.workouts,
      detailImage: data.detailImage,
    };

    return res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Ошибка:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getUserCourses = async (req, res) => {
  try {
    // req.user уже заполнен middleware authenticateToken
    const userId = req.user.id;

    const coursesWithProgress =
      await courseModel.getCoursesWithUserProgress(userId);

    res.json({
      success: true,
      data: coursesWithProgress,
    });
  } catch (error) {
    console.error("Error fetching user courses:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch user courses", details: error.message });
  }
};

exports.getCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const { db } = req.app.locals.fb;
    const course = await courseModel.getCourseById(id);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.getCoursesList = async (req, res) => {
  try {
    const { db } = req.app.locals.fb;
    const snapshot = await db.collection("courses").get();

    if (snapshot.empty) {
      return res.json({ success: true, data: [] });
    }

    const courses = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      //  ФОРМИРУЕМ ЧИСТОЙ ОТВЕТ (только нужные поля)
      courses.push({
        id: doc.id, // Обязательно: ID для ссылки/клика
        nameRU: data.nameRU, // Название на русском
        listImage: data.listImage, // Ссылка на картинку для списка
        countDaysLesson: data.countDaysLesson, // Количество дней/уроков
        timeLesson: data.timeLesson, // Длительность одного урока
        levelLesson: data.levelLesson, // Уровень сложности
        workouts: data.workouts, // Уровень сложности
      });
    });

    //  СОРТИРОВКА по полю order (чтобы порядок был как ты задумал)
    courses.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Ошибка получения списка курсов:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: error.message,
    });
  }
};

// exports.updateProgress = async (req, res) => {
//   // ✅ БЕРЕМ И db, И FieldValue ИЗ ГЛОБАЛЬНОГО ОБЪЕКТА FB
//   const { db, FieldValue } = req.app.locals.fb;
//   const userId = req.user.id;

//   const { courseId, workoutId, exercises } = req.body;

//   // --- ВАЛИДАЦИЯ ---
//   if (!courseId || !workoutId || !exercises) {
//     return res
//       .status(400)
//       .json({ error: "Missing courseId, workoutId or exercises" });
//   }

//   if (!Array.isArray(exercises)) {
//     return res.status(400).json({ error: "exercises must be an array" });
//   }

//   for (const ex of exercises) {
//     if (typeof ex.index !== "number" || typeof ex.quantity !== "number") {
//       return res.status(400).json({
//         error:
//           "Each exercise item must have 'index' (number) and 'quantity' (number)",
//       });
//     }
//   }

//   try {
//     // --- ШАГ 1: Получаем ПЛАН тренировки ---
//     const workoutDoc = await db.collection("workouts").doc(workoutId).get();

//     if (!workoutDoc.exists) {
//       return res.status(404).json({ error: "Workout not found" });
//     }

//     const planExercises = workoutDoc.data().exercises;

//     if (!Array.isArray(planExercises)) {
//       return res.status(500).json({ error: "Invalid workout data structure" });
//     }

//     // --- ШАГ 2: Считаем ПРОГРЕСС ---
//     let totalTargetReps = 0;
//     let totalUserReps = 0;

//     planExercises.forEach((planEx) => {
//       totalTargetReps += planEx.quantity || 0; // Защита от undefined
//     });

//     exercises.forEach((userEx) => {
//       const { index, quantity } = userEx;
//       if (index >= 0 && index < planExercises.length) {
//         totalUserReps += quantity;
//       } else {
//         console.warn(`Invalid index ${index} sent from frontend`);
//       }
//     });

//     const countingPercent = () => {
//       if (totalTargetReps === 0) return 0;
//       const percent = Math.round((totalUserReps / totalTargetReps) * 100);
//       return percent >= 100 ? 100 : percent;
//     };

//     const progressPercent = countingPercent();
//     const status = progressPercent >= 100 ? "done" : "in_progress";

//     // Формируем массив для истории (заполняем нулями, если упражнение не прислали)
//     const userProgressArray = new Array(planExercises.length).fill(0);
//     exercises.forEach((ex) => {
//       userProgressArray[ex.index] = ex.quantity;
//     });

//     // --- ШАГ 3: Обновляем данные в профиле пользователя ---
//     await db
//       .collection("users")
//       .doc(userId)
//       .update({
//         [`userCourse.${courseId}.${workoutId}`]: userProgressArray,

//         [`courseProgress.${courseId}.${workoutId}`]: {
//           percent: progressPercent,
//           status: status,
//           lastUpdated: FieldValue.serverTimestamp(),
//           totalRepsDone: totalUserReps,
//           totalRepsTarget: totalTargetReps,
//         },
//       });

//     res.json({
//       success: true,
//       message: "Progress updated and percentage calculated",
//       progressPercent,
//       status,
//       details: {
//         totalTargetReps,
//         totalUserReps,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating progress:", error);
//     res.status(500).json({
//       error: "Server error",
//       details: error.message,
//     });
//   }
// };

exports.updateProgress = async (req, res) => {
  const { db, FieldValue } = req.app.locals.fb;
  const userId = req.user.id;

  const { courseId, workoutId, exercises } = req.body;

  // --- ВАЛИДАЦИЯ (оставляем как было) ---
  if (!courseId || !workoutId || !exercises) {
    return res
      .status(400)
      .json({ error: "Missing courseId, workoutId or exercises" });
  }

  if (!Array.isArray(exercises)) {
    return res.status(400).json({ error: "exercises must be an array" });
  }

  for (const ex of exercises) {
    if (typeof ex.index !== "number" || typeof ex.quantity !== "number") {
      return res.status(400).json({
        error:
          "Each exercise item must have 'index' (number) and 'quantity' (number)",
      });
    }
  }

  try {
    // --- ШАГ 1: Получаем ПЛАН тренировки (структуру) ---
    const workoutDoc = await db.collection("workouts").doc(workoutId).get();

    if (!workoutDoc.exists) {
      return res.status(404).json({ error: "Workout not found" });
    }

    const planExercises = workoutDoc.data().exercises;

    if (!Array.isArray(planExercises)) {
      return res.status(500).json({ error: "Invalid workout data structure" });
    }

    // --- ШАГ 2: Получаем ТЕКУЩИЙ прогресс пользователя из БД (чтобы сохранить старые данные) ---
    // Нам нужно знать, сколько пользователь сделал в других упражнениях, которые он сейчас не трогал
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Получаем массив прогресса для этой тренировки (или пустой массив, если курса нет)
    const currentUserProgressArray =
      userData.userCourse?.[courseId]?.[workoutId] || [];

    // Если в базе пусто, инициализируем нулями, чтобы не было ошибок при доступе по индексу
    const finalProgressArray = [...currentUserProgressArray];

    // Заполняем недостающие ячейки нулями, если массив короче плана
    while (finalProgressArray.length < planExercises.length) {
      finalProgressArray.push(0);
    }

    // Обновляем только те упражнения, которые прислал пользователь
    exercises.forEach((userEx) => {
      const { index, quantity } = userEx;
      if (index >= 0 && index < planExercises.length) {
        finalProgressArray[index] = quantity;
      }
    });

    // --- ШАГ 3: Считаем ПРОГРЕСС (как было) ---
    let totalTargetReps = 0;
    let totalUserReps = 0;

    planExercises.forEach((planEx) => {
      totalTargetReps += planEx.quantity || 0;
    });

    finalProgressArray.forEach((qty) => {
      totalUserReps += qty;
    });

    const countingPercent = () => {
      if (totalTargetReps === 0) return 0;
      const percent = Math.round((totalUserReps / totalTargetReps) * 100);
      return percent >= 100 ? 100 : percent;
    };

    const progressPercent = countingPercent();
    const status = progressPercent >= 100 ? "done" : "in_progress";

    // --- ШАГ 4: Обновляем данные в профиле пользователя (в БД) ---
    await db
      .collection("users")
      .doc(userId)
      .update({
        [`userCourse.${courseId}.${workoutId}`]: finalProgressArray, // Сохраняем полный массив чисел

        [`courseProgress.${courseId}.${workoutId}`]: {
          percent: progressPercent,
          status: status,
          lastUpdated: FieldValue.serverTimestamp(),
          totalRepsDone: totalUserReps,
          totalRepsTarget: totalTargetReps,
        },
      });

    // --- ШАГ 5: Формируем ОТВЕТ ДЛЯ ФРОНТЕНДА (Самое важное!) ---

    // Создаем красивый объект упражнений с названиями и процентами для каждого
    const exercisesResponse = planExercises.map((planEx, index) => {
      const userQty = finalProgressArray[index] || 0;
      const targetQty = planEx.quantity || 0;

      let exPercent = 0;
      if (targetQty > 0) {
        exPercent = Math.round((userQty / targetQty) * 100);
      }

      return {
        name: planEx.name,
        quantity: userQty, // То, что реально сделал пользователь (из БД)
        target: targetQty, // Цель
        percent: exPercent, // Процент выполнения конкретного упражнения
        index: index,
      };
    });

    res.json({
      success: true,
      message: "Progress updated and percentage calculated",
      progressPercent, // Процент всего курса/тренировки
      status,
      details: {
        totalTargetReps,
        totalUserReps,
      },
      exercises: exercisesResponse, // <-- ВОТ ЭТО НУЖНО ФРОНТЕНДУ!
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

exports.addCourse = async (req, res) => {
  const { db } = req.app.locals.fb;
  const userId = req.user.id;
  const { courseId } = req.body;

  if (!courseId) return res.status(400).json({ error: "courseId required" });

  const profileRef = db.collection("users").doc(userId);

  try {
    const doc = await profileRef.get();
    const data = doc.exists ? doc.data() : {};

    if (data.userCourse && data.userCourse[courseId] !== undefined) {
      return res.json({
        message: "Course already added",
        progress: data.userCourse[courseId],
      });
    }

    await profileRef.set(
      {
        userCourse: {
          [courseId]: 0,
        },
      },
      { merge: true },
    );

    res.json({ message: "Course added with 0 progress" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.removeCourse = async (req, res) => {
  // БЕРЕМ db И FieldValue ПРЯМО ИЗ ГЛОБАЛЬНОГО ОБЪЕКТА FB
  const { db, FieldValue } = req.app.locals.fb;
  const userId = req.user.id;

  // Так как твой роут: router.delete("/remove-course", ...)
  // То courseId должен приходить в теле запроса (body)
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ error: "courseId is required in body" });
  }

  try {
    // Используем FieldValue.delete(), который мы достали выше
    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          userCourse: {
            [courseId]: FieldValue.delete(),
          },
        },
        { merge: true },
      );

    res.json({
      message: "Course removed successfully",
      courseId,
    });
  } catch (error) {
    console.error("Remove error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
