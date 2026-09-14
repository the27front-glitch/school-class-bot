import { prisma } from "../src/database/prisma.js";

async function clearQuizzes() {
  console.log("🧹 Testlar tarixi va savollarini tozalash...");

  const count = await prisma.quiz.count();
  if (count === 0) {
    console.log("ℹ️ Bazada hozircha testlar mavjud emas.");
    process.exit(0);
  }

  // Deleting quizzes will cascade delete questions and submissions
  const deleted = await prisma.quiz.deleteMany();

  console.log(`✅ Jami ${deleted.count} ta test va ularning barcha savollari muvaffaqiyatli tozalandi!`);
  console.log("• Botdagi 'Oxirgi testlar ro'yxati' toza bo'ldi.");
  process.exit(0);
}

clearQuizzes().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
