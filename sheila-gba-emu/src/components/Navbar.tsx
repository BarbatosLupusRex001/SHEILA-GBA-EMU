import React from 'react';
import { MainTab } from '../types';
import { WolfIcon } from './WolfIcon';
import {
  Gamepad2,
  FolderOpen,
  History,
  Star,
  Save,
  Wand2,
  Sliders,
  Settings as SettingsIcon,
  Bot,
  Package,
} from 'lucide-react';

interface NavbarProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  activeGameTitle?: string;
  fps?: number;
  speedMultiplier?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeGameTitle,
  fps = 0,
  speedMultiplier = 1,
}) => {
  const tabs = [
    { id: 'emulator' as MainTab, label: 'Emulator', icon: Gamepad2 },
    { id: 'games' as MainTab, label: 'Games', icon: FolderOpen },
    { id: 'recent' as MainTab, label: 'Recent', icon: History },
    { id: 'favorites' as MainTab, label: 'Favorites', icon: Star },
    { id: 'saves' as MainTab, label: 'Saves', icon: Save },
    { id: 'cheats' as MainTab, label: 'Cheats', icon: Wand2 },
    { id: 'controllers' as MainTab, label: 'Controllers', icon: Sliders },
    { id: 'settings' as MainTab, label: 'Settings', icon: SettingsIcon },
    { id: 'sheila-ai' as MainTab, label: 'SHEILA AI', icon: Bot, highlight: true },
    { id: 'android-export' as MainTab, label: 'Android / APK', icon: Package },
  ];

  return (
    <header className="bg-[#0b0d13] border-b border-[#1f2430] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
            onClick={() => onSelectTab('emulator')}
          >
            <WolfIcon size={38} />
            <div className="flex flex-col">
              <span className="text-white font-bold tracking-wider text-base sm:text-lg leading-tight flex items-center gap-1.5">
                SHEILA <span className="text-[#a5b4fc] text-xs px-1.5 py-0.5 rounded bg-[#1e2330] border border-[#2e3648] font-mono">GBA EMU</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider hidden sm:inline">
                HIGH PERFORMANCE ADVANCE CORE
              </span>
            </div>
          </div>

          {/* Active Game & Performance Status */}
          {activeGameTitle && (
            <div className="hidden md:flex items-center gap-3 bg-[#131720] border border-[#222938] px-3 py-1 rounded-full text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium truncate max-w-[180px]">{activeGameTitle}</span>
              <span className="text-zinc-500">|</span>
              <span className="font-mono text-emerald-400">{fps} FPS</span>
              {speedMultiplier > 1 && (
                <span className="font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-800/50">
                  {speedMultiplier}x
                </span>
              )}
            </div>
          )}

          {/* Action / Help indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('sheila-ai')}
              className="flex items-center gap-1.5 text-xs bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium hidden sm:inline">SHEILA AI</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Scrollable on small mobile) */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 -mb-px border-t border-[#171b24]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                } ${tab.highlight && !isActive ? 'text-indigo-300 hover:text-indigo-200' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
