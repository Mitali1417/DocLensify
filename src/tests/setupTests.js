import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock global objects used in browser
globalThis.cv = {
  imread: vi.fn(),
};

globalThis.URL.createObjectURL = vi.fn(() => "blob:test");

// Silence canvas warnings
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
}));
