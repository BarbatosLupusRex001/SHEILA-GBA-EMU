import React, { useState, useEffect } from 'react';
import { EmulatorSettings, ControllerMapping } from '../types';
import { Gamepad2, Keyboard, Smartphone, Check, RefreshCw, Cpu } from 'lucide-react';

interface ControllerConfigProps {
  settings: EmulatorSettings;
  onUpdateSettings: (settings: EmulatorSettings) => void;
  onOpenTouchEditor: () => void;
}

export const ControllerConfig: React.FC<ControllerConfigProps> = ({
  settings,
  onUpdateSettings,
  onOpenTouchEditor,
}) => {
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [activeGamepadIndex, setActiveGamepadIndex] = useState<number | null>(null);
  const [pressedButtons, setPressedButtons] = useState<number[]>([]);

  useEffect(() => {
    let animId: number;

    const scanGamepads = () => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gps = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
        setGamepads(gps);
        if (gps.length > 0 && activeGamepadIndex === null) {
          setActiveGamepadIndex(gps[0].index);
        }

        if (activeGamepadIndex !== null && gps[activeGamepadIndex]) {
          const gp = gps[activeGamepadIndex];
          const pressed: number[] = [];
          gp.buttons.forEach((btn, idx) => {
            if (btn.pressed) pressed.push(idx);
          });
          setPressedButtons(pressed);
        }
      }
      animId = requestAnimationFrame(scanGamepads);
    };

    animId = requestAnimationFrame(scanGamepads);
    return () => cancelAnimationFrame(animId);
  }, [activeGamepadIndex]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#1f2533] pb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-indigo-400" />
          <span>Controller Settings & Input Mapping</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Configure physical Bluetooth/USB gamepads, on-screen touch controls, and keyboard bindings.
        </p>
      </div>

      {/* 3 Input Methods Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gamepad Card */}
        <div className="bg-[#121620] border border-[#212937] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Physical Gamepad</h3>
              <span className="text-[11px] text-zinc-400">
                {gamepads.length > 0 ? `${gamepads.length} connected` : 'None detected'}
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Xbox, DualShock/DualSense, Nintendo Switch Pro, and standard 8BitDo controllers are plug-and-play.
          </p>
        </div>

        {/* Touch Controls Card */}
        <div className="bg-[#121620] border border-[#212937] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">On-Screen Touch Layout</h3>
              <span className="text-[11px] text-zinc-400">Multi-Touch & Haptics</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Customize D-Pad and button positions, scale, opacity, and tactile haptic vibration response.
          </p>
          <button
            onClick={onOpenTouchEditor}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Open Touch Layout Editor
          </button>
        </div>

        {/* Keyboard Card */}
        <div className="bg-[#121620] border border-[#212937] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Keyboard Bindings</h3>
              <span className="text-[11px] text-zinc-400">Standard Desktop Layout</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Instant zero-latency input using Z/X (A/B), A/S (L/R), Enter/Shift (Start/Select), and Space (Speed).
          </p>
        </div>
      </div>

      {/* Gamepad Input Monitor */}
      <div className="bg-[#11151e] border border-[#222937] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Gamepad Live Signal Monitor</span>
          </h3>
          {gamepads.length === 0 && (
            <span className="text-xs text-amber-400 font-mono">
              Press any button on your controller to connect
            </span>
          )}
        </div>

        {gamepads.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Detected Controller:</span>
              <span className="text-xs font-mono text-indigo-300 font-bold bg-[#181d27] px-3 py-1 rounded-lg border border-[#242b38]">
                {gamepads[activeGamepadIndex || 0]?.id || 'Standard Gamepad'}
              </span>
            </div>

            {/* Visualizer Buttons */}
            <div>
              <span className="text-xs text-zinc-400 block mb-2">Active Button Signals:</span>
              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-2">
                {Array.from({ length: 16 }).map((_, i) => {
                  const isPressed = pressedButtons.includes(i);
                  return (
                    <div
                      key={i}
                      className={`p-2 rounded-xl text-center font-mono text-xs border transition-all ${
                        isPressed
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105'
                          : 'bg-[#181d27] border-[#252c3c] text-zinc-500'
                      }`}
                    >
                      B{i}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-[#0b0e14] rounded-xl border border-[#1b2230] text-zinc-500 text-xs">
            Connect a Bluetooth or USB gamepad, then press any button to begin testing.
          </div>
        )}
      </div>

      {/* Keyboard Default Map Table */}
      <div className="bg-[#11151e] border border-[#222937] rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Default Keyboard Mapping</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#181d27] rounded-xl border border-[#242b38] flex justify-between">
            <span className="text-zinc-400">GBA A Button</span>
            <span className="font-mono text-indigo-300 font-bold">Z / K</span>
          </div>
          <div className="p-3 bg-[#181d27] rounded-xl border border-[#242b38] flex justify-between">
            <span className="text-zinc-400">GBA B Button</span>
            <span className="font-mono text-indigo-300 font-bold">X / J</span>
          </div>
          <div className="p-3 bg-[#181d27] rounded-xl border border-[#242b38] flex justify-between">
            <span className="text-zinc-400">GBA L Trigger</span>
            <span className="font-mono text-indigo-300 font-bold">A / Q</span>
          </div>
          <div className="p-3 bg-[#181d27] rounded-xl border border-[#242b38] flex justify-between">
            <span className="text-zinc-400">GBA R Trigger</span>
            <span className="font-mono text-indigo-300 font-bold">S / E</span>
          </div>
          <div className="p-3 bg-[#181d27] rounded-xl border border-[#242b38] flex justify-between">
            <span className="text-zinc-400">D-Pad Directions</span>
            <span className="font-mono text-indigo-300 font-bold">Arrow Keys</span>
          </div>
          <div className="p-3 bg-[#181d27] rounded-xl border border-[#242b38] flex justify-between">
            <span className="text-zinc-400">START</span>
            <span className="font-mono text-indigo-300 font-bold">Enter</span>
          </div>
          <div className="p-3 bg-[#181d27] rounded-xl border border-[#242b38] flex justify-between">
            <span className="text-zinc-400">SELECT</span>
            <span className="font-mono text-indigo-300 font-bold">Shift</span>
          </div>
          <div className="p-3 bg-[#181d27] rounded-xl border border-[#242b38] flex justify-between">
            <span className="text-zinc-400">Fast Forward</span>
            <span className="font-mono text-indigo-300 font-bold">Spacebar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
