import { prisma } from "../../database/prisma.js";
import { getStudentMainMenu } from "../../keyboards/student.menu.js";

/**
 * Handle student self-linking via inline keyboard
 * @param {import("grammy").Context} ctx
 */
export async function linkStudentCallback(ctx) {
  const data = ctx.callbackQuery.data;
  const studentId = parseInt(data.split(":")[1], 10);
  const userId = String(ctx.from.id);
  const username = ctx.from.username || null;

  // Check if student exists and not already linked
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    await ctx.answerCallbackQuery({ text: "O'quvchi topilmadi!", show_alert: true });
    return;
  }

  if (student.telegramId) {
    await ctx.answerCallbackQuery({
      text: "Bu o'quvchi allaqachon boshqa Telegram akkauntga biriktirilgan!",
      show_alert: true,
    });
    return;
  }

  // Link telegram ID
  await prisma.student.update({
    where: { id: studentId },
    data: {
      telegramId: userId,
      username: username,
    },
  });

  await ctx.answerCallbackQuery({ text: "Muvaffaqiyatli biriktirildi! 🎉" });
  await ctx.editMessageText(
    `✅ <b>Tabriklaymiz, ${student.fullName}!</b>\n\n` +
    `Sizning Telegram hisobingiz sinf ro'yxatiga muvaffaqiyatli biriktirildi.\n` +
    `Endi testlarni ishlashingiz, ballaringizni va dars jadvalini ko'rishingiz mumkin.`,
    { parse_mode: "HTML" }
  );

  return ctx.reply("Asosiy menyu:", {
    reply_markup: getStudentMainMenu(),
  });
}