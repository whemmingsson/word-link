export class PersistanceService {
  constructor() {}

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
}

export const persistanceService = new PersistanceService();
