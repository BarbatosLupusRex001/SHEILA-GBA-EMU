import React, { useRef, useEffect, useState, useCallback } from 'react';
import { emulatorInstance, EmulatorStats } from '../emulator/GBAEmulator';
import { TouchControls } from './TouchControls';
import { TouchLayoutEditor } from './TouchLayoutEditor';
import { Game, EmulatorSettings, SaveState } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Camera,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  Gamepad,
  Save,
  Download,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface EmulatorScreenProps {
  activeGame: Game | null;
  settings: EmulatorSettings;
  onUpdateSettings: (settings: EmulatorSettings) => void;
  onSaveState: (state: SaveState) => void;
  onQuickLoadRequested?: () => SaveState | null;
  onSelectGameTab: () => void;
}

export const EmulatorScreen: React.FC<EmulatorScreenProps> = ({
  activeGame,
  settings,
  onUpdateSettings,
  onSaveState,
  onQuickLoadRequested,
  onSelectGameTab,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [stats, setStats] = useState<EmulatorStats>({
    fps: 0,
    speedMultiplier: 1,
    status: 'idle',
    gameTitle: '',
  });

  const [isFastForward, setIsFastForward] = useState(false);
  const [isMuted, setIsMuted] = useState(settings.audio.muted);
  const [showTouchControls, setShowTouchControls] = useState(true);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Setup Canvas & Core
  useEffect(() => {
    if (!canvasRef.current) return;
    const initialized = emulatorInstance.init(canvasRef.current);
    if (!initialized) {
      showToast('Failed to initialize GBA core');
    }

    emulatorInstance.onStats((newStats) => {
      setStats(newStats);
    });

    emulatorInstance.onError((err) => {
      showToast(`Emulator: ${err}`);
    });

    return () => {
      emulatorInstance.stop();
    };
  }, []);

  // Update volume / settings
  useEffect(() => {
    emulatorInstance.setVolume(settings.audio.volume);
    emulatorInstance.setMuted(isMuted);
    emulatorInstance.setFrameSkip(settings.emulation.frameSkip);
  }, [settings.audio.volume, isMuted, settings.emulation.frameSkip]);

  // Handle Gamepad polling
  useEffect(() => {
    let animationId: number;

    const pollGamepads = () => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0];
        if (gp && gp.connected) {
          if (!gamepadConnected) setGamepadConnected(true);

          // Map buttons: 0=A, 1=B, 8=SELECT, 9=START, 4=L, 5=R, 12=UP, 13=DOWN, 14=LEFT, 15=RIGHT
          if (gp.buttons[0]?.pressed) emulatorInstance.pressKey('A'); else emulatorInstance.releaseKey('A');
          if (gp.buttons[1]?.pressed) emulatorInstance.pressKey('B'); else emulatorInstance.releaseKey('B');
          if (gp.buttons[8]?.pressed) emulatorInstance.pressKey('SELECT'); else emulatorInstance.releaseKey('SELECT');
          if (gp.buttons[9]?.pressed) emulatorInstance.pressKey('START'); else emulatorInstance.releaseKey('START');
          if (gp.buttons[4]?.pressed) emulatorInstance.pressKey('L'); else emulatorInstance.releaseKey('L');
          if (gp.buttons[5]?.pressed) emulatorInstance.pressKey('R'); else emulatorInstance.releaseKey('R');
          if (gp.buttons[12]?.pressed) emulatorInstance.pressKey('UP'); else emulatorInstance.releaseKey('UP');
          if (gp.buttons[13]?.pressed) emulatorInstance.pressKey('DOWN'); else emulatorInstance.releaseKey('DOWN');
          if (gp.buttons[14]?.pressed) emulatorInstance.pressKey('LEFT'); else emulatorInstance.releaseKey('LEFT');
          if (gp.buttons[15]?.pressed) emulatorInstance.pressKey('RIGHT'); else emulatorInstance.releaseKey('RIGHT');

          // Axes
          const x = gp.axes[0] || 0;
          const y = gp.axes[1] || 0;
          if (x < -0.5) emulatorInstance.pressKey('LEFT');
          if (x > 0.5) emulatorInstance.pressKey('RIGHT');
          if (y < -0.5) emulatorInstance.pressKey('UP');
          if (y > 0.5) emulatorInstance.pressKey('DOWN');
        } else {
          if (gamepadConnected) setGamepadConnected(false);
        }
      }
      animationId = requestAnimationFrame(pollGamepads);
    };

    animationId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animationId);
  }, [gamepadConnected]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing when in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'KeyZ':
        case 'KeyK':
          emulatorInstance.pressKey('A');
          break;
        case 'KeyX':
        case 'KeyJ':
          emulatorInstance.pressKey('B');
          break;
        case 'KeyA':
        case 'KeyQ':
          emulatorInstance.pressKey('L');
          break;
        case 'KeyS':
        case 'KeyE':
          emulatorInstance.pressKey('R');
          break;
        case 'Enter':
          emulatorInstance.pressKey('START');
          break;
        case 'ShiftRight':
        case 'ShiftLeft':
          emulatorInstance.pressKey('SELECT');
          break;
        case 'ArrowUp':
          emulatorInstance.pressKey('UP');
          break;
        case 'ArrowDown':
          emulatorInstance.pressKey('DOWN');
          break;
        case 'ArrowLeft':
          emulatorInstance.pressKey('LEFT');
          break;
        case 'ArrowRight':
          emulatorInstance.pressKey('RIGHT');
          break;
        case 'Space':
          e.preventDefault();
          toggleFastForward();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'KeyZ':
        case 'KeyK':
          emulatorInstance.releaseKey('A');
          break;
        case 'KeyX':
        case 'KeyJ':
          emulatorInstance.releaseKey('B');
          break;
        case 'KeyA':
        case 'KeyQ':
          emulatorInstance.releaseKey('L');
          break;
        case 'KeyS':
        case 'KeyE':
          emulatorInstance.releaseKey('R');
          break;
        case 'Enter':
          emulatorInstance.releaseKey('START');
          break;
        case 'ShiftRight':
        case 'ShiftLeft':
          emulatorInstance.releaseKey('SELECT');
          break;
        case 'ArrowUp':
          emulatorInstance.releaseKey('UP');
          break;
        case 'ArrowDown':
          emulatorInstance.releaseKey('DOWN');
          break;
        case 'ArrowLeft':
          emulatorInstance.releaseKey('LEFT');
          break;
        case 'ArrowRight':
          emulatorInstance.releaseKey('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const toggleFastForward = () => {
    const nextState = !isFastForward;
    setIsFastForward(nextState);
    emulatorInstance.setFastForward(nextState, settings.emulation.fastForwardSpeed);
    showToast(nextState ? `Fast Forward ${settings.emulation.fastForwardSpeed}x Active` : 'Normal Speed');
  };

  const handlePauseResume = () => {
    if (stats.status === 'running') {
      emulatorInstance.pause();
      showToast('Emulation Paused');
    } else {
      emulatorInstance.resume();
      showToast('Emulation Resumed');
    }
  };

  const handleReset = () => {
    emulatorInstance.reset();
    showToast('Game Reset');
  };

  const handleQuickSave = () => {
    if (!activeGame) {
      showToast('No game loaded to save');
      return;
    }
    const state = emulatorInstance.freezeState();
    if (state) {
      const screenshotUrl = emulatorInstance.takeScreenshot();
      const saveObj: SaveState = {
        id: `save-${activeGame.id}-slot-1`,
        gameId: activeGame.id,
        slot: 1,
        timestamp: Date.now(),
        screenshotUrl,
        stateData: JSON.stringify(state),
      };
      onSaveState(saveObj);
      showToast('Quick Save created in Slot 1');
    } else {
      showToast('Failed to create save state');
    }
  };

  const handleQuickLoad = () => {
    if (!onQuickLoadRequested) return;
    const saveState = onQuickLoadRequested();
    if (saveState && saveState.stateData) {
      try {
        const parsed = JSON.parse(saveState.stateData);
        const success = emulatorInstance.defrostState(parsed);
        if (success) {
          showToast(`Quick Load: Slot ${saveState.slot} restored`);
        } else {
          showToast('Failed to restore save state');
        }
      } catch (err) {
        showToast('Corrupted save state format');
      }
    } else {
      showToast('No Save State found in Slot 1');
    }
  };

  const handleScreenshot = () => {
    const url = emulatorInstance.takeScreenshot();
    if (!url) {
      showToast('Screenshot failed');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeGame?.title || 'GBA'}_screenshot_${Date.now()}.png`;
    a.click();
    showToast('Screenshot saved to downloads');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Video aspect ratio styling
  const getAspectRatioClasses = () => {
    switch (settings.video.aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case 'fill':
        return 'w-full h-full';
      case '3:2':
      default:
        return 'aspect-[3/2]';
    }
  };

  const getFilterClasses = () => {
    switch (settings.video.filter) {
      case 'scanlines':
        return 'after:absolute after:inset-0 after:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] after:bg-[length:100%_4px] after:pointer-events-none';
      case 'lcd':
        return 'after:absolute after:inset-0 after:bg-[radial-gradient(#000000_1px,transparent_1px)] after:bg-[length:3px_3px] after:pointer-events-none after:opacity-40';
      default:
        return '';
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-between w-full h-[calc(100vh-5rem)] max-h-[920px] bg-[#090b10] relative select-none p-2 sm:p-4 overflow-hidden"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-950/90 border border-indigo-500/50 text-indigo-100 text-xs font-semibold px-4 py-2 rounded-full shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control HUD Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between bg-[#121620] border border-[#212938] rounded-xl px-3 py-2 z-30 shadow-md">
        {/* Left: Playback controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePauseResume}
            className={`p-2 rounded-lg transition-colors ${
              stats.status === 'running'
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={stats.status === 'running' ? 'Pause' : 'Resume'}
          >
            {stats.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFastForward}
            className={`p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-mono font-bold ${
              isFastForward
                ? 'bg-amber-600 text-white shadow-lg scale-105'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
            title={`Fast Forward (${settings.emulation.fastForwardSpeed}x)`}
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">{settings.emulation.fastForwardSpeed}x</span>
          </button>
        </div>

        {/* Center: Save State Quick Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleQuickSave}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            title="Quick Save (Slot 1)"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Save</span>
          </button>

          <button
            onClick={handleQuickLoad}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            title="Quick Load (Slot 1)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Load</span>
          </button>

          <button
            onClick={handleScreenshot}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Capture Screenshot"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Audio, Fullscreen & Controls */}
        <div className="flex items-center gap-1.5">
          {gamepadConnected && (
            <div
              className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded-md"
              title="Physical Gamepad Connected"
            >
              <Gamepad className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[10px]">PAD 1</span>
            </div>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowTouchControls(!showTouchControls)}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors hidden sm:block"
            title={showTouchControls ? 'Hide Touch Controls' : 'Show Touch Controls'}
          >
            {showTouchControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowLayoutEditor(true)}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors hidden sm:block"
            title="Customize Touch Layout"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Gameplay Screen Area */}
      <div className="flex-1 w-full max-w-4xl flex items-center justify-center relative my-2 overflow-hidden">
        {/* Bezel Container */}
        <div
          className={`relative max-w-full max-h-full flex items-center justify-center p-2 rounded-2xl bg-[#0f131a] border-2 border-[#202735] shadow-2xl ${getFilterClasses()}`}
        >
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={240}
            height={160}
            className={`w-full max-w-[680px] max-h-[453px] bg-black rounded-lg shadow-inner ${getAspectRatioClasses()} ${
              settings.video.scaling === 'pixelated' ? 'image-render-pixelated' : ''
            }`}
            style={{
              imageRendering: settings.video.scaling === 'pixelated' ? 'pixelated' : 'auto',
            }}
          />

          {/* No Game Empty State */}
          {!activeGame && (
            <div className="absolute inset-0 bg-[#0c0e14]/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                <Gamepad className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-base">No GBA Game Loaded</h3>
              <p className="text-zinc-400 text-xs max-w-sm">
                Choose a preloaded homebrew game or import your own legal .gba ROM file to begin playing.
              </p>
              <button
                onClick={onSelectGameTab}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-colors"
              >
                Browse Games Library
              </button>
            </div>
          )}
        </div>

        {/* Touch Controls Overlay */}
        <TouchControls layout={settings.controls.touchLayout} visible={showTouchControls} />
      </div>

      {/* Keyboard Shortcuts Helper Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[11px] text-zinc-400 bg-[#0e1118] border border-[#1b212c] px-3 py-1.5 rounded-lg z-20">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="font-semibold text-zinc-300">Keyboard Controls:</span>
          <span><strong className="text-zinc-200">Z/K</strong>: A</span>
          <span><strong className="text-zinc-200">X/J</strong>: B</span>
          <span><strong className="text-zinc-200">A/Q</strong>: L</span>
          <span><strong className="text-zinc-200">S/E</strong>: R</span>
          <span><strong className="text-zinc-200">Enter</strong>: Start</span>
          <span><strong className="text-zinc-200">Shift</strong>: Select</span>
          <span><strong className="text-zinc-200">Space</strong>: 2x Fast-Forward</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 font-mono text-zinc-400 text-[10px]">
          <span>GBA Native 240x160</span>
        </div>
      </div>

      {/* Touch Layout Editor Modal */}
      {showLayoutEditor && (
        <TouchLayoutEditor
          layout={settings.controls.touchLayout}
          onChange={(newLayout) => {
            onUpdateSettings({
              ...settings,
              controls: { ...settings.controls, touchLayout: newLayout },
            });
          }}
          onClose={() => setShowLayoutEditor(false)}
        />
      )}
    </div>
  );
};
