const path = require("path");
const admin = require("firebase-admin");
// 1. Импортируем cert из app
const { cert } = require("firebase-admin/app");
// 2. Импортируем getFirestore для работы с базой
const { getFirestore } = require("firebase-admin/firestore");
// 3. ВАЖНО: Импортируем FieldValue отдельно (в v12+ он больше не лежит в admin.firestore)
const { FieldValue } = require("firebase-admin/firestore");

const scriptDir = __dirname;
const rootDir = path.join(scriptDir, "../../");
const keyPath = path.join(rootDir, "serviceAccountKey.json");

console.log(`🔍 Проверяю путь к ключу: ${keyPath}`);

let serviceAccount;

try {
  serviceAccount = require(keyPath);

  if (!serviceAccount || !serviceAccount.project_id) {
    throw new Error("Файл ключа найден, но в нем нет project_id");
  }
  console.log("✅ Файл ключа найден и валиден!");
} catch (e) {
  console.error("❌ ФАТАЛЬНАЯ ОШИБКА:", e.message);
  console.error(
    "\n💡 Подсказка: Убедись, что serviceAccountKey.json лежит в корне проекта (рядом с package.json)",
  );
  process.exit(1);
}

const app = admin.initializeApp({
  credential: cert(serviceAccount),
});

console.log("✅ Firebase Admin SDK успешно инициализирован!");

// Получаем экземпляр Firestore
const db = getFirestore(app);

// 3. ДАННЫЕ КУРСОВ
const coursesData = {
  ab1c3f: {
    description:
      "это философия здорового образа жизни. Тот, кто занимается йогой, становится здоровее и выносливее...",
    directions: [
      "Йога для новичков",
      "Классическая йога",
      "Кундалини-йога",
      "Йогатерапия",
      "Хатха-йога",
      "Аштанга-йога",
    ],
    fitting: [
      "Давно хотели попробовать йогу, но не решались начать",
      "Хотите укрепить позвоночник, избавиться от болей в спине и суставах",
      "Ищете активность, полезную для тела и души",
    ],
    nameEN: "Yoga",
    nameRU: "Йога",
    listImage: "https://storage.yandexcloud.net/storege.126/yoga.jpg",
    detailImage:
      "https://storage.yandexcloud.net/storege.126/big-images/yoga.jpg",
    color: "rgba(255, 199, 0, 1)",
    styles: {
      height: "683px",
      top: "-231px",
      right: "-231px",
      cropLeftPercent: "0",
    },
    stylesForMobileVersion: {
      height: "557px",
      top: "-57px",
      right: "0px",
      cropLeftPercent: "0",
    },

    countDaysLesson: "25 дней",
    timeLesson: "20-50",
    levelLesson: 3,
    order: 1,
    workouts: ["3yvozj", "hfgxlo", "kcx5ai", "kt6ah4", "mrhuag"],
  },
  kfpq8e: {
    description:
      "это система упражнений, целью которых является разогрев и растяжка мышц и связок...",
    directions: [
      "Статический стретчинг",
      "Динамическая растяжка",
      "Стретчинг для спины и шеи",
      "Глубокий стретч для продвинутых",
      "Реабилитационный стретчинг",
      "Утренняя растяжка для бодрости",
    ],
    fitting: [
      "Чувствуете скованность в теле после рабочего дня или сидячей работы",
      "Хотите улучшить гибкость, чтобы движения стали свободнее и легче",
      "Ищете мягкую практику для снятия мышечного напряжения и стресса",
    ],
    nameEN: "Stretching",
    nameRU: "Стретчинг",
    listImage: "https://storage.yandexcloud.net/storege.126/stretching.jpg",
    detailImage:
      "https://storage.yandexcloud.net/storege.126/big-images/stretching.jpg  ",
    color: "rgba(36, 145, 210, 1)",

    styles: {
      height: "540px",
      top: "0px",
      right: "0px",
      cropLeftPercent: "0",
    },

    stylesForMobileVersion: {
      height: "650px",
      top: "20px",
      right: "0px",
      cropLeftPercent: "0",
    },
    countDaysLesson: "25 дней",
    timeLesson: "20-50",
    levelLesson: 3,
    order: 2,
    workouts: ["9mefwq", "9yolz2", "pi5vtr"],
  },
  ypox9r: {
    description:
      "Фитнес и танцы – что между ними общего? А то, что они могут великолепно сочетаться...",
    directions: [
      "Zumba Fitness (классика)",
      "Zumba Toning (с гантелями)",
      "Zumba Gold (для старшего возраста)",
      "Детская Zumba",
      "Zumba Sentao (со стулом)",
    ],
    fitting: [
      "Любите танцевать, но не хотите ходить на скучные групповые занятия",
      "Ищете тренировку, которая ощущается как вечеринка, а не работа",
      "Хотите сжигать калории под зажигательную латиноамериканскую музыку",
    ],
    nameEN: "DanceFitness",
    nameRU: "Танцевальный фитнес",
    listImage: "https://storage.yandexcloud.net/storege.126/zumba.jpg",
    detailImage:
      "https://storage.yandexcloud.net/storege.126/big-images/zumba.jpg",
    color: "rgba(247, 160, 18, 1)",
    styles: {
      height: "767px",
      top: "-32px",
      right: "-320px",
      cropLeftPercent: "0",
    },
    stylesForMobileVersion: {
      height: "800px",
      top: "33px",
      right: "0px",
      cropLeftPercent: "0",
    },
    countDaysLesson: "25 дней",
    timeLesson: "20-50",
    levelLesson: 3,
    order: 3,
    workouts: ["gh7bd5", "hwsut5", "n18r8v", "dq9rzo", "rr70ie"],
  },
  "6i67sm": {
    description:
      "направление фитнеса, основанное на наборе аэробных упражнений, выполняемых с помощью специальной ступеньки (степ-платформы). Данное направление было разработано в 1989 году Джиной Миллер...",
    directions: [
      "Для начинающих",
      "Для похудения",
      "Для детей",
      "Интервальная степ-тренировка",
      "Кардио-степ для жиросжигания",
      "Функциональный степ",
    ],
    fitting: [
      "Хочется зарядиться энергией и получить мощный выброс эндорфинов",
      "Нужно эффективное кардио, которое не надоедает благодаря музыке и ритму",
      "Хотите укрепить ноги, ягодицы и сердечно-сосудистую систему",
    ],
    nameEN: "StepAirobic",
    nameRU: "Степ-аэробика",
    listImage: "https://storage.yandexcloud.net/storege.126/step-aerobics.jpg",
    detailImage:
      "https://storage.yandexcloud.net/storege.126/big-images/step-aerobics.jpg",
    color: "rgba(255, 126, 101, 1)",
    styles: {
      height: "1081px",
      top: "-715px",
      right: "30px",
      cropLeftPercent: "30",
    },
    stylesForMobileVersion: {
      height: "1081px",
      top: "-680px",
      right: "0px",
      cropLeftPercent: "0",
    },
    countDaysLesson: "25 дней",
    timeLesson: "20-50",
    levelLesson: 3,
    order: 4,
    workouts: ["e9ghsb", "a1rqtt", "mstcbg", "t3cpno"],
  },
  q02a6i: {
    description:
      "BodyFlex – система, в которой особым образом сочетаются физические упражнения и дыхательная гимнастика...",
    directions: [
      "Бодифлекс для начинающих",
      "Интенсивный бодифлекс",
      "Бодифлекс для живота и талии",
      "Дыхательная гимнастика в стиле бодифлекс",
      "Бодифлекс + растяжка",
    ],
    fitting: [
      "Мечтаете о плоском животе без изнуряющих кардио-нагрузок",
      "Ищете способ ускорить метаболизм и сжигать жир даже в покое",
      "Хотите научиться правильно дышать и насыщать клетки кислородом",
    ],
    nameEN: "BodyFlex",
    nameRU: "Бодифлекс",
    listImage: "https://storage.yandexcloud.net/storege.126/bodyflex.jpg",
    detailImage:
      "https://storage.yandexcloud.net/storege.126/big-images/bodyflex.jpg",
    color: "rgba(125, 69, 140, 1)",
    styles: {
      height: "520px",
      top: "-168px",
      right: "-111px",
      cropLeftPercent: "0",
    },
    stylesForMobileVersion: {
      height: "650px",
      top: "-210px",
      right: "0px",
      cropLeftPercent: "0",
    },
    countDaysLesson: "25 дней",
    timeLesson: "20-50",
    levelLesson: 3,
    order: 5,
    workouts: ["xlpkqy", "17oz5f", "pyvaec"],
  },
};

async function seedCourses() {
  const batch = db.batch();
  const collectionRef = db.collection("courses");

  console.log(
    `🚀 Начинаю загрузку ${Object.keys(coursesData).length} курсов...`,
  );

  Object.entries(coursesData).forEach(([docId, data]) => {
    const docRef = collectionRef.doc(docId);
    batch.set(docRef, {
      ...data,
      isActive: true,
      // ИСПРАВЛЕНИЕ: Используем локально импортированный FieldValue
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  try {
    await batch.commit();
    console.log("✅ Все курсы успешно загружены в Firestore!");
    console.log("👉 Проверь консоль Firebase Console -> Firestore Database!");
  } catch (error) {
    console.error("❌ Ошибка при записи в базу:", error.message);
    process.exit(1);
  } finally {
    await app.delete();
  }
}

seedCourses().catch(console.error);
