import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatIdToPhone, normalizePhone } from "../lib/phone";

export interface Message {
  id: string;
  text: string;
  direction: "in" | "out";
  timestamp: number;
}

export interface Chat {
  chatId: string;
  remoteChatId?: string;
  phone?: string;
  name?: string;
  messages: Message[];
}

export interface ChatContact {
  chatId: string;
  phone?: string;
  name?: string;
}

interface ChatsState {
  chats: Record<string, Chat>;
  addChat: (chatId: string, phone?: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  receiveMessage: (contact: ChatContact, message: Message) => void;
  reset: () => void;
}

function getChatPhone(chat: Chat): string | undefined {
  if (chat.phone) return chat.phone;
  return chat.chatId.endsWith("@c.us") ? chatIdToPhone(chat.chatId) : undefined;
}

// Порядок поиска: по id сообщения (наше же отправленное, пришедшее как outgoing-уведомление) ->
// по номеру телефона -> по chatId
function findChat(
  chats: Record<string, Chat>,
  contact: ChatContact,
  messageId: string,
): Chat | undefined {
  const list = Object.values(chats);
  return (
    list.find((chat) => chat.messages.some((m) => m.id === messageId)) ??
    (contact.phone
      ? list.find((chat) => getChatPhone(chat) === contact.phone)
      : undefined) ??
    chats[contact.chatId] ??
    list.find((chat) => chat.remoteChatId === contact.chatId)
  );
}

function appendMessage(chat: Chat, message: Message): Chat {
  if (chat.messages.some((m) => m.id === message.id)) return chat;
  return { ...chat, messages: [...chat.messages, message] };
}

export const useChatsStore = create<ChatsState>()(
  persist(
    (set) => ({
      chats: {},
      addChat: (chatId, phone) =>
        set((state) =>
          state.chats[chatId]
            ? state
            : {
                chats: {
                  ...state.chats,
                  [chatId]: { chatId, phone, messages: [] },
                },
              },
        ),
      addMessage: (chatId, message) =>
        set((state) => {
          const chat = state.chats[chatId] ?? { chatId, messages: [] };
          return {
            chats: { ...state.chats, [chatId]: appendMessage(chat, message) },
          };
        }),
      receiveMessage: (contact, message) =>
        set((state) => {
          const phone = contact.phone
            ? normalizePhone(contact.phone)
            : undefined;
          const chat = findChat(
            state.chats,
            { ...contact, phone },
            message.id,
          ) ?? {
            chatId: contact.chatId,
            messages: [],
          };

          const updated: Chat = {
            ...appendMessage(chat, message),
            remoteChatId:
              contact.chatId !== chat.chatId
                ? contact.chatId
                : chat.remoteChatId,
            phone: getChatPhone(chat) ?? phone,
            name: contact.name || chat.name,
          };
          return { chats: { ...state.chats, [updated.chatId]: updated } };
        }),
      reset: () => set({ chats: {} }),
    }),
    { name: "green-api-chats" },
  ),
);
