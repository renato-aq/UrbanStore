import TelegramBot from "node-telegram-bot-api";
import type { Product } from "./scraper.js";

const token = "8591353605:AAFzVf1Ubqr75H0t4y7lpjUsKiM2RCfvhvs";
export const chatId: number | string = "959999661";
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
          parse_mode: "HTML",
        });
      } else {
        await bot.sendMessage(chatId, legenda, { parse_mode: "HTML" });
      }
    } catch (err) {
      console.error("Erro ao enviar produto:", err);
    }
  }
}