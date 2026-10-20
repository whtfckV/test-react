export function normalizePhone(input: string): string {
  return input.replace(/\D/g, '')
}

export function phoneToChatId(phone: string): string {
  return `${normalizePhone(phone)}@c.us`
}

export function chatIdToPhone(chatId: string): string {
  return chatId.replace(/@.*$/, '')
}

export function getChatTitle(chat: { chatId: string; phone?: string; name?: string }): string {
  return chat.name || `+${chat.phone ?? chatIdToPhone(chat.chatId)}`
}
