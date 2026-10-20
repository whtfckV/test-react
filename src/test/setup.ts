import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom не реализует эти API, а Mantine их использует
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
globalThis.ResizeObserver = ResizeObserverMock

Element.prototype.scrollTo = vi.fn()

Object.defineProperty(document, 'fonts', {
  value: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})
