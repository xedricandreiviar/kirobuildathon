import { describe, it, expect, vi, afterEach } from 'vitest';
import { copyToClipboard } from './clipboardUtil';

describe('copyToClipboard', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  it('should return true and call writeText when Clipboard API is available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const result = await copyToClipboard('https://example.com/card/123');

    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('https://example.com/card/123');
  });

  it('should return false when navigator.clipboard is undefined', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const result = await copyToClipboard('some text');

    expect(result).toBe(false);
  });

  it('should return false when writeText is not available', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {},
      writable: true,
      configurable: true,
    });

    const result = await copyToClipboard('some text');

    expect(result).toBe(false);
  });

  it('should propagate errors thrown by writeText', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    await expect(copyToClipboard('text')).rejects.toThrow('Permission denied');
  });
});
