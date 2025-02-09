export class SimpleStorage {
  private static instance: SimpleStorage;
  private storage: Map<string, any>;

  private constructor() {
    this.storage = new Map();
  }

  // Get the single instance of the class
  public static getInstance(): SimpleStorage {
    if (!SimpleStorage.instance) {
      SimpleStorage.instance = new SimpleStorage();
    }
    return SimpleStorage.instance;
  }

  // Add data to storage
  public add(key: string, value: any): void {
    this.storage.set(key, value);
  }

  // Remove data from storage
  public remove(key: string): boolean {
    return this.storage.delete(key);
  }

  // Get data by key
  public get(key: string): any | undefined {
    return this.storage.get(key);
  }

  // Check if a key exists
  public has(key: string): boolean {
    return this.storage.has(key);
  }

  // Clear all data
  public clear(): void {
    this.storage.clear();
  }
}
