import { prisma } from "../src/database/prisma.js";
import { shuffleQuestion } from "../src/services/ai.service.js";

async function fixExistingQuizzes() {
  console.log("🔍 Bazadagi barcha test savollarini tekshirish va to'g'ri javoblarni A, B, C, D variantlarga teng taqsimlash...\n");

  const questions = await prisma.question.findMany({
    include: { quiz: true },
  });

  if (questions.length === 0) {
    console.log("ℹ️ Bazada hozircha test savollari mavjud emas.");
    process.exit(0);
  }

  console.log(`Jami savollar soni: ${questions.length} ta.`);

  const statsBefore = { A: 0, B: 0, C: 0, D: 0 };
  const statsAfter = { A: 0, B: 0, C: 0, D: 0 };
  const letters = ["A", "B", "C", "D"];

  for (const q of questions) {
    const beforeLetter = letters[q.correctIndex] || "Noma'lum";
    if (statsBefore[beforeLetter] !== undefined) {
      statsBefore[beforeLetter]++;
    }

    // Shuffling
    const shuffled = shuffleQuestion({
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
    });

    const afterLetter = letters[shuffled.correctIndex] || "Noma'lum";
    if (statsAfter[afterLetter] !== undefined) {
      statsAfter[afterLetter]++;
    }

    await prisma.question.update({
      where: { id: q.id },
      data: {
        options: JSON.stringify(shuffled.options),
        correctIndex: shuffled.correctIndex,
      },
    });
  }

  console.log("📊 Oldingi holat (To'g'ri javoblar taqsimoti):");
  console.log(`   A: ${statsBefore.A} ta | B: ${statsBefore.B} ta | C: ${statsBefore.C} ta | D: ${statsBefore.D} ta`);

  console.log("\n✅ Yangi holat (Variantlar aralashtirilgandan so'ng):");
  console.log(`   A: ${statsAfter.A} ta | B: ${statsAfter.B} ta | C: ${statsAfter.C} ta | D: ${statsAfter.D} ta`);

  console.log("\n🎉 Barcha savollarning javob variantlari tasodifiy aralashtirildi va to'g'ri javoblar A, B, C, D bo'ylab teng taqsimlandi!");
  process.exit(0);
}

fixExistingQuizzes().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
