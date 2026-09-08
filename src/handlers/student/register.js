import { prisma } from "../../database/prisma.js";
import { getStudentMainMenu } from "../../keyboards/student.menu.js";

/**
 * Handle student selecting their name -> start PIN verification conversation
 * @param {import("grammy").Context} ctx
 */
export async function linkStudentCallback(ctx) {
  const data = ctx.callbackQuery.data;
  const studentId = parseInt(data.split(":")[1], 10);

  // Check if student exists and not already linked
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return ctx.answerCallbackQuery({ text: "O'quvchi topilmadi!", show_alert: true });
  }

  if (student.telegramId) {
    return ctx.answerCallbackQuery({
      text: "Bu o'quvchi allaqachon boshqa Telegram hisobiga ulangan!",
      show_alert: true,
    });
  }

  await ctx.answerCallbackQuery();
  ctx.session.selectedStudentId = studentId;
  return ctx.conversation.enter("verifyStudentPinConversation");
}

/**
 * Conversation: Verify Student PIN-code
 */
export async function verifyStudentPinConversation(conversation, ctx) {
  let studentId = null;

  if (ctx.callbackQuery?.data?.startsWith("link_student:")) {
    studentId = parseInt(ctx.callbackQuery.data.split(":")[1], 10);
  } else if (ctx.session?.selectedStudentId) {
    studentId = ctx.session.selectedStudentId;
  }

  if (!studentId || isNaN(studentId)) {
    return ctx.reply("❌ Xatolik yuz berdi. Iltimos /start buyrug'ini qaytadan bosing.");
  }

  const student = await conversation.external(async () => {
    return await prisma.student.findUnique({
      where: { id: studentId },
    });
  });

  if (!student || student.telegramId) {
    return ctx.reply("❌ Bu o'quvchi mavjud emas yoki allaqachon biriktirilgan.");
  }

  await ctx.reply(
    `🔐 <b>Xavfsizlik tekshiruvi:</b>\n\n` +
    `Hurmatli <b>${student.fullName}</b>!\n` +
    `O'z profilingizni tasdiqlash uchun o'qituvchingiz bergan <b>4 xonali PIN-kod</b>ni kiriting:\n\n` +
    `<i>Bekor qilish uchun /cancel deb yozing.</i>`,
    { parse_mode: "HTML" }
  );

  let attempts = 3;
  while (attempts > 0) {
    const msg = await conversation.wait();
    if (msg.message?.text === "/cancel") {
      return ctx.reply("❌ Ro'yxatdan o'tish bekor qilindi. Qayta boshlash uchun /start bosing.");
    }

    const inputPin = msg.message?.text?.trim();
    const correctPin = student.pinCode || "1234";

    if (inputPin === correctPin) {
      const userId = String(ctx.from.id);
      const username = ctx.from.username || null;

      // Link student
      await conversation.external(async () => {
        await prisma.student.update({
          where: { id: studentId },
          data: {
            telegramId: userId,
            username: username,
          },
        });
      });

      await ctx.reply(
        `🎉 <b>Tabriklaymiz, ${student.fullName}!</b>\n\n` +
        `PIN-kod to'g'ri kiritildi va Telegram hisobingiz sinf ro'yxatiga muvaffaqiyatli biriktirildi.\n\n` +
        `Endi dars jadvalini ko'rishingiz, AI testlarini yechishingiz va ball to'plashingiz mumkin! 🚀`,
        {
          parse_mode: "HTML",
          reply_markup: getStudentMainMenu(),
        }
      );
      return;
    }

    attempts--;
    if (attempts > 0) {
      await ctx.reply(
        `❌ <b>Noto'g'ri PIN-kod!</b>\n` +
        `Qolgan urinishlar: <b>${attempts} ta</b>.\n\n` +
        `Iltimos, o'qituvchingizdan PIN-kodni so'rab, qaytadan kiriting (yoki /cancel deb yozing):`,
        { parse_mode: "HTML" }
      );
    } else {
      return ctx.reply(
        "❌ <b>Urinishlar soni tugadi!</b>\nO'qituvchingiz bilan bog'lanib PIN-kodingizni aniqlashtiring va qaytadan /start bosing.",
        { parse_mode: "HTML" }
      );
    }
  }
}