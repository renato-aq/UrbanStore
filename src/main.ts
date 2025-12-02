import { scrapeML } from "./scraper.js";
import { sendProcessProduct } from "./bot.js";

const URL =
  "https://lista.mercadolivre.com.br/informatica/tablets-acessorios/tablets/apple/ipad/usado/ipados/ipad-10_OrderId_PRICE_PriceRange_1500-3400_NoIndex_True";

const INTERVALO = 60000;

async function verificar() {
  console.log("\n🔍 Verificando novos produtos...");

  try {
    const novos = await scrapeML({ url: URL });

    if (novos.length > 0) {
      console.log(`🚀 ${novos.length} novo(s) produto(s) encontrado(s)!`);
      await sendProcessProduct(novos);
    } else {
      console.log("⚠️ Nenhum item novo encontrado.");
    }
  } catch (err) {
    console.error("❌ Erro na verificação:", err);
  }

  console.log("⏳ Aguardando próxima verificação...");
}

verificar();

setInterval(verificar, INTERVALO);
