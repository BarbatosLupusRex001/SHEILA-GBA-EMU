import React from 'react';
import { TouchLayoutConfig } from '../types';
import { DEFAULT_SETTINGS } from '../utils/storage';
import { RotateCcw, Sliders, Smartphone, Check } from 'lucide-react';

interface TouchLayoutEditorProps {
  layout: TouchLayoutConfig;
  onChange: (layout: TouchLayoutConfig) => void;
  onClose: () => void;
}

export const TouchLayoutEditor: React.FC<TouchLayoutEditorProps> = ({
  layout,
  onChange,
  onClose,
}) => {
  const handleReset = () => {
    onChange({ ...DEFAULT_SETTINGS.controls.touchLayout });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151d] border border-[#242b38] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-[#212734] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">Touch Controller Layout Editor</h3>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs">
          {/* Opacity */}
          <div>
            <div className="flex justify-between mb-1.5 text-zinc-300">
              <span className="font-medium">Button Opacity</span>
              <span className="font-mono text-indigo-400">{Math.round(layout.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={layout.opacity}
              onChange={(e) => onChange({ ...layout, opacity: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* D-Pad Scale & Position */}
          <div className="bg-[#181d27] p-3 rounded-xl border border-[#222938] space-y-2.5">
            <div className="flex justify-between text-zinc-300 font-semibold">
              <span>D-Pad Scale</span>
              <span className="font-mono text-indigo-400">{layout.dpad.scale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={layout.dpad.scale}
              onChange={(e) =>
                onChange({
                  ...layout,
                  dpad: { ...layout.dpad, scale: parseFloat(e.target.value) },
                })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Horizontal (X %)</label>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={layout.dpad.x}
                  onChange={(e) =>
                    onChange({
                      ...layout,
                      dpad: { ...layout.dpad, x: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Vertical (Y %)</label>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={layout.dpad.y}
                  onChange={(e) =>
                    onChange({
                      ...layout,
                      dpad: { ...layout.dpad, y: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons Scale & Position */}
          <div className="bg-[#181d27] p-3 rounded-xl border border-[#222938] space-y-2.5">
            <div className="flex justify-between text-zinc-300 font-semibold">
              <span>A / B Buttons Scale</span>
              <span className="font-mono text-indigo-400">{layout.actionButtons.scale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={layout.actionButtons.scale}
              onChange={(e) =>
                onChange({
                  ...layout,
                  actionButtons: { ...layout.actionButtons, scale: parseFloat(e.target.value) },
                })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Horizontal (X %)</label>
                <input
                  type="range"
                  min="65"
                  max="95"
                  value={layout.actionButtons.x}
                  onChange={(e) =>
                    onChange({
                      ...layout,
                      actionButtons: { ...layout.actionButtons, x: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Vertical (Y %)</label>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={layout.actionButtons.y}
                  onChange={(e) =>
                    onChange({
                      ...layout,
                      actionButtons: { ...layout.actionButtons, y: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Haptics toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#181d27] border border-[#222938] cursor-pointer">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span className="font-medium text-zinc-200">Haptic Vibration on Tap</span>
            </div>
            <input
              type="checkbox"
              checked={layout.haptics}
              onChange={(e) => onChange({ ...layout, haptics: e.target.checked })}
              className="rounded accent-indigo-600 w-4 h-4"
            />
          </label>
        </div>

        {/* Done Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Apply Layout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
