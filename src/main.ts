import "./services/register.js";
import "./services/chat_register.js";

import fs from "fs";
import path from "path";
import { scrapeML } from "./services/scraper.js";
import { sendProcessProduct } from "./services/bot.js";

const filePath = path.resolve("urls.json");

function loadUrls(): string[] {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function processAllUrls() {
  const urls = loadUrls();

  if (urls.length === 0) {
    console.log("Nenhuma URL cadastrada.");
    return;
  }

  console.log("Iniciando scrap da lista...");

  for (const url of urls) {
    try {
      const products = await scrapeML({ url });

      if (products && products.length > 0) {
        await sendProcessProduct(products);
      }
    } catch (err) {
      console.log("Erro ao scrapar:", url, err);
    }
  }

  console.log("Processamento concluído. Aguardando 1 minuto...");
}

async function startLoop() {
  console.log(
    "Bot inicializado. Iniciando o loop de scraping e escuta de comandos...",
  );
  while (true) {
    await processAllUrls();
    await new Promise((resolve) => setTimeout(resolve, 60_000));
  }
}

startLoop();
