export class PersistanceService {
  constructor() {
    console.log("[core service] PersistanceService initialized.");
  }

  save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  load<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
    return null;
  }

  clear() {
    localStorage.clear();
  }
}

export const persistanceService = new PersistanceService();
