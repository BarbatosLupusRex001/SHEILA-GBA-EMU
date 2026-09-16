import GameBoyAdvance, { biosBin } from './core/gbajs';

export type EmulatorStatus = 'idle' | 'loading' | 'running' | 'paused' | 'error';

export interface EmulatorStats {
  fps: number;
  speedMultiplier: number;
  status: EmulatorStatus;
  gameTitle: string;
}

export class GBAEmulatorService {
  private gba: GameBoyAdvance | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private fastForward: boolean = false;
  private fastForwardMultiplier: number = 2;
  private frameSkip: number = 0;
  private currentFrame: number = 0;

  // FPS calculation
  private frameCount: number = 0;
  private lastFpsUpdate: number = performance.now();
  private currentFps: number = 0;

  // Callbacks
  private onStatsCallback?: (stats: EmulatorStats) => void;
  private onErrorCallback?: (err: string) => void;

  constructor() {
    this.gba = null;
  }

  public init(canvas: HTMLCanvasElement): boolean {
    try {
      this.canvas = canvas;
      this.gba = new GameBoyAdvance();
      this.gba.setCanvas(canvas);
      this.gba.setBios(biosBin);

      // Customize audio if context exists
      if (this.gba.audio && this.gba.audio.context) {
        if (this.gba.audio.context.state === 'suspended') {
          // Resume context on user interaction
          const resumeAudio = () => {
            this.gba?.audio.context.resume();
            window.removeEventListener('click', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
          };
          window.addEventListener('click', resumeAudio);
          window.addEventListener('keydown', resumeAudio);
        }
      }

      this.gba.setLogger((level: number, message: string) => {
        if (level === this.gba?.LOG_ERROR) {
          console.error('[GBA ERROR]', message);
          if (this.onErrorCallback) this.onErrorCallback(message);
        }
      });

      return true;
    } catch (err: any) {
      console.error('Failed to initialize GBA core:', err);
      if (this.onErrorCallback) this.onErrorCallback(err.message || 'Emulator initialization failed');
      return false;
    }
  }

  public async loadRom(buffer: ArrayBuffer, title: string = 'Game'): Promise<boolean> {
    try {
      this.stop();
      if (!this.gba) {
        throw new Error('Emulator not initialized.');
      }

      // Load ROM buffer into core
      this.gba.setRom(buffer);

      // Start loop
      this.start();
      return true;
    } catch (err: any) {
      console.error('Failed to load ROM:', err);
      if (this.onErrorCallback) this.onErrorCallback(`Failed to load ${title}: ${err.message}`);
      return false;
    }
  }

  public start(): void {
    if (!this.gba) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastFpsUpdate = performance.now();
    this.frameCount = 0;
    this.loop();
    this.notifyStats();
  }

  public pause(): void {
    this.isPaused = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.gba?.pause();
    this.notifyStats();
  }

  public resume(): void {
    if (!this.isRunning) {
      this.start();
      return;
    }
    this.isPaused = false;
    if (this.gba?.audio && this.gba.audio.context && this.gba.audio.context.state === 'suspended') {
      this.gba.audio.context.resume();
    }
    this.loop();
    this.notifyStats();
  }

  public reset(): void {
    if (!this.gba) return;
    this.gba.reset();
    this.resume();
  }

  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.gba) {
      this.gba.pause();
    }
    this.notifyStats();
  }

  public setFastForward(enabled: boolean, multiplier: number = 2): void {
    this.fastForward = enabled;
    this.fastForwardMultiplier = Math.max(2, Math.min(8, multiplier));
    this.notifyStats();
  }

  public setFrameSkip(skip: number): void {
    this.frameSkip = Math.max(0, Math.min(4, skip));
  }

  public setVolume(volume0to100: number): void {
    if (!this.gba?.audio) return;
    const clamped = Math.max(0, Math.min(1, volume0to100 / 100));
    this.gba.audio.masterVolume = clamped;
  }

  public setMuted(muted: boolean): void {
    if (!this.gba?.audio) return;
    this.gba.audio.pause(muted);
  }

  // Keypad controls
  public pressKey(keyName: string): void {
    if (!this.gba?.keypad) return;
    const keypad = this.gba.keypad;
    switch (keyName.toUpperCase()) {
      case 'A': keypad.A = 1; break;
      case 'B': keypad.B = 1; break;
      case 'SELECT': keypad.SELECT = 1; break;
      case 'START': keypad.START = 1; break;
      case 'RIGHT': keypad.RIGHT = 1; break;
      case 'LEFT': keypad.LEFT = 1; break;
      case 'UP': keypad.UP = 1; break;
      case 'DOWN': keypad.DOWN = 1; break;
      case 'R': keypad.R = 1; break;
      case 'L': keypad.L = 1; break;
    }
  }

  public releaseKey(keyName: string): void {
    if (!this.gba?.keypad) return;
    const keypad = this.gba.keypad;
    switch (keyName.toUpperCase()) {
      case 'A': keypad.A = 0; break;
      case 'B': keypad.B = 0; break;
      case 'SELECT': keypad.SELECT = 0; break;
      case 'START': keypad.START = 0; break;
      case 'RIGHT': keypad.RIGHT = 0; break;
      case 'LEFT': keypad.LEFT = 0; break;
      case 'UP': keypad.UP = 0; break;
      case 'DOWN': keypad.DOWN = 0; break;
      case 'R': keypad.R = 0; break;
      case 'L': keypad.L = 0; break;
    }
  }

  // Save states
  public freezeState(): any {
    if (!this.gba) return null;
    try {
      return this.gba.freeze();
    } catch (err) {
      console.error('Error freezing state:', err);
      return null;
    }
  }

  public defrostState(state: any): boolean {
    if (!this.gba || !state) return false;
    try {
      this.gba.defrost(state);
      return true;
    } catch (err) {
      console.error('Error defrosting state:', err);
      return false;
    }
  }

  // Battery Saves (SRAM/Flash/EEPROM)
  public exportBatterySave(): string | null {
    if (!this.gba?.mmu?.save) return null;
    try {
      const buffer = this.gba.mmu.save.buffer;
      if (!buffer) return null;
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (err) {
      console.error('Failed to export battery save:', err);
      return null;
    }
  }

  public importBatterySave(base64Data: string): boolean {
    if (!this.gba) return false;
    try {
      const binary = atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      this.gba.setSavedata(bytes.buffer);
      return true;
    } catch (err) {
      console.error('Failed to import battery save:', err);
      return false;
    }
  }

  // Screenshot
  public takeScreenshot(): string {
    if (!this.canvas) return '';
    try {
      return this.canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Screenshot capture failed:', err);
      return '';
    }
  }

  // Subscriptions
  public onStats(cb: (stats: EmulatorStats) => void): void {
    this.onStatsCallback = cb;
  }

  public onError(cb: (err: string) => void): void {
    this.onErrorCallback = cb;
  }

  private notifyStats(): void {
    if (!this.onStatsCallback) return;
    this.onStatsCallback({
      fps: this.currentFps,
      speedMultiplier: this.fastForward ? this.fastForwardMultiplier : 1,
      status: !this.isRunning ? 'idle' : this.isPaused ? 'paused' : 'running',
      gameTitle: this.gba?.rom?.title || 'No Game',
    });
  }

  private loop = (): void => {
    if (!this.isRunning || this.isPaused || !this.gba) return;

    const iterations = this.fastForward ? this.fastForwardMultiplier : 1;

    for (let i = 0; i < iterations; i++) {
      try {
        this.gba.advanceFrame();
      } catch (err) {
        console.error('GBA frame error:', err);
        break;
      }
    }

    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsUpdate;
    if (elapsed >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      this.notifyStats();
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  public destroy(): void {
    this.stop();
    this.gba = null;
    this.canvas = null;
  }
}

export const emulatorInstance = new GBAEmulatorService();
