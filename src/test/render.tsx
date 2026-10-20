import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { theme } from '../theme'
import { LocationDisplay } from './LocationDisplay'

interface Options {
  route?: string
  path?: string
}

// env="test" отключает у Mantine порталы и анимации
export function renderWithProviders(ui: ReactElement, { route = '/', path = '*' }: Options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <MantineProvider theme={theme} env="test">
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
          </Routes>
          <LocationDisplay />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  )
}
