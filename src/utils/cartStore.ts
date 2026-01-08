/**
 * Локальное хранилище корзины для оптимистичного обновления
 * Позволяет мгновенно обновлять количество товаров в UI
 * и синхронизировать с БД в фоне
 */

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  supplierName?: string;
}

const CART_STORAGE_KEY = "local_cart";

export const cartStore = {
  /**
   * Получить локальную корзину
   */
  getCart: (): Record<string, CartItem> => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn("Failed to read cart from storage:", e);
      return {};
    }
  },

  /**
   * Обновить количество товара в локальной корзине
   */
  updateQuantity: (productId: string, quantity: number, price: number, name?: string, supplierName?: string): CartItem | null => {
    try {
      const cart = cartStore.getCart();
      
      if (quantity <= 0) {
        delete cart[productId];
      } else {
        cart[productId] = { 
          productId, 
          quantity, 
          price,
          name: name || cart[productId]?.name,
          supplierName: supplierName || cart[productId]?.supplierName,
        };
      }
      
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      return cart[productId] || null;
    } catch (e) {
      console.warn("Failed to update cart in storage:", e);
      return null;
    }
  },

  /**
   * Получить количество товара
   */
  getQuantity: (productId: string): number => {
    const cart = cartStore.getCart();
    return cart[productId]?.quantity || 0;
  },

  /**
   * Очистить локальную корзину
   */
  clear: (): void => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear cart from storage:", e);
    }
  },

  /**
   * Синхронизировать локальную корзину с серверной
   * Вызывается при загрузке страницы
   */
  syncWithServer: (serverCart: Record<string, CartItem>): void => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serverCart));
    } catch (e) {
      console.warn("Failed to sync cart with server:", e);
    }
  },
};
