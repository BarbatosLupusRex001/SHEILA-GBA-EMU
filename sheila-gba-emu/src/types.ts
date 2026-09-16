export interface Game {
  id: string;
  title: string;
  internalTitle: string;
  code: string;
  makerCode: string;
  fileSize: number;
  checksum: string;
  addedAt: number;
  lastPlayed?: number;
  playCount: number;
  isFavorite: boolean;
  source: 'homebrew' | 'user';
  homebrewPath?: string;
  description?: string;
  genre?: string;
  thumbnailUrl?: string;
}

export interface SaveState {
  id: string;
  gameId: string;
  slot: number; // 1 - 10
  timestamp: number;
  screenshotUrl?: string;
  stateData: string; // JSON or serialized state
}

export interface BatterySave {
  gameId: string;
  lastSaved: number;
  dataBase64: string;
}

export type CheatFormat = 'GameShark' | 'ActionReplay' | 'CodeBreaker' | 'Raw';
export type CheatStatus = 'ENABLED' | 'DISABLED' | 'INVALID';

export interface Cheat {
  id: string;
  gameId: string;
  name: string;
  code: string;
  format: CheatFormat;
  status: CheatStatus;
  enabled: boolean;
  description?: string;
}

export interface ControlPosition {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number; // 0.6 - 1.6
}

export interface TouchLayoutConfig {
  dpad: ControlPosition;
  actionButtons: ControlPosition; // A & B
  shoulderButtons: ControlPosition; // L & R
  systemButtons: ControlPosition; // START & SELECT
  opacity: number; // 0.2 - 1.0
  haptics: boolean;
}

export interface ControllerMapping {
  gamepadId: string;
  buttons: {
    A: number;
    B: number;
    SELECT: number;
    START: number;
    RIGHT: number;
    LEFT: number;
    UP: number;
    DOWN: number;
    R: number;
    L: number;
    FAST_FORWARD?: number;
    MENU?: number;
  };
}

export interface EmulatorSettings {
  general: {
    confirmOnExit: boolean;
    autoSaveBattery: boolean;
  };
  video: {
    aspectRatio: '3:2' | '16:9' | 'fill';
    scaling: 'pixelated' | 'smooth';
    integerScaling: boolean;
    filter: 'none' | 'scanlines' | 'lcd';
  };
  audio: {
    volume: number; // 0 - 100
    muted: boolean;
  };
  emulation: {
    fastForwardSpeed: 2 | 3 | 4 | 8;
    frameSkip: 0 | 1 | 2;
  };
  controls: {
    touchLayout: TouchLayoutConfig;
    hapticsEnabled: boolean;
  };
  ai: {
    enableOnlineSearch: boolean;
  };
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isSearching?: boolean;
  sources?: Array<{ title: string; url: string }>;
}

export type MainTab =
  | 'emulator'
  | 'games'
  | 'recent'
  | 'favorites'
  | 'saves'
  | 'cheats'
  | 'controllers'
  | 'settings'
  | 'sheila-ai'
  | 'android-export';
