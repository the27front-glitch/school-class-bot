import ExcelJS from "exceljs";
import { prisma } from "../database/prisma.js";
import { getStudentLeaderboard } from "./ranking.service.js";

/**
 * Generate monthly attendance & student progress report in Excel format
 * @param {string} yearMonth - Format 'YYYY-MM' (e.g. '2026-08')
 * @returns {Promise<Buffer>}
 */
export async function generateMonthlyReportExcel(yearMonth) {
  const now = new Date();
  const currentYM =
    yearMonth ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [yearStr, monthStr] = currentYM.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Number of days in this month
  const daysInMonth = new Date(year, month, 0).getDate();

  const students = await prisma.student.findMany({
    orderBy: { fullName: "asc" },
    include: {
      attendances: {
        where: {
          date: {
            startsWith: currentYM,
          },
        },
      },
      quizSubmissions: true,
    },
  });

  const leaderboardData = await getStudentLeaderboard(currentYM);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Maktab Sinf Bot";
  workbook.created = new Date();

  // -------------------------------------------------------------
  // Sheet 1: Davomat Jurnali (Attendance Sheet)
  // -------------------------------------------------------------
  const sheet1 = workbook.addWorksheet(`Davomat (${currentYM})`, {
    views: [{ state: "frozen", xSplit: 2, ySplit: 3 }],
  });

  // Header Title
  sheet1.mergeCells(1, 1, 1, daysInMonth + 6);
  const titleCell = sheet1.getCell(1, 1);
  titleCell.value = `${currentYM} OYI UCHUN SINF DAVOMAT JURNALI`;
  titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2E7D32" }, // Forest Green
  };
  sheet1.getRow(1).height = 30;

  // Table Headers
  const headerRow = ["№", "O'quvchi F.I.Sh."];
  for (let d = 1; d <= daysInMonth; d++) {
    headerRow.push(String(d));
  }
  headerRow.push("Keldi", "Kelmadi", "Kechikdi", "Jami Ball");
  sheet1.addRow([]); // empty row 2
  sheet1.addRow(headerRow); // row 3

  const hRow = sheet1.getRow(3);
  hRow.height = 24;
  hRow.eachCell((cell) => {
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1B5E20" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Fill Students Attendance Data
  students.forEach((student, index) => {
    const attendanceMap = new Map();
    student.attendances.forEach((att) => {
      const dayNum = parseInt(att.date.split("-")[2], 10);
      attendanceMap.set(dayNum, att.status);
    });

    let present = 0;
    let absent = 0;
    let late = 0;

    const rowData = [index + 1, student.fullName];

    for (let d = 1; d <= daysInMonth; d++) {
      const st = attendanceMap.get(d);
      if (st === "PRESENT") {
        rowData.push("+");
        present++;
      } else if (st === "ABSENT") {
        rowData.push("-");
        absent++;
      } else if (st === "LATE") {
        rowData.push("K");
        late++;
      } else {
        rowData.push("");
      }
    }

    const rankInfo = leaderboardData.rankings.find((r) => r.id === student.id);
    rowData.push(present, absent, late, rankInfo ? rankInfo.totalPoints : 0);

    const addedRow = sheet1.addRow(rowData);
    addedRow.height = 20;

    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } },
      };
      if (colNumber === 2) {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      // Value-based coloring
      const val = cell.value;
      if (val === "+") {
        cell.font = { color: { argb: "FF2E7D32" }, bold: true };
      } else if (val === "-") {
        cell.font = { color: { argb: "FFC62828" }, bold: true };
      } else if (val === "K") {
        cell.font = { color: { argb: "FFF57F17" }, bold: true };
      }
    });
  });

  // Auto-width columns
  sheet1.getColumn(1).width = 5;
  sheet1.getColumn(2).width = 28;
  for (let d = 3; d <= daysInMonth + 2; d++) {
    sheet1.getColumn(d).width = 4;
  }
  sheet1.getColumn(daysInMonth + 3).width = 9;
  sheet1.getColumn(daysInMonth + 4).width = 9;
  sheet1.getColumn(daysInMonth + 5).width = 9;
  sheet1.getColumn(daysInMonth + 6).width = 12;

  // -------------------------------------------------------------
  // Sheet 2: Oy O'quvchisi & Reyting (Leaderboard Sheet)
  // -------------------------------------------------------------
  const sheet2 = workbook.addWorksheet("Reyting va Ballar");

  sheet2.mergeCells(1, 1, 1, 7);
  const rTitle = sheet2.getCell(1, 1);
  rTitle.value = `${currentYM} OY O'QUVCHISI VA UMUMIY REYTING`;
  rTitle.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  rTitle.alignment = { horizontal: "center", vertical: "middle" };
  rTitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1565C0" }, // Blue
  };
  sheet2.getRow(1).height = 30;

  sheet2.addRow([]);
  sheet2.addRow([
    "O'rin",
    "F.I.Sh.",
    "Davomat Balli",
    "Test Ballari",
    "Qo'shimcha Ball",
    "Jami Ball",
    "Holati",
  ]);

  const lHeader = sheet2.getRow(3);
  lHeader.height = 24;
  lHeader.eachCell((cell) => {
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0D47A1" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  leaderboardData.rankings.forEach((student, idx) => {
    const medal = idx === 0 ? "🥇 Oy O'quvchisi" : idx === 1 ? "🥈 2-o'rin" : idx === 2 ? "🥉 3-o'rin" : `${idx + 1}-o'rin`;
    const row = sheet2.addRow([
      idx + 1,
      student.fullName,
      student.attendancePoints,
      student.quizPoints,
      student.bonusPoints,
      student.totalPoints,
      medal,
    ]);

    row.height = 22;
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } },
      };
      if (colNumber === 2) {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      if (idx === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF9C4" }, // Gold tint for #1
        };
      }
    });
  });

  sheet2.getColumn(1).width = 8;
  sheet2.getColumn(2).width = 30;
  sheet2.getColumn(3).width = 16;
  sheet2.getColumn(4).width = 16;
  sheet2.getColumn(5).width = 16;
  sheet2.getColumn(6).width = 16;
  sheet2.getColumn(7).width = 20;

  return await workbook.xlsx.writeBuffer();
}