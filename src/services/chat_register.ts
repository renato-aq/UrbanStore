import fs from "fs";
import path from "path";

const filePath = path.resolve("chats.json");

export function loadChatIds(): (string | number)[] {
  if (!fs.existsSync(filePath)) return [];

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Erro ao carregar chats.json:", error);
    return [];
  }
}

export function saveChatIds(chatIds: (string | number)[]) {
  fs.writeFileSync(filePath, JSON.stringify(chatIds, null, 2));
}

export function registerChatId(chatId: string | number): boolean {
  const chatIds = loadChatIds();

  if (chatIds.includes(chatId)) {
    return false;
  }

  chatIds.push(chatId);
  saveChatIds(chatIds);
  return true;
}
