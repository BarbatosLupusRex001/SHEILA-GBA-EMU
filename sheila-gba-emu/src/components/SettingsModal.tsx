import React, { useState } from 'react';
import { EmulatorSettings } from '../types';
import { WolfIcon } from './WolfIcon';
import {
  Settings as SettingsIcon,
  Monitor,
  Volume2,
  Cpu,
  Sliders,
  Bot,
  Info,
  RotateCcw,
  Check,
} from 'lucide-react';
import { DEFAULT_SETTINGS } from '../utils/storage';

interface SettingsModalProps {
  settings: EmulatorSettings;
  onUpdateSettings: (settings: EmulatorSettings) => void;
  onOpenTouchEditor: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onOpenTouchEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'emulation' | 'ai' | 'about'>('video');

  const handleReset = () => {
    if (confirm('Reset all emulator settings to default configuration?')) {
      onUpdateSettings(DEFAULT_SETTINGS);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1f2533] pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
            <span>Emulator Preferences</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Display scaling, audio fidelity, emulation multipliers, and SHEILA AI intelligence options.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Default Settings</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#202735] pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'video'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Video & Display</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'audio'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('emulation')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'emulation'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Emulation</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'ai'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>SHEILA AI</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'about'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>About & Licenses</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-[#11151e] border border-[#212937] rounded-2xl p-5 text-xs text-zinc-300 space-y-6">
        {/* Video Tab */}
        {activeTab === 'video' && (
          <div className="space-y-5">
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="font-semibold text-white block">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: '3:2', label: '3:2 Native (Recommended)', desc: 'Exact GBA 240x160 hardware ratio' },
                  { id: '16:9', label: '16:9 Widescreen', desc: 'Stretched modern widescreen' },
                  { id: 'fill', label: 'Stretch to Window', desc: 'Fills viewport completely' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        video: { ...settings.video, aspectRatio: item.id as any },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.video.aspectRatio === item.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-[#171c26] border-[#252d3c] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-xs block mb-1">{item.label}</span>
                    <span className="text-[11px] text-zinc-400 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scaling Mode */}
            <div className="space-y-2">
              <label className="font-semibold text-white block">Image Scaling Algorithm</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'pixelated', label: 'Pixel-Perfect (Nearest Neighbor)', desc: 'Sharp, razor-crisp retro pixels' },
                  { id: 'smooth', label: 'Bilinear Filter (Smooth)', desc: 'Softened anti-aliased texture edges' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        video: { ...settings.video, scaling: item.id as any },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.video.scaling === item.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-[#171c26] border-[#252d3c] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-xs block mb-1">{item.label}</span>
                    <span className="text-[11px] text-zinc-400 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Filters */}
            <div className="space-y-2">
              <label className="font-semibold text-white block">Post-Processing Screen Filter</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'none', label: 'Clean Original', desc: 'No shader or filter overlay' },
                  { id: 'scanlines', label: 'Retro Scanlines', desc: 'Subtle horizontal cathode-ray scanlines' },
                  { id: 'lcd', label: 'GBA LCD Grid', desc: 'Dot-matrix subpixel grid simulation' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        video: { ...settings.video, filter: item.id as any },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.video.filter === item.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-[#171c26] border-[#252d3c] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-xs block mb-1">{item.label}</span>
                    <span className="text-[11px] text-zinc-400 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audio Tab */}
        {activeTab === 'audio' && (
          <div className="space-y-5 max-w-md">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-white">Master Volume</span>
                <span className="font-mono text-indigo-400 font-bold">{settings.audio.volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.audio.volume}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    audio: { ...settings.audio, volume: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#181d27] border border-[#242b38] cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Mute Audio</span>
                <span className="text-[11px] text-zinc-400">Silences hardware sound channels</span>
              </div>
              <input
                type="checkbox"
                checked={settings.audio.muted}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    audio: { ...settings.audio, muted: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded accent-indigo-600"
              />
            </label>
          </div>
        )}

        {/* Emulation Tab */}
        {activeTab === 'emulation' && (
          <div className="space-y-5">
            <div>
              <label className="font-semibold text-white block mb-2">
                Fast-Forward Speed Multiplier
              </label>
              <div className="grid grid-cols-4 gap-3">
                {([2, 3, 4, 8] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        emulation: { ...settings.emulation, fastForwardSpeed: speed },
                      })
                    }
                    className={`py-2.5 rounded-xl border font-mono font-bold text-xs transition-all ${
                      settings.emulation.fastForwardSpeed === speed
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                        : 'bg-[#181d27] border-[#252d3c] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {speed}x Normal
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#181d27] border border-[#242b38] cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Auto-Save Battery SRAM</span>
                <span className="text-[11px] text-zinc-400">
                  Automatically syncs in-game cartridge saves to local storage
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.general.autoSaveBattery}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    general: { ...settings.general, autoSaveBattery: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded accent-indigo-600"
              />
            </label>
          </div>
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#181d27] border border-[#242b38] space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-white">SHEILA AI Intelligence</span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Powered by Google Gemini 3.8 Flash. Assists with game guides, cheat code lookups, GBA memory architectures, and Android APK deployment.
              </p>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#181d27] border border-[#242b38] cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Enable Google Search Grounding</span>
                <span className="text-[11px] text-zinc-400">
                  Allows SHEILA AI to look up live cheat codes and game secrets from the web
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.ai.enableOnlineSearch}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    ai: { ...settings.ai, enableOnlineSearch: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded accent-indigo-600"
              />
            </label>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#1f2635]">
              <WolfIcon size={44} />
              <div>
                <h3 className="font-bold text-white text-sm">SHEILA GBA EMU</h3>
                <span className="text-[11px] text-indigo-300 font-mono">v1.0.0 Release</span>
              </div>
            </div>

            <div className="space-y-2 text-[11px] text-zinc-400 leading-relaxed">
              <p>
                <strong className="text-zinc-200">Architecture:</strong> High-performance Game Boy Advance core utilizing ARM7TDMI 32-bit RISC processor emulation, hardware cycle timers, direct scanline software rasterization, and direct sound DMA audio synthesizers.
              </p>
              <p>
                <strong className="text-zinc-200">Homebrew Library:</strong> Includes legally licensed, open-source Game Boy Advance homebrew games: Frogtris, Gapman, Impact, and Tetravex.
              </p>
              <p>
                <strong className="text-zinc-200">Legal Disclaimer:</strong> Game Boy Advance is a registered trademark of Nintendo Co., Ltd. SHEILA GBA EMU is not affiliated with or endorsed by Nintendo. All game backups should be dumped from physical cartridges legally owned by the user.
              </p>
              <p>
                <strong className="text-zinc-200">Licenses:</strong> BSD-2-Clause & MIT Open Source Software.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
