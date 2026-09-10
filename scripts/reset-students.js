import { prisma } from "../src/database/prisma.js";

async function resetStudents() {
  console.log("🔄 O'quvchilar ballarini 0 qilish va Telegram hisoblarini uzish...");

  // 1. O'quvchilar ballarini 0 qilish va telegramId ni uzish
  const updated = await prisma.student.updateMany({
    data: {
      points: 0,
      bonusPoints: 0,
      telegramId: null,
      username: null,
    },
  });

  // 2. Test natijalarini tozalash
  await prisma.quizSubmission.deleteMany();

  console.log(`🎉 Jami ${updated.count} ta o'quvchi muvaffaqiyatli tozalandi!`);
  console.log("• Barcha ballar 0 qilindi.");
  console.log("• Barcha Telegram akkauntlar uzildi (o'quvchilar qaytadan /start bosib PIN bilan ulanishadi).");
  console.log("• O'quvchilar ismlari va PIN-kodlari to'liq saqlab qolindi.");
  process.exit(0);
}

resetStudents().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});