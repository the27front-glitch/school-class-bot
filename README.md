# 🏫 Maktab Sinf Boshqaruvi Telegram Boti

Maktab sinfi uchun to'liq avtomatlashgan, qulay va keng qamrovli boshqaruv tizimi (Google Gemini AI testlar generatori bilan).

---

## 🌟 Asosiy Imkoniyatlar

 **👥 Gibrid O'quvchilar Boshqaruvi:**
   - Admin o'quvchilarni ism-familiyasi bilan kiritadi.
   - Telefoni bor o'quvchilar bot orqali o'z ismini tanlab, bir tugma bilan ulanadi.
   - Telefoni yo'q o'quvchilar uchun admin qo'lda test va bonus ballar qo'shishi mumkin.



 **🤖 Google Gemini AI Testlari:**
   - **Dushanba 12:00:**  Darsligi bo'yicha 15 talik yangi test yuklanadi ➡️ **Chorshanba 12:00 da** yopiladi.
   - **Payshanba 12:00:** Keyingi fandan 15 talik yangi test yuklanadi ➡️ **Shanba 12:00 da** yopiladi.


 **🏆 "Oy O'quvchisi" & Reyting:**
   - Ballar formulasi: `(Davomat kunlari × 5) + (To'g'ri test javoblari × 10) + Bonus ballar`.
   - Oylik liderlar reytingi va bir bosishda chiroyli `.xlsx` (Excel) hisobotini yuklab olish.

**📅 Dars Jadvali & Eslatmalar:**
   - Haftalik dars jadvalini kiritish, tahrirlash va tozalash.
   - Har kuni soat **20:00** da ertangi darslar jadvalini bot o'quvchilarga avtomatik yuboradi.
   - Dushanba-Shanba kunlari soat **08:30** da adminga davomat eslatmasi.

---

 `.env` Fayli Tarkibi:
```env
BOT_TOKEN=8741849192:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_IDS=7317240558
ATTENDANCE_POINTS=5
QUIZ_POINT_MULTIPLIER=10
```
