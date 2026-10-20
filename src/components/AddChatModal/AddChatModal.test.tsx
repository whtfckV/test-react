import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatsStore } from '../../store/chats'
import { renderWithProviders } from '../../test/render'
import { resetStores } from '../../test/store'
import { AddChatModal } from './AddChatModal'

describe('AddChatModal', () => {
  beforeEach(() => resetStores())

  it('не создаёт чат с некорректным номером', async () => {
    const onClose = vi.fn()
    renderWithProviders(<AddChatModal opened onClose={onClose} />)

    await userEvent.type(screen.getByLabelText('Номер телефона'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Создать' }))

    expect(screen.getByText('Введите номер в международном формате')).toBeInTheDocument()
    expect(useChatsStore.getState().chats).toEqual({})
    expect(onClose).not.toHaveBeenCalled()
  })

  it('создаёт чат по номеру и открывает его', async () => {
    const onClose = vi.fn()
    renderWithProviders(<AddChatModal opened onClose={onClose} />)

    await userEvent.type(screen.getByLabelText('Номер телефона'), '+7 (900) 123-45-67')
    await userEvent.click(screen.getByRole('button', { name: 'Создать' }))

    expect(useChatsStore.getState().chats['79001234567@c.us']).toMatchObject({ phone: '79001234567' })
    expect(onClose).toHaveBeenCalled()
    expect(screen.getByTestId('location')).toHaveTextContent('/chat/79001234567@c.us')
  })
})
