import { prisma } from "../src/database/prisma.js";

const fullWeekSchedule = [
  // Dushanba (1)
  { dayOfWeek: 1, lessonOrder: 1, subject: "Kelajak soati", teacher: "12:15 - 13:30" },
  { dayOfWeek: 1, lessonOrder: 2, subject: "Ingliz tili", teacher: "13:05 - 13:50" },
  { dayOfWeek: 1, lessonOrder: 3, subject: "Jismoniy tarbiya", teacher: "13:55 - 14:40" },
  { dayOfWeek: 1, lessonOrder: 4, subject: "Matematika", teacher: "14:50 - 15:35" },
  { dayOfWeek: 1, lessonOrder: 5, subject: "Adabiyot", teacher: "15:40 - 16:25" },

  // Seshanba (2)
  { dayOfWeek: 2, lessonOrder: 1, subject: "Matematika", teacher: "12:15 - 13:00" },
  { dayOfWeek: 2, lessonOrder: 2, subject: "Ingliz tili", teacher: "13:05 - 13:50" },
  { dayOfWeek: 2, lessonOrder: 3, subject: "Science", teacher: "13:55 - 14:40" },
  { dayOfWeek: 2, lessonOrder: 4, subject: "Texnologiya", teacher: "14:50 - 15:35" },
  { dayOfWeek: 2, lessonOrder: 5, subject: "Texnologiya", teacher: "15:40 - 16:25" },

  // Chorshanba (3)
  { dayOfWeek: 3, lessonOrder: 1, subject: "Musiqa", teacher: "12:15 - 13:00" },
  { dayOfWeek: 3, lessonOrder: 2, subject: "Tarix", teacher: "13:05 - 13:50" },
  { dayOfWeek: 3, lessonOrder: 3, subject: "Ingliz tili", teacher: "13:55 - 14:40" },
  { dayOfWeek: 3, lessonOrder: 4, subject: "Matematika", teacher: "14:50 - 15:35" },
  { dayOfWeek: 3, lessonOrder: 5, subject: "Tarbiya", teacher: "15:40 - 16:25" },
  { dayOfWeek: 3, lessonOrder: 6, subject: "Ona tili", teacher: "16:30 - 17:15" },

  // Payshanba (4)
  { dayOfWeek: 4, lessonOrder: 1, subject: "Tasviriy san'at", teacher: "12:15 - 13:00" },
  { dayOfWeek: 4, lessonOrder: 2, subject: "Ona tili", teacher: "13:05 - 13:50" },
  { dayOfWeek: 4, lessonOrder: 3, subject: "Rus tili", teacher: "13:55 - 14:40" },
  { dayOfWeek: 4, lessonOrder: 4, subject: "Science", teacher: "14:50 - 15:35" },
  { dayOfWeek: 4, lessonOrder: 5, subject: "Ona tili", teacher: "15:40 - 16:25" },

  // Juma (5)
  { dayOfWeek: 5, lessonOrder: 1, subject: "Ona tili", teacher: "12:15 - 13:00" },
  { dayOfWeek: 5, lessonOrder: 2, subject: "Tarix", teacher: "13:05 - 13:50" },
  { dayOfWeek: 5, lessonOrder: 3, subject: "Matematika", teacher: "13:55 - 14:40" },
  { dayOfWeek: 5, lessonOrder: 4, subject: "Jismoniy tarbiya", teacher: "14:50 - 15:35" },
  { dayOfWeek: 5, lessonOrder: 5, subject: "Informatika", teacher: "15:40 - 16:25" },

  // Shanba (6)
  { dayOfWeek: 6, lessonOrder: 1, subject: "Rus tili", teacher: "12:15 - 13:00" },
  { dayOfWeek: 6, lessonOrder: 2, subject: "Adabiyot", teacher: "13:05 - 13:50" },
  { dayOfWeek: 6, lessonOrder: 3, subject: "Ingliz tili", teacher: "13:55 - 14:40" },
  { dayOfWeek: 6, lessonOrder: 4, subject: "Science", teacher: "14:50 - 15:35" },
  { dayOfWeek: 6, lessonOrder: 5, subject: "Matematika", teacher: "15:40 - 16:25" },
];

async function addSchedule() {
  for (const item of fullWeekSchedule) {
    await prisma.schedule.upsert({
      where: {
        dayOfWeek_lessonOrder: {
          dayOfWeek: item.dayOfWeek,
          lessonOrder: item.lessonOrder,
        },
      },
      update: {
        subject: item.subject,
        teacher: item.teacher,
      },
      create: {
        dayOfWeek: item.dayOfWeek,
        lessonOrder: item.lessonOrder,
        subject: item.subject,
        teacher: item.teacher,
      },
    });
  }

  console.log("🎉 BARCHA 6 KUNLIK DARS JADVALLARI (Dushanba-Shanba, 31 ta dars) MUVAFFAQIYATLI SAQLANDI!");
  process.exit(0);
}

addSchedule().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});