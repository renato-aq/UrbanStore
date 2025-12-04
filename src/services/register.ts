import fs from "fs";
import path from "path";
import { bot } from "./bot.js";
import { registerChatId } from "./chat_register.js";

const filePath = path.resolve("urls.json");

function loadUrls(): string[] {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveUrls(urls: string[]) {
  fs.writeFileSync(filePath, JSON.stringify(urls, null, 2));
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

bot.onText(/\/register (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const url = match?.[1]?.trim();

  registerChatId(chatId);

  if (!url || !isValidUrl(url)) {
    bot.sendMessage(
      chatId,
      "Formato incorreto! Exemplo:\n/register https://site.com/produto",
    );
    return;
  }

  const urls = loadUrls();

  if (urls.includes(url)) {
    bot.sendMessage(chatId, "Essa URL já foi cadastrada.");
    return;
  }

  urls.push(url);
  saveUrls(urls);

  bot.sendMessage(
    chatId,
    "URL cadastrada com sucesso! Você receberá notificações para essa URL.",
  );
});
