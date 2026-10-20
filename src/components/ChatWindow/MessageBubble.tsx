import { Paper, Text } from '@mantine/core'
import type { Message } from '../../store/chats'

const timeFormat = new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' })

export function MessageBubble({ message }: Readonly<{ message: Message }>) {
  const isOut = message.direction === 'out'

  return (
    <Paper
      px="sm"
      py={6}
      maw="70%"
      radius="lg"
      bg={isOut ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-body)'}
      c={isOut ? 'white' : undefined}
      style={{ alignSelf: isOut ? 'flex-end' : 'flex-start' }}
    >
      <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {message.text}
      </Text>
      <Text size="xs" ta="right" opacity={0.7}>
        {timeFormat.format(message.timestamp)}
      </Text>
    </Paper>
  )
}
