import { prisma } from "../src/database/prisma.js";

async function showSchedule() {
  const list = await prisma.schedule.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { lessonOrder: "asc" }],
  });
  console.log(JSON.stringify(list, null, 2));
  process.exit(0);
}

showSchedule();