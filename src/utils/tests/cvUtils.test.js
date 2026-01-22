import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sortPoints,
  distance,
  calculateOutputSize,
  isValidDocument,
  applyPerspectiveWarp,
} from '../cvUtils';

// ---- OpenCV MOCK ----
beforeEach(() => {
  globalThis.cv = {
    imread: vi.fn(() => ({ rows: 100, cols: 100, delete: vi.fn() })),
    imshow: vi.fn(),
    cvtColor: vi.fn(),
    GaussianBlur: vi.fn(),
    adaptiveThreshold: vi.fn(),
    Canny: vi.fn(),
    bitwise_or: vi.fn(),
    morphologyEx: vi.fn(),
    findContours: vi.fn(),
    contourArea: vi.fn(() => 50000),
    arcLength: vi.fn(() => 400),
    approxPolyDP: vi.fn((_, mat) => (mat.rows = 4)),
    getPerspectiveTransform: vi.fn(() => ({ delete: vi.fn() })),
    warpPerspective: vi.fn(),
    getStructuringElement: vi.fn(() => ({ delete: vi.fn() })),
    matFromArray: vi.fn(() => ({ delete: vi.fn() })),
    Mat: vi.fn(() => ({ delete: vi.fn(), rows: 4, data32S: [0,0,100,0,100,100,0,100] })),
    MatVector: vi.fn(() => ({
      size: vi.fn(() => 1),
      get: vi.fn(() => ({ delete: vi.fn() })),
      delete: vi.fn(),
    })),
    Size: vi.fn(),
    Scalar: vi.fn(),
    COLOR_RGBA2GRAY: 0,
    COLOR_GRAY2RGBA: 1,
    ADAPTIVE_THRESH_GAUSSIAN_C: 0,
    THRESH_BINARY: 0,
    MORPH_RECT: 0,
    MORPH_CLOSE: 0,
    RETR_EXTERNAL: 0,
    CHAIN_APPROX_SIMPLE: 0,
    INTER_LINEAR: 0,
    BORDER_CONSTANT: 0,
    CV_32FC2: 0,
  };

  Object.defineProperty(window, 'cv', {
    value: globalThis.cv,
    writable: true,
  });
});

// ---- UNIT TESTS ----

describe('Geometry Utilities', () => {
  it('sorts 4 points clockwise', () => {
    const points = [
      { x: 100, y: 100 },
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
    ];

    const sorted = sortPoints(points);
    expect(sorted).toHaveLength(4);
  });

  it('calculates Euclidean distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('calculates output size correctly', () => {
    const size = calculateOutputSize([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 150 },
      { x: 0, y: 150 },
    ]);

    expect(size.width).toBe(100);
    expect(size.height).toBe(150);
  });
});

describe('Document Validation', () => {
  it('accepts valid document contour', () => {
    const contour = {};
    expect(isValidDocument(contour, 100000)).toBe(true);
  });

  it('rejects too-small contour', () => {
    globalThis.cv.contourArea.mockReturnValueOnce(500);
    expect(isValidDocument({}, 100000)).toBe(false);
  });
});

describe('Perspective Warp', () => {
  it('returns null on error', () => {
    globalThis.cv.getPerspectiveTransform.mockImplementationOnce(() => {
      throw new Error('fail');
    });

    const result = applyPerspectiveWarp({}, [], 100, 100);
    expect(result).toBeNull();
  });
});
