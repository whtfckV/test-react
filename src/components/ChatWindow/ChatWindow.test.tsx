import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/render'
import { resetStores } from '../../test/store'
import { ChatWindow } from './ChatWindow'

const chatId = '79001234567@c.us'

describe('ChatWindow', () => {
  beforeEach(() =>
    resetStores({
      chats: {
        [chatId]: {
          chatId,
          name: 'Иван',
          messages: [
            { id: '1', text: 'Привет', direction: 'out', timestamp: 1 },
            { id: '2', text: 'Здравствуй', direction: 'in', timestamp: 2 },
          ],
        },
      },
    }),
  )

  it('показывает имя собеседника и сообщения чата', () => {
    renderWithProviders(<ChatWindow />, { route: `/chat/${chatId}`, path: '/chat/:chatId' })

    expect(screen.getByText('Иван')).toBeInTheDocument()
    expect(screen.getByText('Привет')).toBeInTheDocument()
    expect(screen.getByText('Здравствуй')).toBeInTheDocument()
  })

  it('для неизвестного чата показывает номер из chatId', () => {
    renderWithProviders(<ChatWindow />, { route: '/chat/79990000000@c.us', path: '/chat/:chatId' })

    expect(screen.getByText('+79990000000')).toBeInTheDocument()
  })
})
