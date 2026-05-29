import { describe, it, expect } from 'vitest';

describe('Order Calculation Logic', () => {
  it('should calculate the correct total price', () => {
    const cart = [
      { id: 1, price: 100 },
      { id: 2, price: 250 }
    ];
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    expect(total).toBe(350);
  });
});
