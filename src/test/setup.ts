import '@testing-library/jest-dom'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

// jsdom does not implement scrollIntoView or scrollTo.
window.HTMLElement.prototype.scrollIntoView = () => {}
window.HTMLElement.prototype.scrollTo = (() => {}) as typeof window.HTMLElement.prototype.scrollTo
