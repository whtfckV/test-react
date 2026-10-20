import { useAuthStore } from '../store/auth'
import { useChatsStore } from '../store/chats'
import type { Chat } from '../store/chats'

export const testCredentials = { idInstance: '1101000001', apiTokenInstance: 'token' }

export function resetStores({ chats = {}, loggedIn = true }: { chats?: Record<string, Chat>; loggedIn?: boolean } = {}) {
  useChatsStore.setState({ chats })
  useAuthStore.setState({ credentials: loggedIn ? testCredentials : null })
}
