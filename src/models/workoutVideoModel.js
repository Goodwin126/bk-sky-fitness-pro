const { getFirestore } = require("firebase-admin/firestore");
const firebaseApp = require("../firebase"); // Берем готовый инстанс

const db = getFirestore(firebaseApp); // Получаем db из инстанса

// exports.getAllCourses = async () => {
//   const snapshot = await db
//     .collection("courses")
//     .where("isActive", "==", true)
//     .orderBy("order", "asc")
//     .get();

//   return snapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   }));
// };
exports.getWorkoutVideoById = async (courseId) => {
  const doc = await db.collection("workouts").doc(courseId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

// exports.getCoursesWithUserProgress = async (userId) => {
//   const courses = await exports.getAllCourses();

//   const { getProfileWithStats } = require("./userModel");
//   const userProfile = await getProfileWithStats(userId);

//   if (!userProfile)
//     return courses.map((c) => ({ ...c, progress: { percent: 0 } }));

//   const userProgressMap = userProfile.stats?.coursesProgress || {};

//   // 3. Навешиваем прогресс на каждый курс
//   return courses.map((course) => {
//     const progressData = userProgressMap[course.id] || {
//       total: 0,
//       completed: 0,
//       percent: 0,
//     };
//     return {
//       ...course,
//       progress: {
//         total: progressData.total,
//         completed: progressData.completed,
//         percent: progressData.percent,
//       },
//     };
//   });
// };
