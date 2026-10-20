import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../../store/auth'
import { useChatsStore } from '../../store/chats'
import { renderWithProviders } from '../../test/render'
import { resetStores } from '../../test/store'
import { ChatList } from './ChatList'

describe('ChatList', () => {
  beforeEach(() => resetStores())

  it('показывает заглушку, если чатов нет', () => {
    renderWithProviders(<ChatList />)

    expect(screen.getByText(/Нет чатов/)).toBeInTheDocument()
  })

  it('показывает чаты с последним сообщением, свежие сверху', () => {
    resetStores({
      chats: {
        old: { chatId: '79000000001@c.us', name: 'Старый', messages: [{ id: '1', text: 'давно', direction: 'in', timestamp: 1 }] },
        new: { chatId: '79000000002@c.us', phone: '79000000002', messages: [{ id: '2', text: 'недавно', direction: 'in', timestamp: 2 }] },
      },
    })
    renderWithProviders(<ChatList />)

    const [first, second] = screen.getAllByRole('button', { name: /давно|недавно/ })
    expect(within(first).getByText('+79000000002')).toBeInTheDocument()
    expect(within(first).getByText('недавно')).toBeInTheDocument()
    expect(within(second).getByText('Старый')).toBeInTheDocument()
  })

  it('открывает чат по клику', async () => {
    resetStores({ chats: { a: { chatId: '79000000001@c.us', name: 'Иван', messages: [] } } })
    renderWithProviders(<ChatList />)

    await userEvent.click(screen.getByText('Иван'))

    expect(screen.getByTestId('location')).toHaveTextContent('/chat/79000000001@c.us')
  })

  it('выход очищает чаты и креды', async () => {
    resetStores({ chats: { a: { chatId: '79000000001@c.us', messages: [] } } })
    renderWithProviders(<ChatList />)

    await userEvent.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(useChatsStore.getState().chats).toEqual({})
    expect(useAuthStore.getState().credentials).toBeNull()
  })
})
