/**
 * Generic localStorage wrapper for string values
 */

export class GenericStringStorage {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}.${key}` : key;
  }

  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    
    try {
      return localStorage.getItem(this.getKey(key));
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  }

  set(key: string, value: string): void {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(this.getKey(key), value);
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
    }
  }

  remove(key: string): void {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  }

  clear(): void {
    if (typeof window === "undefined") return;
    
    try {
      if (this.prefix) {
        // Clear only keys with this prefix
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  }
}

