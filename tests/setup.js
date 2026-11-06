import { vi } from 'vitest'
Element.prototype.scrollIntoView = vi.fn()
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
globalThis.ResizeObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
}
