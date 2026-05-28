import '@testing-library/jest-dom'

Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    memory: { usedJSHeapSize: 44_000_000, totalJSHeapSize: 134_000_000 },
  },
  writable: true,
})

global.requestAnimationFrame = (cb: FrameRequestCallback) => {
  setTimeout(() => cb(performance.now()), 16)
  return 0
}
global.cancelAnimationFrame = jest.fn()

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
