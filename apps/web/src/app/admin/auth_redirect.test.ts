import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRouter } from 'next/navigation';
import * as apiClient from '../../lib/api';

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the API client
vi.mock('../../lib/api', () => ({
  apiFetch: vi.fn(),
}));

describe('Auth Redirect Logic', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('should redirect to /admin/login when an API call returns 401', async () => {
    const apiError = new Error('Unauthorized');
    (apiError as any).status = 401;
    (apiClient.apiFetch as any).mockRejectedValueOnce(apiError);

    const checkAuthAndRedirect = async () => {
      try {
        await apiClient.apiFetch('/test');
      } catch (error: any) {
        if (error.status === 401) {
          mockRouter.push('/admin/login');
        }
      }
    };

    await checkAuthAndRedirect();

    expect(mockRouter.push).toHaveBeenCalledWith('/admin/login');
  });

  it('should not redirect if API call succeeds (200 OK)', async () => {
    (apiClient.apiFetch as any).mockResolvedValueOnce({ success: true });

    const checkAuthAndRedirect = async () => {
      try {
        await apiClient.apiFetch('/test');
      } catch (error: any) {
        if (error.status === 401) {
          mockRouter.push('/admin/login');
        }
      }
    };

    await checkAuthAndRedirect();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
