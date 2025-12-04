import TelegramBot from "node-telegram-bot-api";
import type { Product } from "./scraper.js";
import dotenv from "dotenv";
import { loadChatIds } from "./chat_register.js";

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  throw new Error("A variável TELEGRAM_TOKEN não está definida no .env");
}

export const bot = new TelegramBot(token, { polling: true });

export async function sendProcessProduct(products: Product[]) {
  const allChatIds = loadChatIds();

  if (allChatIds.length === 0) {
    console.log("Nenhum chat registrado para envio.");
    return;
  }

  for (const chatId of allChatIds) {
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
            parse_mode: "HTML",
          });
        } else {
          await bot.sendMessage(chatId, legenda, { parse_mode: "HTML" });
        }
      } catch (err) {
        console.error(`Erro ao enviar produto para o chat ${chatId}:`, err);
      }
    }
  }
}
