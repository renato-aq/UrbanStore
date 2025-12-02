// scraper.ts
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

export interface Product {
  nome: string | undefined;
  preco: string | undefined;
  foto?: string | undefined;
  url?: string | undefined;
}

export interface ScraperOptions {
  url?: string;
}

// === FUNÇÃO PRINCIPAL DE SCRAPING ===
export async function scrapeML(options: ScraperOptions): Promise<Product[]> {
  const { url } = options;

  if (!url || url.trim() === "") {
    throw new Error("A URL está vazia. Envie uma URL válida do Mercado Livre.");
  }

  const products: Product[] = [];
  let pagina = 1;
  let offset = 1;

  while (true) {
    const paginaUrl = pagina === 1 ? url : `${url}_Desde_${offset}`;
    console.log(`\nScrapando página ${pagina}: ${paginaUrl}`);

    try {
      const response = await axios.get(paginaUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      const itens = $(".ui-search-layout__item");

      if (itens.length === 0) {
        console.log("Nenhum item encontrado. Fim das páginas.");
        break;
      }

      itens.each((_, elem) => {
        const card = $(elem);

        const nome =
          card.find(".poly-component__title").text().trim() ||
          card.find("h2.poly-component__title a").text().trim() ||
          undefined;

        const preco =
          card.find(".andes-money-amount__fraction").first().text().trim() ||
          undefined;

        const foto =
          card.find("img.poly-component__picture").first().attr("src") ||
          card.find("img.poly-component__picture").first().attr("data-src") ||
          undefined;

        const urlProduto =
          card.find("a.poly-component__link").attr("href") ||
          card.find("a.poly-component__title").attr("href") ||
          undefined;

        if (nome && preco) {
          products.push({
            nome,
            preco: `R$ ${preco}`,
            foto,
            url: urlProduto ? urlProduto.split("?")[0] : undefined,
          });
        }
      });

      pagina++;
      offset += 48;
    } catch (err) {
      console.error("Erro durante scraping:", err);
      break;
    }
  }

  // Salva arquivo
  fs.writeFileSync("produtos.json", JSON.stringify(products, null, 2), "utf-8");

  console.log(`\nScraping completo. Total de produtos: ${products.length}`);

  return products;
}
