import { Game, SaveState, BatterySave, Cheat, EmulatorSettings, ControllerMapping } from '../types';
import { PRELOADED_HOMEBREW_GAMES } from '../data/homebrewGames';

const GAMES_KEY = 'sheila_gba_games';
const ACTIVE_GAME_KEY = 'sheila_active_game_id';
const SETTINGS_KEY = 'sheila_gba_settings';
const CHEATS_KEY = 'sheila_gba_cheats';
const SAVESTATES_KEY = 'sheila_gba_save_states';
const BATTERY_SAVES_KEY = 'sheila_gba_battery_saves';
const CONTROLLER_MAP_KEY = 'sheila_gba_controller_map';

export const DEFAULT_SETTINGS: EmulatorSettings = {
  general: {
    confirmOnExit: true,
    autoSaveBattery: true,
  },
  video: {
    aspectRatio: '3:2',
    scaling: 'pixelated',
    integerScaling: false,
    filter: 'none',
  },
  audio: {
    volume: 85,
    muted: false,
  },
  emulation: {
    fastForwardSpeed: 2,
    frameSkip: 0,
  },
  controls: {
    touchLayout: {
      dpad: { x: 14, y: 72, scale: 1.0 },
      actionButtons: { x: 84, y: 72, scale: 1.0 },
      shoulderButtons: { x: 50, y: 8, scale: 1.0 },
      systemButtons: { x: 50, y: 88, scale: 1.0 },
      opacity: 0.65,
      haptics: true,
    },
    hapticsEnabled: true,
  },
  ai: {
    enableOnlineSearch: true,
  },
};

// IndexedDB database for ROM binaries
const DB_NAME = 'sheila_gba_roms_db';
const STORE_NAME = 'rom_blobs';

function openRomDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRomBlob(gameId: string, buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await openRomDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(buffer, gameId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save ROM blob to IndexedDB:', err);
  }
}

export async function getRomBlob(gameId: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openRomDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(gameId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get ROM blob from IndexedDB:', err);
    return null;
  }
}

export async function deleteRomBlob(gameId: string): Promise<void> {
  try {
    const db = await openRomDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(gameId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete ROM blob from IndexedDB:', err);
  }
}

// Games List
export function getSavedGames(): Game[] {
  try {
    const data = localStorage.getItem(GAMES_KEY);
    if (!data) {
      saveGames(PRELOADED_HOMEBREW_GAMES);
      return PRELOADED_HOMEBREW_GAMES;
    }
    const games: Game[] = JSON.parse(data);
    // Ensure homebrews are present
    const existingIds = new Set(games.map(g => g.id));
    let updated = false;
    for (const h of PRELOADED_HOMEBREW_GAMES) {
      if (!existingIds.has(h.id)) {
        games.push(h);
        updated = true;
      }
    }
    if (updated) {
      saveGames(games);
    }
    return games;
  } catch {
    return PRELOADED_HOMEBREW_GAMES;
  }
}

export function saveGames(games: Game[]): void {
  try {
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  } catch (err) {
    console.error('Failed to save games list:', err);
  }
}

export function getActiveGameId(): string | null {
  return localStorage.getItem(ACTIVE_GAME_KEY) || 'homebrew-frogtris';
}

export function setActiveGameId(id: string): void {
  localStorage.setItem(ACTIVE_GAME_KEY, id);
}

// Settings
export function getSettings(): EmulatorSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: EmulatorSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// Cheats
export function getCheats(): Cheat[] {
  try {
    const data = localStorage.getItem(CHEATS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCheats(cheats: Cheat[]): void {
  try {
    localStorage.setItem(CHEATS_KEY, JSON.stringify(cheats));
  } catch (err) {
    console.error('Failed to save cheats:', err);
  }
}

// Save States
export function getSaveStates(): SaveState[] {
  try {
    const data = localStorage.getItem(SAVESTATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSaveStates(states: SaveState[]): void {
  try {
    localStorage.setItem(SAVESTATES_KEY, JSON.stringify(states));
  } catch (err) {
    console.error('Failed to save save states:', err);
  }
}

// Battery Saves
export function getBatterySaves(): Record<string, BatterySave> {
  try {
    const data = localStorage.getItem(BATTERY_SAVES_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveBatterySave(save: BatterySave): void {
  try {
    const all = getBatterySaves();
    all[save.gameId] = save;
    localStorage.setItem(BATTERY_SAVES_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save battery save:', err);
  }
}

// Controller Map
export function getControllerMapping(): ControllerMapping | null {
  try {
    const data = localStorage.getItem(CONTROLLER_MAP_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveControllerMapping(mapping: ControllerMapping): void {
  try {
    localStorage.setItem(CONTROLLER_MAP_KEY, JSON.stringify(mapping));
  } catch (err) {
    console.error('Failed to save controller mapping:', err);
  }
}
