// main.ts
import { scrapeML } from "./scraper.js";
import { bot, sendProcessProduct, chatId } from "./bot.js";

// === EXECUTAR ===
async function iniciar() {
  bot.sendMessage(chatId, "🔍 Iniciando scraping...");

  const produtos = await scrapeML({
    url: "https://lista.mercadolivre.com.br/informatica/tablets-acessorios/tablets/apple/ipad/usado/ipados/ipad-10_OrderId_PRICE_PriceRange_1500-3400_NoIndex_True",
  });
  
  await sendProcessProduct(produtos);
}

iniciar();
