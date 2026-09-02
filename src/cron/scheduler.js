import cron from "node-cron";
import { prisma } from "../database/prisma.js";
import { config } from "../config/config.js";
import { createAndPublishAiQuiz } from "../services/ai.service.js";

/**
 * Initialize cron jobs for the bot
 * @param {import("grammy").Bot} bot
 */
export function initScheduler(bot) {
  // 1. DUSHANBA SOAT 12:00 — AI 6-sinf fani bo'yicha 15 talik yangi test yaratadi (Chorshanba 12:00 gacha)
  cron.schedule("0 12 * * 1", async () => {
    try {
      console.log("⏰ Cron: Dushanba 12:00 AI test generatsiyasi boshlandi...");
      await createAndPublishAiQuiz(null, 48, bot); // 48 soat -> Chorshanba 12:00 da tugaydi
    } catch (error) {
      console.error("Cron: Dushanba AI test yaratishda xatolik:", error);
    }
  });

  // 2. PAYSHANBA SOAT 12:00 — AI keyingi fan bo'yicha 15 talik yangi test yaratadi (Shanba 12:00 gacha)
  cron.schedule("0 12 * * 4", async () => {
    try {
      console.log("⏰ Cron: Payshanba 12:00 AI test generatsiyasi boshlandi...");
      await createAndPublishAiQuiz(null, 48, bot); // 48 soat -> Shanba 12:00 da tugaydi
    } catch (error) {
      console.error("Cron: Payshanba AI test yaratishda xatolik:", error);
    }
  });

  // 3. Har 1 minutda: Muddati o'tgan testlarni avtomatik yopish (Chorshanba va Shanba 12:00 larda ham ishlaydi)
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const expiredQuizzes = await prisma.quiz.findMany({
        where: {
          isActive: true,
          deadline: {
            lte: now,
          },
        },
      });

      for (const quiz of expiredQuizzes) {
        await prisma.quiz.update({
          where: { id: quiz.id },
          data: { isActive: false },
        });

        console.log(`🔒 Test muddati tugadi va yopildi: [${quiz.subject}] ${quiz.title}`);

        // Adminlarga xabar
        for (const adminId of config.adminIds) {
          try {
            await bot.api.sendMessage(
              adminId,
              `⏳ <b>Test muddati tugadi va yopildi:</b>\n📚 Fan: <b>${quiz.subject}</b>\n📌 Nomi: <b>${quiz.title}</b>`,
              { parse_mode: "HTML" }
            );
          } catch (e) {}
        }
      }
    } catch (error) {
      console.error("Cron: Testlarni tekshirishda xatolik:", error);
    }
  });

  // 4. Har kuni soat 20:00 da: Ertangi dars jadvali eslatmasi
  cron.schedule("0 20 * * *", async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      let dayOfWeek = tomorrow.getDay(); // 0 = Sun, 1 = Mon ...
      if (dayOfWeek === 0) return; // Yakshanba dars yo'q

      const dayNames = {
        1: "Dushanba",
        2: "Seshanba",
        3: "Chorshanba",
        4: "Payshanba",
        5: "Juma",
        6: "Shanba",
      };

      const schedules = await prisma.schedule.findMany({
        where: { dayOfWeek },
        orderBy: { lessonOrder: "asc" },
      });

      if (schedules.length === 0) return;

      let msg = `📅 <b>Ertangi (${dayNames[dayOfWeek]}) dars jadvali:</b>\n\n`;
      schedules.forEach((s) => {
        msg += `<b>${s.lessonOrder}-dars:</b> ${s.subject}`;
        if (s.room) msg += ` (Xona: ${s.room})`;
        if (s.teacher) msg += ` - <i>${s.teacher}</i>`;
        msg += "\n";
      });

      // Barcha ro'yxatdan o'tgan o'quvchilarga yuborish
      const students = await prisma.student.findMany({
        where: { telegramId: { not: null } },
      });

      for (const student of students) {
        if (student.telegramId) {
          try {
            await bot.api.sendMessage(student.telegramId, msg, {
              parse_mode: "HTML",
            });
          } catch (e) {}
        }
      }
    } catch (error) {
      console.error("Cron: Dars jadvali eslatmasida xatolik:", error);
    }
  });

  // 5. Har kuni soat 08:30 da: Adminga davomat eslatmasi (Dushanba-Shanba)
  cron.schedule("30 8 * * 1-6", async () => {
    try {
      for (const adminId of config.adminIds) {
        try {
          await bot.api.sendMessage(
            adminId,
            "🔔 <b>Eslatma:</b> Bugungi kun uchun sinf davomatini belgilashni unutmang!\n\n/davomat buyrug'ini bosing.",
            { parse_mode: "HTML" }
          );
        } catch (e) {}
      }
    } catch (error) {
      console.error("Cron: Davomat eslatmasida xatolik:", error);
    }
  });

  console.log("⏰ Avtomatik vazifalar (AI Testlar, Dars Jadvali, Davomat Cron) faollashtirildi.");
}