import axios from "axios";
import { summarizeText, explainQuestion, generateExam } from "../utils/openai.js";
import { saveSetting, getUserSettings } from "../utils/settings.js";

const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// القائمة الرئيسية
const mainMenu = {
  reply_markup: {
    keyboard: [
      [{ text: "🎓 تلخيص درس" }, { text: "📘 شرح سؤال" }],
      [{ text: "🧪 امتحان سريع" }],
      [{ text: "📄 رفع ملف PDF" }, { text: "🎤 شرح فويس" }],
      [{ text: "⚙️ الإعدادات" }]
    ],
    resize_keyboard: true
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("Bot running");

  const update = req.body;

  // رسائل عادية
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text || "";
    const settings = getUserSettings(chatId);

    if (text === "/start") {
      return sendMessage(chatId, "أهلاً 👋\nاختر الخدمة التي تريدها:", mainMenu);
    }

    if (text === "🎓 تلخيص درس") {
      return sendMessage(chatId, "📄 ابعت النص أو الدرس المراد تلخيصه:");
    }

    if (text === "📘 شرح سؤال") {
      return sendMessage(chatId, "❓ ابعت السؤال أو صورة من الكتاب:");
    }

    if (text === "🧪 امتحان سريع") {
      const exam = await generateExam();
      return sendMessage(chatId, exam);
    }

    if (text === "⚙️ الإعدادات") {
      return sendSettingsMenu(chatId);
    }

    // شرح تلقائي
    if (text) {
      const response = await explainQuestion(text, settings);
      return sendMessage(chatId, response);
    }
  }

  // أزرار الإعدادات
  if (update.callback_query) {
    const chatId = update.callback_query.from.id;
    const msgId = update.callback_query.message.message_id;
    const data = update.callback_query.data;

    // مستوى الشرح
    if (data === "level") {
      return editMessage(chatId, msgId, "اختر مستوى الشرح:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "سهل", callback_data: "level_easy" }],
            [{ text: "متوسط", callback_data: "level_medium" }],
            [{ text: "متقدم", callback_data: "level_hard" }]
          ]
        }
      });
    }

    if (data.startsWith("level_")) {
      const value = data.split("_")[1];
      saveSetting(chatId, "level", value);
      return editMessage(chatId, msgId, `✔️ تم اختيار المستوى: ${value}`);
    }

    // نوع التلخيص
    if (data === "summary_type") {
      return editMessage(chatId, msgId, "اختر نوع التلخيص:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "قصير", callback_data: "summary_short" }],
            [{ text: "متوسط", callback_data: "summary_medium" }],
            [{ text: "طويل", callback_data: "summary_long" }]
          ]
        }
      });
    }

    if (data.startsWith("summary_")) {
      const value = data.split("_")[1];
      saveSetting(chatId, "summary_type", value);
      return editMessage(chatId, msgId, `✔️ تم اختيار التلخيص: ${value}`);
    }

    // اللغة
    if (data === "language") {
      return editMessage(chatId, msgId, "اختر اللغة:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🇪🇬 عربي", callback_data: "lang_ar" }],
            [{ text: "🇬🇧 English", callback_data: "lang_en" }]
          ]
        }
      });
    }

    if (data.startsWith("lang_")) {
      const value = data.split("_")[1];
      saveSetting(chatId, "language", value);
      return editMessage(chatId, msgId, `✔️ اللغة المختارة: ${value}`);
    }

    // ستايل الشرح
    if (data === "style") {
      return editMessage(chatId, msgId, "اختر ستايل الشرح:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "مبسّط", callback_data: "style_simple" }],
            [{ text: "أكاديمي", callback_data: "style_academic" }],
            [{ text: "تفصيلي", callback_data: "style_detailed" }]
          ]
        }
      });
    }

    if (data.startsWith("style_")) {
      const value = data.split("_")[1];
      saveSetting(chatId, "style", value);
      return editMessage(chatId, msgId, `✔️ تم اختيار: ${value}`);
    }
  }

  return res.status(200).send("ok");
}

// إرسال رسالة
async function sendMessage(chatId, text, keyboard = null) {
  await axios.post(`${URL}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    ...keyboard
  });
}

// تعديل الرسالة
async function editMessage(chatId, messageId, text, keyboard = null) {
  await axios.post(`${URL}/editMessageText`, {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "Markdown",
    ...keyboard
  });
}

// قائمة الإعدادات
async function sendSettingsMenu(chatId) {
  await axios.post(`${URL}/sendMessage`, {
    chat_id: chatId,
    text: "اختر نوع الإعداد:",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎚️ مستوى الشرح", callback_data: "level" }],
        [{ text: "📝 نوع التلخيص", callback_data: "summary_type" }],
        [{ text: "🌍 اللغة", callback_data: "language" }],
        [{ text: "🎨 ستايل الشرح", callback_data: "style" }]
      ]
    }
  });
}