import { expect, afterEach, beforeEach, vi } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'

expect.extend(matchers)

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})