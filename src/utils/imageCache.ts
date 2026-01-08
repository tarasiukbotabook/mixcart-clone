/**
 * Image caching utility for localStorage
 * Stores product images in browser cache to avoid repeated downloads
 */

const CACHE_PREFIX = "product-image-";
const CACHE_VERSION = "v1";

export const imageCache = {
  /**
   * Get image from cache
   */
  get: (productId: string): string | null => {
    try {
      const key = `${CACHE_PREFIX}${productId}`;
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Failed to read from cache:", e);
      return null;
    }
  },

  /**
   * Set image in cache
   */
  set: (productId: string, imageData: string): boolean => {
    try {
      const key = `${CACHE_PREFIX}${productId}`;
      localStorage.setItem(key, imageData);
      return true;
    } catch (e) {
      console.warn("Failed to write to cache:", e);
      return false;
    }
  },

  /**
   * Clear specific image from cache
   */
  remove: (productId: string): void => {
    try {
      const key = `${CACHE_PREFIX}${productId}`;
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Failed to remove from cache:", e);
    }
  },

  /**
   * Clear all product images from cache
   */
  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn("Failed to clear cache:", e);
    }
  },

  /**
   * Get cache size in bytes
   */
  getSize: (): number => {
    try {
      let size = 0;
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          const value = localStorage.getItem(key);
          if (value) {
            size += value.length;
          }
        }
      });
      return size;
    } catch (e) {
      console.warn("Failed to calculate cache size:", e);
      return 0;
    }
  },

  /**
   * Get number of cached images
   */
  getCount: (): number => {
    try {
      const keys = Object.keys(localStorage);
      return keys.filter((key) => key.startsWith(CACHE_PREFIX)).length;
    } catch (e) {
      console.warn("Failed to count cached images:", e);
      return 0;
    }
  },
};
