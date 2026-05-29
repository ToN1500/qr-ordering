import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock global fetch for testing
global.fetch = vi.fn();

import { apiFetch, API_URL } from './api';

describe('API Service Utility', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test Item' };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiFetch('/test');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/test`, expect.any(Object));
  });

  it('should throw error when response is not ok', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server Error' }),
    });

    await expect(apiFetch('/test')).rejects.toThrow('Server Error');
  });

  it('should handle network failure', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network Fail'));

    await expect(apiFetch('/test')).rejects.toThrow('Network Fail');
  });
});
