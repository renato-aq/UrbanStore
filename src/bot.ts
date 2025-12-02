import TelegramBot from "node-telegram-bot-api";
import type { Product } from "./scraper.js";
import dotenv from "dotenv";

dotenv.config();

// Token
const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  throw new Error("A variável TELEGRAM_TOKEN não está definida no .env");
}

// Chat ID (garantimos que NUNCA será undefined)
const chatIdEnv = process.env.CHAT_ID;
if (!chatIdEnv) {
  throw new Error("A variável CHAT_ID não está definida no .env");
}

export const chatId: number | string =
  /^\d+$/.test(chatIdEnv) ? Number(chatIdEnv) : chatIdEnv;

export const bot = new TelegramBot(token, { polling: false });

export async function sendProcessProduct(products: Product[]) {
  for (const product of products) {
    if (!product.nome || !product.preco) continue;

    const legenda = `
<b>${product.nome}</b>

💰 <b>Preço:</b> ${product.preco}

🔗 <a href="${product.url}">Clique aqui para ver o produto</a>
`;

    try {
      if (product.foto) {
        await bot.sendPhoto(chatId, product.foto, {
          caption: legenda,
          parse_mode: "HTML"
        });
      } else {
        await bot.sendMessage(chatId, legenda, { parse_mode: "HTML" });
      }
    } catch (err) {
      console.error("Erro ao enviar produto:", err);
    }
  }
}
