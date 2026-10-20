import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { greenApi } from '../api/greenApi'
import { useAuthStore } from '../store/auth'
import { renderWithProviders } from '../test/render'
import { resetStores, testCredentials } from '../test/store'
import { LoginPage } from './LoginPage'

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('idInstance'), testCredentials.idInstance)
  await userEvent.type(screen.getByLabelText('apiTokenInstance'), testCredentials.apiTokenInstance)
  await userEvent.click(screen.getByRole('button', { name: 'Войти' }))
}

describe('LoginPage', () => {
  beforeEach(() => resetStores({ loggedIn: false }))
  afterEach(() => vi.restoreAllMocks())

  it('требует заполнить поля', async () => {
    const check = vi.spyOn(greenApi, 'getStateInstance')
    renderWithProviders(<LoginPage />, { route: '/login' })

    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByText('Укажите idInstance')).toBeInTheDocument()
    expect(screen.getByText('Укажите apiTokenInstance')).toBeInTheDocument()
    expect(check).not.toHaveBeenCalled()
  })

  it('сохраняет креды и уходит на главную, если инстанс авторизован', async () => {
    vi.spyOn(greenApi, 'getStateInstance').mockResolvedValue({ stateInstance: 'authorized' })
    renderWithProviders(<LoginPage />, { route: '/login' })

    await fillAndSubmit()

    expect(useAuthStore.getState().credentials).toEqual(testCredentials)
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('показывает ошибку, если инстанс не авторизован', async () => {
    vi.spyOn(greenApi, 'getStateInstance').mockResolvedValue({ stateInstance: 'notAuthorized' })
    renderWithProviders(<LoginPage />, { route: '/login' })

    await fillAndSubmit()

    expect(await screen.findByText('Инстанс не авторизован: notAuthorized')).toBeInTheDocument()
    expect(useAuthStore.getState().credentials).toBeNull()
  })
})
