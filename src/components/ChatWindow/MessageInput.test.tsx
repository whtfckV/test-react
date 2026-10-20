import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { greenApi } from '../../api/greenApi'
import { useChatsStore } from '../../store/chats'
import { renderWithProviders } from '../../test/render'
import { resetStores, testCredentials } from '../../test/store'
import { MessageInput } from './MessageInput'

const chatId = '79001234567@c.us'

describe('MessageInput', () => {
  beforeEach(() => resetStores({ chats: { [chatId]: { chatId, messages: [] } } }))
  afterEach(() => vi.restoreAllMocks())

  it('кнопка отправки недоступна при пустом поле', () => {
    renderWithProviders(<MessageInput chatId={chatId} />)

    expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()
  })

  it('отправляет сообщение по Enter и добавляет его в чат', async () => {
    const send = vi.spyOn(greenApi, 'sendMessage').mockResolvedValue({ idMessage: 'msg-1' })
    renderWithProviders(<MessageInput chatId={chatId} />)

    const input = screen.getByPlaceholderText('Сообщение')
    await userEvent.type(input, 'Привет{Enter}')

    expect(send).toHaveBeenCalledWith(testCredentials, chatId, 'Привет')
    expect(input).toHaveValue('')
    expect(useChatsStore.getState().chats[chatId].messages).toMatchObject([
      { id: 'msg-1', text: 'Привет', direction: 'out' },
    ])
  })

  it('отправляет на remoteChatId, если он известен', async () => {
    resetStores({ chats: { [chatId]: { chatId, remoteChatId: '12345', messages: [] } } })
    const send = vi.spyOn(greenApi, 'sendMessage').mockResolvedValue({ idMessage: 'msg-1' })
    renderWithProviders(<MessageInput chatId={chatId} />)

    await userEvent.type(screen.getByPlaceholderText('Сообщение'), 'Привет')
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    expect(send).toHaveBeenCalledWith(testCredentials, '12345', 'Привет')
  })

  it('показывает ошибку отправки и сохраняет текст', async () => {
    vi.spyOn(greenApi, 'sendMessage').mockRejectedValue(new Error('Сеть недоступна'))
    renderWithProviders(<MessageInput chatId={chatId} />)

    const input = screen.getByPlaceholderText('Сообщение')
    await userEvent.type(input, 'Привет{Enter}')

    expect(await screen.findByText('Сеть недоступна')).toBeInTheDocument()
    expect(input).toHaveValue('Привет')
  })
})
