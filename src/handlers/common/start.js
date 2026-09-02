import { prisma } from "../../database/prisma.js";
import { isAdmin } from "../../config/config.js";
import { getAdminMainMenu } from "../../keyboards/admin.menu.js";
import { getStudentMainMenu } from "../../keyboards/student.menu.js";
import { InlineKeyboard } from "grammy";

/**
 * /start command handler
 * @param {import("grammy").Context} ctx
 */
export async function startHandler(ctx) {
  const userId = ctx.from.id;

  // 1. Agar admin bo'lsa
  if (isAdmin(userId)) {
    return ctx.reply(
      `👋 <b>Assalomu alaykum, Hurmatli Sinf Rahbari / Admin!</b>\n\n` +
      `Sinf boshqaruv botiga xush kelibsiz. Quyidagi menyu orqali kerakli bo'limni tanlang:`,
      {
        parse_mode: "HTML",
        reply_markup: getAdminMainMenu(),
      }
    );
  }

  // 2. Agar ro'yxatdan o'tgan o'quvchi bo'lsa
  const student = await prisma.student.findUnique({
    where: { telegramId: String(userId) },
  });

  if (student) {
    return ctx.reply(
      `👋 <b>Assalomu alaykum, ${student.fullName}!</b>\n\n` +
      `Siz sinf botidan muvaffaqiyatli ro'yxatdan o'tgansiz.\n` +
      `🏆 Sizning joriy ballaringiz: <b>${student.points + student.bonusPoints} ball</b>\n\n` +
      `Quyidagi menyu orqali testlarni ishlashingiz yoki dars jadvalini ko'rishingiz mumkin:`,
      {
        parse_mode: "HTML",
        reply_markup: getStudentMainMenu(),
      }
    );
  }

  // 3. Agar ro'yxatdan o'tmagan bo'lsa -> O'quvchilar ro'yxatidan o'zini tanlash
  const unlinkedStudents = await prisma.student.findMany({
    where: { telegramId: null },
    orderBy: { fullName: "asc" },
  });

  if (unlinkedStudents.length === 0) {
    return ctx.reply(
      `👋 <b>Assalomu alaykum!</b>\n\n` +
      `Sinf botiga xush kelibsiz. Hozircha sinf o'quvchilari ro'yxati kiritilmagan yoki barcha o'quvchilar biriktirilgan.\n\n` +
      `Iltimos, o'qituvchingiz / adminga murojaat qiling.`,
      { parse_mode: "HTML" }
    );
  }

  const keyboard = new InlineKeyboard();
  unlinkedStudents.forEach((st, idx) => {
    keyboard.text(`👤 ${st.fullName}`, `link_student:${st.id}`);
    if ((idx + 1) % 2 === 0) keyboard.row();
  });

  return ctx.reply(
    `👋 <b>Assalomu alaykum! Sinf botiga xush kelibsiz.</b>\n\n` +
    `Iltimos, o'zingizni ro'yxatdan tasdiqlash uchun quyidagi ro'yxatdan <b>o'z Ism-Familiyangizni</b> tanlang:`,
    {
      parse_mode: "HTML",
      reply_markup: keyboard,
    }
  );
}