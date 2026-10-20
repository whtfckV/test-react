import { ActionIcon, Avatar, Group, ScrollArea, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconLogout, IconPlus } from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router'
import { getChatTitle } from '../../lib/phone'
import { useAuthStore } from '../../store/auth'
import { useChatsStore } from '../../store/chats'
import { AddChatModal } from '../AddChatModal'
import classes from './ChatList.module.css'

export function ChatList() {
  const navigate = useNavigate()
  const { chatId: activeChatId } = useParams()
  const chats = useChatsStore((s) => s.chats)
  const resetChats = useChatsStore((s) => s.reset)
  const logout = useAuthStore((s) => s.logout)
  const [opened, { open, close }] = useDisclosure(false)

  const sortedChats = Object.values(chats).sort(
    (a, b) => (b.messages.at(-1)?.timestamp ?? 0) - (a.messages.at(-1)?.timestamp ?? 0),
  )

  const handleLogout = () => {
    resetChats()
    logout()
  }

  return (
    <Stack h="100%" gap={0}>
      <Group justify="space-between" p="sm" className={classes.header}>
        <Text fw={600}>Чаты</Text>
        <Group gap="xs">
          <Tooltip label="Новый чат">
            <ActionIcon variant="subtle" aria-label="Новый чат" onClick={open}>
              <IconPlus size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Выйти">
            <ActionIcon variant="subtle" color="gray" aria-label="Выйти" onClick={handleLogout}>
              <IconLogout size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <ScrollArea flex={1}>
        {sortedChats.length === 0 && (
          <Text c="dimmed" ta="center" p="md" size="sm">
            Нет чатов. Нажмите "+", чтобы добавить.
          </Text>
        )}
        {sortedChats.map((chat) => {
          const title = getChatTitle(chat)
          return (
            <UnstyledButton
              key={chat.chatId}
              className={classes.item}
              data-active={chat.chatId === activeChatId || undefined}
              onClick={() => navigate(`/chat/${chat.chatId}`)}
            >
              <Group wrap="nowrap">
                <Avatar color="initials" name={title} radius="xl" />
                <div style={{ minWidth: 0 }}>
                  <Text fw={500} size="sm">
                    {title}
                  </Text>
                  <Text c="dimmed" size="xs" truncate>
                    {chat.messages.at(-1)?.text ?? 'Нет сообщений'}
                  </Text>
                </div>
              </Group>
            </UnstyledButton>
          )
        })}
      </ScrollArea>

      <AddChatModal opened={opened} onClose={close} />
    </Stack>
  )
}
