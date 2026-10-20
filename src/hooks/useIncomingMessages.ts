import { useEffect } from "react";
import { greenApi } from "../api/greenApi";
import type {
  Credentials,
  MessageWebhook,
  Notification,
  NotificationBody,
} from "../api/greenApi";
import { useAuthStore } from "../store/auth";
import { useChatsStore } from "../store/chats";
import type { ChatContact, Message } from "../store/chats";

type MessageHandler = (contact: ChatContact, message: Message) => void;

const RECEIVE_TIMEOUT_SEC = 20;
const RETRY_DELAY_MS = 3000;

const MESSAGE_WEBHOOKS = new Set<string>([
  "incomingMessageReceived",
  "outgoingMessageReceived",
  "outgoingAPIMessageReceived",
]);

function isMessageWebhook(
  body: NotificationBody,
): body is NotificationBody & MessageWebhook {
  return MESSAGE_WEBHOOKS.has(body.typeWebhook);
}

function toMessage(webhook: MessageWebhook): Message | null {
  const data = webhook.messageData;
  const text =
    data.textMessageData?.textMessage ?? data.extendedTextMessageData?.text;
  if (!text) return null;

  return {
    id: webhook.idMessage,
    text,
    direction: webhook.typeWebhook === "incomingMessageReceived" ? "in" : "out",
    timestamp: webhook.timestamp * 1000,
  };
}

function toContact({ typeWebhook, senderData }: MessageWebhook): ChatContact {
  const isIncoming = typeWebhook === "incomingMessageReceived";
  return {
    chatId: senderData.chatId,
    phone:
      isIncoming && senderData.senderPhoneNumber
        ? String(senderData.senderPhoneNumber)
        : undefined,
    name: senderData.chatName,
  };
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

function handleNotification({ body }: Notification, onMessage: MessageHandler) {
  if (import.meta.env.DEV) {
    console.debug("[greenApi] notification", body);
  }
  if (!isMessageWebhook(body)) return;

  const message = toMessage(body);
  if (message) {
    onMessage(toContact(body), message);
  }
}

async function pollOnce(
  credentials: Credentials,
  signal: AbortSignal,
  onMessage: MessageHandler,
) {
  try {
    const notification = await greenApi.receiveNotification(
      credentials,
      RECEIVE_TIMEOUT_SEC,
      signal,
    );
    if (!notification) return;

    handleNotification(notification, onMessage);
    await greenApi.deleteNotification(
      credentials,
      notification.receiptId,
      signal,
    );
  } catch (error) {
    if (signal.aborted) return;
    console.error("[greenApi] receiveNotification failed", error);
    await sleep(RETRY_DELAY_MS, signal);
  }
}

function pollNotifications(
  credentials: Credentials,
  signal: AbortSignal,
  onMessage: MessageHandler,
) {
  if (signal.aborted) return;
  void pollOnce(credentials, signal, onMessage).then(() =>
    pollNotifications(credentials, signal, onMessage),
  );
}

export function useIncomingMessages() {
  const credentials = useAuthStore((s) => s.credentials);
  const receiveMessage = useChatsStore((s) => s.receiveMessage);

  useEffect(() => {
    if (!credentials) return;
    const controller = new AbortController();
    pollNotifications(credentials, controller.signal, receiveMessage);
    return () => controller.abort();
  }, [credentials, receiveMessage]);
}
