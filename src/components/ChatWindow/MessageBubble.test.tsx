import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/render'
import { MessageBubble } from './MessageBubble'

describe('MessageBubble', () => {
  it('показывает текст и время сообщения', () => {
    const timestamp = new Date(2026, 0, 1, 9, 5).getTime()
    renderWithProviders(<MessageBubble message={{ id: '1', text: 'Привет', direction: 'in', timestamp }} />)

    expect(screen.getByText('Привет')).toBeInTheDocument()
    expect(screen.getByText('09:05')).toBeInTheDocument()
  })
})
