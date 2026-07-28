import '@testing-library/jest-dom';

// Global t() mock helper — handles both fallback strings and interpolation objects
(globalThis as any).__mockT = (key: string, fallbackOrOptions?: string | Record<string, unknown>) =>
  typeof fallbackOrOptions === 'string' ? fallbackOrOptions : key;

// Silence React act() warnings from async state updates in tests
const originalError = console.error.bind(console.error);
beforeAll(() => {
  console.error = (msg: string, ...args: unknown[]) => {
    if (typeof msg === 'string' && msg.startsWith('Warning: An update to') && msg.includes('not wrapped in act(')) return;
    originalError(msg, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
