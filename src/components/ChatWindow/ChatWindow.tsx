import { ActionIcon, Avatar, Center, Group, ScrollArea, Stack, Text } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { getChatTitle } from '../../lib/phone'
import { useChatsStore } from '../../store/chats'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import classes from './ChatWindow.module.css'

export function ChatWindow() {
  const navigate = useNavigate()
  const { chatId = '' } = useParams()
  const chat = useChatsStore((s) => s.chats[chatId])
  const messages = chat?.messages
  const viewportRef = useRef<HTMLDivElement>(null)
  const title = getChatTitle(chat ?? { chatId })

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight })
  }, [messages?.length])

  return (
    <Stack h="100%" gap={0}>
      <Group p="sm" className={classes.header}>
        <ActionIcon variant="subtle" color="gray" hiddenFrom="sm" aria-label="Назад" onClick={() => navigate('/')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Avatar color="initials" name={title} radius="xl" size="md" />
        <Text fw={500}>{title}</Text>
      </Group>

      <ScrollArea flex={1} viewportRef={viewportRef} className={classes.messages}>
        <Stack gap={6} p="md">
          {messages?.map((m) => <MessageBubble key={m.id} message={m} />)}
        </Stack>
      </ScrollArea>

      <MessageInput chatId={chatId} />
    </Stack>
  )
}

export function EmptyChat() {
  return (
    <Center h="100%" className={classes.messages}>
      <Text c="dimmed">Выберите чат</Text>
    </Center>
  )
}
