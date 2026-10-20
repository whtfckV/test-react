import { Box, Flex } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { Outlet, useParams } from 'react-router'
import { ChatList } from '../components/ChatList'
import { useIncomingMessages } from '../hooks/useIncomingMessages'

export function ChatsPage() {
  useIncomingMessages()
  const { chatId } = useParams()
  const isMobile = useMediaQuery('(max-width: 48em)')

  const showList = !isMobile || !chatId
  const showChat = !isMobile || Boolean(chatId)

  return (
    <Flex h="100dvh">
      {showList && (
        <Box w={isMobile ? '100%' : 360} style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}>
          <ChatList />
        </Box>
      )}
      {showChat && (
        <Box flex={1} miw={0}>
          <Outlet />
        </Box>
      )}
    </Flex>
  )
}
