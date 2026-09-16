import React, { useCallback } from 'react';
import { TouchLayoutConfig } from '../types';
import { emulatorInstance } from '../emulator/GBAEmulator';

interface TouchControlsProps {
  layout: TouchLayoutConfig;
  visible: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ layout, visible }) => {
  const triggerHaptic = useCallback(() => {
    if (layout.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
  }, [layout.haptics]);

  const handlePress = useCallback(
    (key: string, e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerHaptic();
      emulatorInstance.pressKey(key);
    },
    [triggerHaptic]
  );

  const handleRelease = useCallback((key: string, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    emulatorInstance.releaseKey(key);
  }, []);

  if (!visible) return null;

  const opacity = layout.opacity;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden"
      style={{ opacity }}
    >
      {/* Shoulder Buttons L & R */}
      <div
        className="absolute top-2 left-3 pointer-events-auto"
        style={{ transform: `scale(${layout.shoulderButtons.scale})`, transformOrigin: 'top left' }}
      >
        <button
          onTouchStart={(e) => handlePress('L', e)}
          onTouchEnd={(e) => handleRelease('L', e)}
          onMouseDown={(e) => handlePress('L', e)}
          onMouseUp={(e) => handleRelease('L', e)}
          className="w-20 h-10 bg-zinc-800/80 active:bg-indigo-600/80 border border-zinc-600/60 rounded-lg text-white font-bold text-sm tracking-wider flex items-center justify-center shadow-lg transition-transform active:scale-95 touch-none"
        >
          L
        </button>
      </div>

      <div
        className="absolute top-2 right-3 pointer-events-auto"
        style={{ transform: `scale(${layout.shoulderButtons.scale})`, transformOrigin: 'top right' }}
      >
        <button
          onTouchStart={(e) => handlePress('R', e)}
          onTouchEnd={(e) => handleRelease('R', e)}
          onMouseDown={(e) => handlePress('R', e)}
          onMouseUp={(e) => handleRelease('R', e)}
          className="w-20 h-10 bg-zinc-800/80 active:bg-indigo-600/80 border border-zinc-600/60 rounded-lg text-white font-bold text-sm tracking-wider flex items-center justify-center shadow-lg transition-transform active:scale-95 touch-none"
        >
          R
        </button>
      </div>

      {/* D-Pad (Left side) */}
      <div
        className="absolute pointer-events-auto"
        style={{
          left: `${layout.dpad.x}%`,
          top: `${layout.dpad.y}%`,
          transform: `translate(-50%, -50%) scale(${layout.dpad.scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="relative w-36 h-36">
          {/* Background Cross */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-36 bg-zinc-900/90 border border-zinc-700/80 rounded-xl" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-12 bg-zinc-900/90 border border-zinc-700/80 rounded-xl" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 bg-zinc-800/80 rounded-full border border-zinc-600/50" />
          </div>

          {/* UP */}
          <button
            onTouchStart={(e) => handlePress('UP', e)}
            onTouchEnd={(e) => handleRelease('UP', e)}
            onMouseDown={(e) => handlePress('UP', e)}
            onMouseUp={(e) => handleRelease('UP', e)}
            className="absolute top-0 left-12 w-12 h-12 flex items-center justify-center active:bg-indigo-600/60 rounded-t-xl touch-none"
            aria-label="Up"
          >
            <span className="text-zinc-300 font-bold text-lg">▲</span>
          </button>

          {/* DOWN */}
          <button
            onTouchStart={(e) => handlePress('DOWN', e)}
            onTouchEnd={(e) => handleRelease('DOWN', e)}
            onMouseDown={(e) => handlePress('DOWN', e)}
            onMouseUp={(e) => handleRelease('DOWN', e)}
            className="absolute bottom-0 left-12 w-12 h-12 flex items-center justify-center active:bg-indigo-600/60 rounded-b-xl touch-none"
            aria-label="Down"
          >
            <span className="text-zinc-300 font-bold text-lg">▼</span>
          </button>

          {/* LEFT */}
          <button
            onTouchStart={(e) => handlePress('LEFT', e)}
            onTouchEnd={(e) => handleRelease('LEFT', e)}
            onMouseDown={(e) => handlePress('LEFT', e)}
            onMouseUp={(e) => handleRelease('LEFT', e)}
            className="absolute top-12 left-0 w-12 h-12 flex items-center justify-center active:bg-indigo-600/60 rounded-l-xl touch-none"
            aria-label="Left"
          >
            <span className="text-zinc-300 font-bold text-lg">◀</span>
          </button>

          {/* RIGHT */}
          <button
            onTouchStart={(e) => handlePress('RIGHT', e)}
            onTouchEnd={(e) => handleRelease('RIGHT', e)}
            onMouseDown={(e) => handlePress('RIGHT', e)}
            onMouseUp={(e) => handleRelease('RIGHT', e)}
            className="absolute top-12 right-0 w-12 h-12 flex items-center justify-center active:bg-indigo-600/60 rounded-r-xl touch-none"
            aria-label="Right"
          >
            <span className="text-zinc-300 font-bold text-lg">▶</span>
          </button>
        </div>
      </div>

      {/* Action Buttons A & B (Right side) */}
      <div
        className="absolute pointer-events-auto"
        style={{
          left: `${layout.actionButtons.x}%`,
          top: `${layout.actionButtons.y}%`,
          transform: `translate(-50%, -50%) scale(${layout.actionButtons.scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="relative w-36 h-28">
          {/* B Button (lower/left) */}
          <button
            onTouchStart={(e) => handlePress('B', e)}
            onTouchEnd={(e) => handleRelease('B', e)}
            onMouseDown={(e) => handlePress('B', e)}
            onMouseUp={(e) => handleRelease('B', e)}
            className="absolute bottom-1 left-2 w-14 h-14 rounded-full bg-zinc-900/90 active:bg-rose-600/80 border-2 border-zinc-600/80 flex items-center justify-center shadow-lg transition-transform active:scale-95 touch-none"
          >
            <span className="text-white font-black text-xl">B</span>
          </button>

          {/* A Button (upper/right) */}
          <button
            onTouchStart={(e) => handlePress('A', e)}
            onTouchEnd={(e) => handleRelease('A', e)}
            onMouseDown={(e) => handlePress('A', e)}
            onMouseUp={(e) => handleRelease('A', e)}
            className="absolute top-1 right-2 w-14 h-14 rounded-full bg-zinc-900/90 active:bg-emerald-600/80 border-2 border-zinc-600/80 flex items-center justify-center shadow-lg transition-transform active:scale-95 touch-none"
          >
            <span className="text-white font-black text-xl">A</span>
          </button>
        </div>
      </div>

      {/* System Buttons (START & SELECT) */}
      <div
        className="absolute pointer-events-auto"
        style={{
          left: `${layout.systemButtons.x}%`,
          top: `${layout.systemButtons.y}%`,
          transform: `translate(-50%, -50%) scale(${layout.systemButtons.scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="flex items-center gap-6 bg-zinc-900/80 border border-zinc-700/60 px-4 py-1.5 rounded-full shadow-lg">
          <button
            onTouchStart={(e) => handlePress('SELECT', e)}
            onTouchEnd={(e) => handleRelease('SELECT', e)}
            onMouseDown={(e) => handlePress('SELECT', e)}
            onMouseUp={(e) => handleRelease('SELECT', e)}
            className="px-3 py-1 bg-zinc-800 active:bg-indigo-600 rounded text-[10px] font-bold text-zinc-300 active:text-white tracking-widest border border-zinc-700 touch-none uppercase"
          >
            Select
          </button>
          <button
            onTouchStart={(e) => handlePress('START', e)}
            onTouchEnd={(e) => handleRelease('START', e)}
            onMouseDown={(e) => handlePress('START', e)}
            onMouseUp={(e) => handleRelease('START', e)}
            className="px-3 py-1 bg-zinc-800 active:bg-indigo-600 rounded text-[10px] font-bold text-zinc-300 active:text-white tracking-widest border border-zinc-700 touch-none uppercase"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};
