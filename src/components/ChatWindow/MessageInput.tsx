import { ActionIcon, Group, Textarea } from '@mantine/core'
import { IconSend } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { greenApi } from '../../api/greenApi'
import { useAuthStore } from '../../store/auth'
import { useChatsStore } from '../../store/chats'

export function MessageInput({ chatId }: Readonly<{ chatId: string }>) {
  const [text, setText] = useState('')
  const credentials = useAuthStore((s) => s.credentials)
  const addMessage = useChatsStore((s) => s.addMessage)
  const targetChatId = useChatsStore((s) => s.chats[chatId]?.remoteChatId ?? chatId)

  const mutation = useMutation({
    mutationFn: (message: string) => greenApi.sendMessage(credentials!, targetChatId, message),
    onSuccess: ({ idMessage }, message) => {
      addMessage(chatId, { id: idMessage, text: message, direction: 'out', timestamp: Date.now() })
      setText('')
    },
  })

  const send = () => {
    const message = text.trim()
    if (message && !mutation.isPending) mutation.mutate(message)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <Group p="sm" gap="xs" wrap="nowrap" align="flex-end">
      <Textarea
        flex={1}
        placeholder="Сообщение"
        autosize
        maxRows={6}
        value={text}
        error={mutation.error?.message}
        onChange={(e) => {
          setText(e.currentTarget.value)
          if (mutation.isError) mutation.reset()
        }}
        onKeyDown={handleKeyDown}
      />
      <ActionIcon size="lg" radius="xl" aria-label="Отправить" onClick={send} loading={mutation.isPending} disabled={!text.trim()}>
        <IconSend size={18} />
      </ActionIcon>
    </Group>
  )
}
