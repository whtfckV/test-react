export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface StateInstanceResponse {
  stateInstance:
    | "authorized"
    | "notAuthorized"
    | "blocked"
    | "starting"
    | "yellowCard";
}

export type MessageWebhookType =
  | "incomingMessageReceived"
  | "outgoingMessageReceived"
  | "outgoingAPIMessageReceived";

export interface MessageWebhook {
  typeWebhook: MessageWebhookType;
  idMessage: string;
  timestamp: number;
  senderData: {
    chatId: string;
    chatName?: string;
    sender: string;
    senderName: string;
    senderPhoneNumber?: number | string;
  };
  messageData: {
    typeMessage: string;
    textMessageData?: { textMessage: string };
    extendedTextMessageData?: { text: string };
  };
}

export interface NotificationBody {
  typeWebhook: string;
  [key: string]: unknown;
}

export interface Notification {
  receiptId: number;
  body: NotificationBody;
}

export interface DeleteNotificationResponse {
  result: boolean;
  reason?: string;
}

async function request<T>(
  creds: Credentials,
  method: string,
  init?: RequestInit,
  suffix = "",
): Promise<T> {
  const base = `https://${creds.idInstance.slice(0, 4)}.api.green-api.com`;
  const url = `${base}/waInstance${creds.idInstance}/${method}/${creds.apiTokenInstance}${suffix}`;
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`Green API ${method}: ${res.status} ${res.statusText}`);
  }
  // receiveNotification по таймауту возвращает пустое тело или null
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const greenApi = {
  getStateInstance: (creds: Credentials) =>
    request<StateInstanceResponse>(creds, "getStateInstance"),

  sendMessage: (creds: Credentials, chatId: string, message: string) =>
    request<SendMessageResponse>(creds, "sendMessage", {
      method: "POST",
      body: JSON.stringify({ chatId, message }),
    }),

  receiveNotification: (
    creds: Credentials,
    receiveTimeout = 5,
    signal?: AbortSignal,
  ) =>
    request<Notification | null>(
      creds,
      "receiveNotification",
      { signal },
      `?receiveTimeout=${receiveTimeout}`,
    ),

  deleteNotification: (
    creds: Credentials,
    receiptId: number,
    signal?: AbortSignal,
  ) =>
    request<DeleteNotificationResponse>(
      creds,
      "deleteNotification",
      { method: "DELETE", signal },
      `/${receiptId}`,
    ),
};
