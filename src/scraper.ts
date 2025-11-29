import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

interface Produto {
  nome: string | undefined;
  preco: string | undefined;
  foto?: string | undefined;
  url?: string | undefined;
}

interface ScraperOptions {
  url?: string; // pode vir vazio
}

async function scrapeMercadoLivre(options: ScraperOptions) {
  const { url } = options;

  if (!url || url.trim() === "") {
    throw new Error("A URL está vazia. Envie uma URL válida do Mercado Livre.");
  }

  const produtos: Produto[] = [];
  let pagina = 1;
  let offset = 1;

  while (true) {
    const paginaUrl =
      pagina === 1 ? url : `${url}_Desde_${offset}`;

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

      // Se não tem itens → acabou
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
          produtos.push({
            nome,
            preco: `R$ ${preco}`,
            foto,
            url: urlProduto ? urlProduto.split("?")[0] : undefined,
          });
        }
      });

      console.log(`Itens acumulados: ${produtos.length}`);

      // Avança para próxima página
      pagina++;
      offset += 48;

    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(`Erro Axios na página ${pagina}:`, err.message);
      } else if (err instanceof Error) {
        console.error(`Erro inesperado na página ${pagina}:`, err.message);
      } else {
        console.error(`Erro desconhecido na página ${pagina}:`, err);
      }
      break;
    }
  }

  fs.writeFileSync("produtos.json", JSON.stringify(produtos, null, 2), "utf-8");
  console.log(`\nScraping completo. Total de produtos: ${produtos.length}`);
}

// === EXECUÇÃO ===
scrapeMercadoLivre({
  url: "https://lista.mercadolivre.com.br/informatica/tablets-acessorios/tablets/apple/ipad/usado/ipados/ipad-10_OrderId_PRICE_PriceRange_1500-3400_NoIndex_True"
});
