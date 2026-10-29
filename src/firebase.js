const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

module.exports = (appInstance) => {
  if (!appInstance) {
    throw new Error(
      "❌ Firebase app instance is required. Pass it from server.js",
    );
  }

  return {
    auth: getAuth(appInstance),
    db: getFirestore(appInstance),
    FieldValue: FieldValue,
  };
};
