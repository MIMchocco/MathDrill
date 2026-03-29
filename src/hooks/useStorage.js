const STORAGE_KEY = 'mathApp_data';
const SCHEMA_VERSION = 1;

export function useStorage() {
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        users: state.users,
        lastActiveUserId: state.activeUserId,
      }));
    } catch {
      // localStorage quota exceeded (e.g., Safari private mode): silently fail
    }
  }

  return { load, save };
}
