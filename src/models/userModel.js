const { getFirestore, FieldValue } = require("firebase-admin/firestore");
// Берем инстанс, который мы уже инициализировали в src/firebase.js
const firebaseApp = require("../firebase");

// Получаем db из инстанса
const db = getFirestore(firebaseApp);

exports.createProfile = async (uid, username) => {
  try {
    await db.collection("users").doc(uid).set({
      uid: uid,
      username: username,
      userCourse: [],
      userProgress: [],
      createdAt: FieldValue.serverTimestamp(),
      role: "user",
    });
    return { uid, username };
  } catch (error) {
    console.error("❌ Ошибка записи в Firestore:", error);
    throw error;
  }
};

exports.getProfile = async (uid) => {
  const doc = await db.collection("users").doc(uid).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  };
};
