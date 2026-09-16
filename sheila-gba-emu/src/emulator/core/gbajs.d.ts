export interface GBARom {
  title: string;
  code: string;
  maker: string;
  size?: number;
}

export interface GBAKeypad {
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
  keyboard: any;
  registerHandlers(): void;
  reassignKey(name: string, key: number): void;
}

export interface GBAAudio {
  masterVolume: number;
  pause(paused: boolean): void;
  context: AudioContext;
}

export interface GBAVideo {
  drawCallback: () => void;
  clear(): void;
}

export declare class GameBoyAdvance {
  LOG_ERROR: number;
  LOG_WARN: number;
  LOG_STUB: number;
  LOG_INFO: number;
  LOG_DEBUG: number;
  rom: GBARom | null;
  keypad: GBAKeypad;
  audio: GBAAudio;
  video: GBAVideo;
  cpu: any;
  mmu: any;

  constructor();
  setCanvas(canvas: HTMLCanvasElement): void;
  setCanvasDirect(canvas: HTMLCanvasElement): void;
  setBios(bios: ArrayBuffer, real?: boolean): void;
  setRom(rom: ArrayBuffer): void;
  loadRomFromFile(romFile: File, callback: (result: boolean) => void): void;
  reset(): void;
  step(): void;
  pause(): void;
  advanceFrame(): void;
  setSavedata(data: ArrayBuffer): void;
  loadSavedataFromFile(saveFile: File): void;
  downloadSavedata(): void;
  freeze(): any;
  defrost(frost: any): void;
  setLogger(logger: (level: number, message: string) => void): void;
}

export declare const biosBin: ArrayBuffer;
export default GameBoyAdvance;
