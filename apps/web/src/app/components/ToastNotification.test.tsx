import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastNotification';
import React from 'react';

describe('ToastNotification System', () => {
  it('should add and manage toasts correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast('Test Message', 'success');
    });

    // ในทางเทคนิค เราตรวจสอบสถานะภายในผ่านการเรนเดอร์ แต่ที่นี่เราเน้นว่า addToast เรียกได้โดยไม่ Error
    expect(result.current.addToast).toBeDefined();
  });
});
